import { i18n } from 'astro:config/client'
import { getCollection, getEntry, type CollectionEntry } from 'astro:content'

const configured = (i18n?.locales ?? []).map((l) => (typeof l === 'string' ? l : l.path))
export const DEFAULT_LOCALE = i18n?.defaultLocale ?? configured[0] ?? 'en'
export const prefixDefault = typeof i18n?.routing === 'object' && Boolean((i18n.routing as { prefixDefaultLocale?: boolean }).prefixDefaultLocale)

/** Locales with a `site/<locale>.json` that astro.config also lists (all of them when i18n is off). */
export const locales = async () => {
  const ids = (await getCollection('site')).map((e) => e.id)
  return configured.length ? configured.filter((l) => ids.includes(l)) : ids.filter((l) => l === DEFAULT_LOCALE)
}

/** The `[...locale]` URL segment: none for the default locale unless it's prefixed. */
export const segment = (locale: string) => (locale === DEFAULT_LOCALE && !prefixDefault ? undefined : locale)

/** Root-relative link to `path` in `locale`. */
export const href = (locale: string, path = '/') => {
  const s = segment(locale)
  return s ? `/${s}${path === '/' ? '/' : path}` : path
}

/** getStaticPaths for pages under `[...locale]`. */
export const localePaths = async () => (await locales()).map((locale) => ({ params: { locale: segment(locale) }, props: { locale } }))

export const siteText = async (locale: string) => (await getEntry('site', locale))!.data
export const settings = async () => (await getEntry('settings', 'site'))!.data

/** Entries of a per-locale collection (`<locale>/<slug>`) in `locale`, with their slug. */
export const localized = async <C extends 'services' | 'posts'>(collection: C, locale: string) =>
  (await getCollection(collection, (e) => e.id.startsWith(`${locale}/`))).map((e) => ({ ...e, slug: e.id.slice(locale.length + 1) }) as CollectionEntry<C> & { slug: string })

/** Locales this entry (by slug) is translated into, for the language switcher and hreflang. */
export const translations = async (collection: 'services' | 'posts', slug: string) => {
  const ids = new Set((await getCollection(collection)).map((e) => e.id))
  return (await locales()).filter((l) => ids.has(`${l}/${slug}`))
}

/** getStaticPaths for `[...locale]/<collection>/[slug]` pages. */
export const entryPaths = async <C extends 'services' | 'posts'>(collection: C) =>
  (await Promise.all((await locales()).map(async (locale) => (await localized(collection, locale)).map((entry) => ({ params: { locale: segment(locale), slug: entry.slug }, props: { locale, entry } }))))).flat()

/** Right-to-left scripts among the supported languages. */
export const dir = (locale: string) => (['ar', 'fa', 'he', 'ur'].includes(locale.split('-')[0]) ? 'rtl' : 'ltr')
