globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CQ4muHDj.mjs";
import { h as addAttribute, l as renderHead, o as renderSlot, r as renderTemplate } from "./worker-entry_BzkmT11j.mjs";
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$BaseLayout;
  const { title, description = "osiri cooperation - ポータルサイト" } = Astro2.props;
  return renderTemplate`<html lang="ja" data-astro-cid-37fxchfa> <head><meta charset="UTF-8"><meta name="description"${addAttribute(description, "content")}><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${title} | osirico.dev</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">${renderHead()}</head> <body data-astro-cid-37fxchfa> <header class="main-header" data-astro-cid-37fxchfa> <nav class="container nav-content" data-astro-cid-37fxchfa> <a href="/" class="logo" data-astro-cid-37fxchfa> <span class="osirico" data-astro-cid-37fxchfa>osirico</span><span class="dev" data-astro-cid-37fxchfa>.dev</span> </a> <ul class="nav-links" data-astro-cid-37fxchfa> <li data-astro-cid-37fxchfa><a href="/live" data-astro-cid-37fxchfa>LIVE</a></li> <li data-astro-cid-37fxchfa><a href="/apps/web" data-astro-cid-37fxchfa>WEB APPS</a></li> </ul> </nav> </header> <main class="container" data-astro-cid-37fxchfa> ${renderSlot($$result, $$slots["default"])} </main> <footer class="container main-footer" data-astro-cid-37fxchfa> <p data-astro-cid-37fxchfa>&copy; 2026 osiri cooperation. Built with Astro & Premium Research.</p> </footer> </body> </html>`;
}, "C:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/layouts/BaseLayout.astro", void 0);
export {
  $$BaseLayout as $
};
