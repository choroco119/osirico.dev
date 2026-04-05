import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const windowsApps = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/windows-apps" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    version: z.string(),
    downloadUrl: z.string(),
    repoUrl: z.string().optional(),
    icon: z.string(),
    publishDate: z.coerce.date().optional(),
  }),
});

export const collections = {
  'windows-apps': windowsApps,
};
