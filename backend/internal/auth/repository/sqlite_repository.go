package repository

import (
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/vgbhj/draftdle/internal/auth"
	"github.com/vgbhj/draftdle/internal/models"
)

type AuthRepository struct {
	db *sqlx.DB
}

func NewAuthRepository(db *sqlx.DB) auth.Repository {
	return &AuthRepository{
		db: db,
	}
}

func (r *AuthRepository) UpsertUser(user *models.User) (*models.User, error) {
	query := `
	INSERT INTO users (tg_id, username, first_name, photo_url)
	VALUES ($1, $2, $3, $4)
	ON CONFLICT(tg_id) DO UPDATE SET
		username = excluded.username,
		first_name = excluded.first_name,
		photo_url = excluded.photo_url
	RETURNING id, tg_id, username, first_name, photo_url`

	var saved models.User
	err := r.db.Get(&saved, query, user.TgID, user.Username, user.FirstName, user.PhotoURL)
	if err != nil {
		return nil, err
	}
	return &saved, nil
}

func (r *AuthRepository) CreateSession(token string, userID int64, expiresAt time.Time) error {
	query := `INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)`

	_, err := r.db.Exec(query, token, userID, expiresAt.Unix())
	return err
}

func (r *AuthRepository) GetUserBySessionToken(token string) (*models.User, error) {
	query := `
	SELECT u.id, u.tg_id, u.username, u.first_name, u.photo_url
	FROM sessions s
	JOIN users u ON u.id = s.user_id
	WHERE s.token = $1 AND s.expires_at > $2`

	var user models.User
	err := r.db.Get(&user, query, token, time.Now().Unix())
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *AuthRepository) DeleteSession(token string) error {
	_, err := r.db.Exec(`DELETE FROM sessions WHERE token = $1`, token)
	return err
}

func (r *AuthRepository) DeleteExpiredSessions() error {
	_, err := r.db.Exec(`DELETE FROM sessions WHERE expires_at <= $1`, time.Now().Unix())
	return err
}
