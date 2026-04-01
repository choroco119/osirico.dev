globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CQ4muHDj.mjs";
import { n as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from "./worker-entry_BzkmT11j.mjs";
import { $ as $$BaseLayout } from "./BaseLayout_BxyMGie0.mjs";
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const apps = [
    { title: "LIVE STREAMING", desc: "YouTubeでのライブ配信とステータス表示", link: "/live", icon: "📺" },
    { title: "WEB APPS", desc: "ブラウザ上で動作する各種ツール", link: "/apps/web", icon: "🌐" }
  ];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "HOME", "data-astro-cid-j7pv25f6": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="hero" data-astro-cid-j7pv25f6> <div class="hero-content" data-astro-cid-j7pv25f6> <h2 class="sub-title" data-astro-cid-j7pv25f6>osiri cooperation</h2> <h1 class="main-title" data-astro-cid-j7pv25f6>osirico.dev</h1> <div class="glow-sphere" data-astro-cid-j7pv25f6></div> </div> </div> <section class="portal-grid" data-astro-cid-j7pv25f6> ${apps.map((app) => renderTemplate`<a${addAttribute(app.link, "href")} class="portal-card glass-panel glow-on-hover" data-astro-cid-j7pv25f6> <div class="card-icon" data-astro-cid-j7pv25f6>${app.icon}</div> <div class="card-body" data-astro-cid-j7pv25f6> <h3 data-astro-cid-j7pv25f6>${app.title}</h3> <p data-astro-cid-j7pv25f6>${app.desc}</p> </div> <div class="card-arrow" data-astro-cid-j7pv25f6>→</div> </a>`)} </section> ` })}`;
}, "C:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/pages/index.astro", void 0);
const $$file = "C:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/pages/index.astro";
const $$url = "";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
