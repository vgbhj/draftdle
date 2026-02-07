/**
 * Хелпер для URL картинок героев с CDN Steam/Dota 2.
 * Принимает системное имя героя (hero_name из API) и возвращает прямую ссылку.
 *
 * Форматы Valve:
 * - icon: маленькие иконки (для списка)
 * - vertical: вертикальные карты (меню выбора)
 * - horizontal: горизонтальные (классические)
 */

import type { Hero } from '../types/api';

const CDN_BASE = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images';

export type HeroImageSize = 'icon' | 'vertical' | 'horizontal';

/**
 * Возвращает URL картинки героя на CDN Steam по системному имени.
 * @param heroName — системное имя героя из API (например antimage, nevermore, windrunner)
 * @param size — формат: icon (по умолчанию), vertical, horizontal
 */
export function getHeroImageUrl(
  heroName: string,
  size: HeroImageSize = 'icon'
): string {
  if (!heroName.trim()) {
    return '/placeholder-hero.svg';
  }
  const name = heroName.trim();
  switch (size) {
    case 'vertical':
      return `${CDN_BASE}/dota_react/heroes/${name}.png`;
    case 'horizontal':
      return `${CDN_BASE}/heroes/${name}_lg.png`;
    case 'icon':
    default:
      return `${CDN_BASE}/dota_react/heroes/icons/${name}.png`;
  }
}

/**
 * Вариант для объекта Hero: подставляет hero.nameInternal в getHeroImageUrl.
 * Если у героя задано hero.image — возвращается оно.
 */
export function getHeroImageUrlFromHero(hero: Hero, size?: HeroImageSize): string {
  if (hero.image) return hero.image;
  const name = hero.nameInternal ?? '';
  return getHeroImageUrl(name, size ?? 'icon');
}
