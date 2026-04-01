globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CQ4muHDj.mjs";
import { n as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from "./worker-entry_BzkmT11j.mjs";
import { $ as $$BaseLayout } from "./BaseLayout_BxyMGie0.mjs";
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const webApps = [
    {
      id: "arcade-layout",
      title: "ARCADE CONTROLLER LAYOUT DESIGNER",
      desc: "アーケードコントローラーのレイアウトシミュレーションツール",
      path: "/apps/web/arcade-layout",
      icon: "🕹️"
    }
  ];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "WEB APPS", "data-astro-cid-ctxcuogd": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="apps-header" data-astro-cid-ctxcuogd> <h2 class="sub-title" data-astro-cid-ctxcuogd>TOOLBOX</h2> <h1 class="page-title" data-astro-cid-ctxcuogd>Web Applications</h1> <p class="intro" data-astro-cid-ctxcuogd>
ブラウザ上で動作する各種ツール
</p> </div> <div class="apps-grid" data-astro-cid-ctxcuogd> ${webApps.map((app) => renderTemplate`<a${addAttribute(app.path, "href")} class="app-card glass-panel glow-on-hover" data-astro-cid-ctxcuogd> <div class="app-icon" data-astro-cid-ctxcuogd>${app.icon}</div> <div class="app-info" data-astro-cid-ctxcuogd> <h3 data-astro-cid-ctxcuogd>${app.title}</h3> <p data-astro-cid-ctxcuogd>${app.desc}</p> </div> <div class="external-link" data-astro-cid-ctxcuogd>Launch Application ↗</div> </a>`)} </div> ` })}`;
}, "C:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/pages/apps/web/index.astro", void 0);
const $$file = "C:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/pages/apps/web/index.astro";
const $$url = "/apps/web";
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
