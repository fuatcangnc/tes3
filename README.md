# Astro Tailwind Business Starter

A lean multilingual business site for WuppyCMS: home, about, services, blog and contact, written in
25 languages (en, de, fr, es, it, pt-br, ja, ko, zh-cn, zh-tw, ar, hi, ru, nl, sv, da, nb, fi, pl, tr,
cs, uk, id, th, vi). Built with Astro, Tailwind CSS v4 and bejamas/ui.

When WuppyCMS creates a site from this template it keeps only the languages you pick, removes the
others' content and writes them to `i18n` in `astro.config.mjs`.

## Content

| Collection | Files | What it holds |
| --- | --- | --- |
| `site` | `src/content/site/<locale>.json` | Menu, buttons, home, about, contact and footer texts |
| `settings` | `src/content/settings/site.json` | Company name, phone, email, address (all languages) |
| `services` | `src/content/services/<locale>/<slug>.md` | Service pages |
| `posts` | `src/content/posts/<locale>/<slug>.md` | Blog posts |

A translation keeps the same file name in every locale (`posts/de/welcome.md` translates
`posts/en/welcome.md`). Pages exist in a language when its `site/<locale>.json` exists and
`astro.config.mjs` lists the locale.

## Languages

`i18n` in `astro.config.mjs` decides the languages, the default one and whether it gets a URL prefix
(`/en/`). Pages live under `src/pages/[...locale]/`, so the default language is served at `/` and the
others at `/<locale>/`. The language switcher and hreflang tags come from `src/components/i18n/`
(the WuppyCMS language kit) and follow the same config. Arabic pages are right-to-left.

## Commands

```sh
pnpm install
pnpm dev
pnpm build
pnpm check
```
