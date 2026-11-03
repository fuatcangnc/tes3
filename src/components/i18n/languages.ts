/**
 * Languages of the current page, for LanguageSwitcher and Hreflang (added by WuppyCMS).
 * Everything comes from astro.config's `i18n` (locales, defaultLocale, routing), so the
 * switcher and hreflang tags follow Configure site → Languages with no list to keep in sync.
 */
import { base, build, i18n, trailingSlash } from "astro:config/client";

export type Language = {
  /** URL folder (Astro locale path). */
  path: string;
  /** BCP 47 tag for hreflang / lang: pt-br → pt-BR, zh-hant → zh-Hant. */
  tag: string;
  /** Same page in this language (root-relative). Untranslated pages reach Astro's fallback. */
  url: string;
  default: boolean;
  current: boolean;
  /** A page file exists for it (or `translated` says so): only these go in hreflang. */
  translated: boolean;
};

export const tag = (code: string) =>
  code
    .replace(/_/g, "-")
    .split("-")
    .map((p, i) => (i === 0 ? p.toLowerCase() : p.length === 4 ? p[0].toUpperCase() + p.slice(1).toLowerCase() : p.length === 2 ? p.toUpperCase() : p))
    .join("-");

const locales = (i18n?.locales ?? []).map((l) => (typeof l === "string" ? { path: l, code: l } : { path: l.path, code: l.codes[0] ?? l.path }));
const prefixDefault = typeof i18n?.routing === "object" && Boolean((i18n.routing as { prefixDefaultLocale?: boolean }).prefixDefaultLocale);

// Page routes as regexes. Fallback pages aren't files, so they never count as translations.
const routes = Object.keys(import.meta.glob("/src/pages/**/*.{astro,md,mdx,markdown,html}")).map((file) => {
  const route = file.replace(/^\/src\/pages/, "").replace(/\.[^.]+$/, "").replace(/\/index$/, "") || "/";
  const segments = route.split("/").filter(Boolean);
  const source = segments.map((s) => (/^\[\.\.\..+\]$/.test(s) ? "(?:/.*)?" : `/${s.replace(/\[[^\]]+\]/g, "[^/]+").replace(/[.+?^$()|{}]/g, "\\$&")}`)).join("");
  return { first: segments[0] ?? "", dynamicFirst: /^\[/.test(segments[0] ?? ""), deep: segments.length > 1, regex: new RegExp(`^${source || "/"}/?$`) };
});

/** Does a page file serve `pathname` (without base) for this locale? */
const hasPage = (pathname: string, locale: string, isDefault: boolean) =>
  routes.some((r) => {
    const own = r.first === locale;
    const other = !own && locales.some((l) => l.path === r.first);
    // Unprefixed default: any route outside the other locales' folders. Others: their own folder, or
    // a dynamic first folder (`[lang]/about`) when the route goes deeper than it.
    const fits = isDefault && !prefixDefault ? !other : own || (r.dynamicFirst && r.deep);
    return fits && r.regex.test(pathname);
  });

/**
 * The current page in every configured language. `translated`: the locale paths this page really
 * exists in (pages built from content collections should pass it); else page files decide.
 * Empty when i18n is off or the page is outside the locale structure.
 */
export const languages = (url: URL, translated?: string[]): Language[] => {
  if (!i18n || locales.length < 2) return [];
  const root = base === "/" ? "" : base.replace(/\/$/, "");
  const pathname = decodeURI(url.pathname.startsWith(root) ? url.pathname.slice(root.length) || "/" : url.pathname).replace(/\.html$/, "");
  const first = pathname.split("/")[1] ?? "";
  const current = locales.find((l) => l.path === first) ?? (prefixDefault ? undefined : locales.find((l) => l.path === i18n!.defaultLocale));
  if (!current) return [];
  const rest = current.path === first ? pathname.slice(first.length + 1) || "/" : pathname;
  // Keep the page's own trailing-slash style so hreflang URLs match its canonical URL.
  const slash = pathname === "/" ? trailingSlash === "always" || (trailingSlash !== "never" && build.format === "directory") : pathname.endsWith("/");
  const join = (p: string) => (p === "/" ? "/" : slash ? `${p.replace(/\/$/, "")}/` : p.replace(/\/$/, ""));
  return locales.map((l) => {
    const isDefault = l.path === i18n!.defaultLocale;
    const local = isDefault && !prefixDefault ? rest : `/${l.path}${rest === "/" ? "" : rest}` || "/";
    return {
      path: l.path,
      tag: tag(l.code),
      url: `${root}${join(local)}`,
      default: isDefault,
      current: l === current,
      translated: l === current || (translated ? translated.includes(l.path) : hasPage(local.replace(/\/$/, "") || "/", l.path, isDefault)),
    };
  });
};
