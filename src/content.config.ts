import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

// Translations live side by side: `site/<locale>.json`, `services/<locale>/<slug>.md`,
// `posts/<locale>/<slug>.md`. A translation keeps the same file name in every locale.

const text = z.object({ title: z.string(), text: z.string() })

/** Every text on the site that isn't a page of its own, one file per language. */
const site = defineCollection({
  loader: glob({ base: './src/content/site', pattern: '*.json' }),
  schema: z.object({
    nav: z.object({ home: z.string(), about: z.string(), services: z.string(), blog: z.string(), contact: z.string() }),
    cta: z.string(),
    hero: z.object({ eyebrow: z.string(), title: z.string(), text: z.string(), primary: z.string(), secondary: z.string() }),
    features: z.array(text),
    about: z.object({ title: z.string(), intro: z.string(), body: z.string() }),
    services: z.object({ title: z.string(), intro: z.string(), more: z.string() }),
    blog: z.object({ title: z.string(), intro: z.string(), readMore: z.string() }),
    contact: z.object({
      title: z.string(),
      intro: z.string(),
      phone: z.string(),
      email: z.string(),
      address: z.string(),
      form: z.object({ name: z.string(), email: z.string(), message: z.string(), send: z.string() }),
    }),
    footer: z.object({ tagline: z.string(), rights: z.string() }),
    notFound: text,
  }),
})

/** Company details shared by every language. */
const settings = defineCollection({
  loader: glob({ base: './src/content/settings', pattern: '*.json' }),
  schema: z.object({ brand: z.string(), phone: z.string(), email: z.string(), address: z.string() }),
})

const services = defineCollection({
  loader: glob({ base: './src/content/services', pattern: '**/*.md' }),
  schema: z.object({ title: z.string(), description: z.string(), order: z.number().default(0) }),
})

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.md' }),
  schema: z.object({ title: z.string(), description: z.string(), publishedAt: z.coerce.date() }),
})

export const collections = { site, settings, services, posts }
