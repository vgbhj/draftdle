package usecase

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/vgbhj/draftdle/internal/auth"
	"github.com/vgbhj/draftdle/internal/models"
)

const (
	sessionTTL = 30 * 24 * time.Hour
	maxAuthAge = 24 * time.Hour
)

var (
	ErrInvalidHash     = errors.New("telegram auth data has invalid hash")
	ErrAuthDataExpired = errors.New("telegram auth data is too old")
	ErrInvalidSession  = errors.New("session is missing or expired")
	ErrTokenNotSet     = errors.New("TELEGRAM_BOT_TOKEN is not configured")
)

type AuthUC struct {
	authRepo auth.Repository
	botToken string
}

func NewAuthUseCase(repo auth.Repository, botToken string) auth.AuthUC {
	return &AuthUC{
		authRepo: repo,
		botToken: botToken,
	}
}

func (u *AuthUC) LoginTelegram(data auth.TelegramAuthData) (*models.User, *auth.Session, error) {
	if u.botToken == "" {
		return nil, nil, ErrTokenNotSet
	}
	if !verifyTelegramHash(data, u.botToken) {
		return nil, nil, ErrInvalidHash
	}
	if time.Since(time.Unix(data.AuthDate, 0)) > maxAuthAge {
		return nil, nil, ErrAuthDataExpired
	}

	user, err := u.authRepo.UpsertUser(&models.User{
		TgID:      data.ID,
		Username:  data.Username,
		FirstName: data.FirstName,
		PhotoURL:  data.PhotoURL,
	})
	if err != nil {
		return nil, nil, err
	}

	token, err := newSessionToken()
	if err != nil {
		return nil, nil, err
	}
	expiresAt := time.Now().Add(sessionTTL)

	if err := u.authRepo.CreateSession(hashToken(token), user.ID, expiresAt); err != nil {
		return nil, nil, err
	}

	// Opportunistic cleanup so expired rows don't pile up.
	_ = u.authRepo.DeleteExpiredSessions()

	return user, &auth.Session{Token: token, ExpiresAt: expiresAt}, nil
}

func (u *AuthUC) Logout(token string) error {
	return u.authRepo.DeleteSession(hashToken(token))
}

func (u *AuthUC) Me(token string) (*models.User, error) {
	user, err := u.authRepo.GetUserBySessionToken(hashToken(token))
	if err != nil {
		return nil, ErrInvalidSession
	}
	return user, nil
}

// verifyTelegramHash checks the HMAC signature per
// https://core.telegram.org/widgets/login#checking-authorization.
// Fields absent in the widget payload must be excluded from the check string.
func verifyTelegramHash(data auth.TelegramAuthData, botToken string) bool {
	if data.Hash == "" {
		return false
	}

	pairs := make([]string, 0, 6)
	add := func(key, value string) {
		if value != "" {
			pairs = append(pairs, key+"="+value)
		}
	}
	add("auth_date", strconv.FormatInt(data.AuthDate, 10))
	add("first_name", data.FirstName)
	add("id", strconv.FormatInt(data.ID, 10))
	add("last_name", data.LastName)
	add("photo_url", data.PhotoURL)
	add("username", data.Username)
	sort.Strings(pairs)

	secret := sha256.Sum256([]byte(botToken))
	mac := hmac.New(sha256.New, secret[:])
	mac.Write([]byte(strings.Join(pairs, "\n")))
	expected := hex.EncodeToString(mac.Sum(nil))

	return hmac.Equal([]byte(expected), []byte(data.Hash))
}

func newSessionToken() (string, error) {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return hex.EncodeToString(buf), nil
}

// hashToken возвращает hex(SHA256(token)): в БД хранится только хеш,
// поэтому утечка dota.db не даёт действующих сессионных токенов.
func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}
