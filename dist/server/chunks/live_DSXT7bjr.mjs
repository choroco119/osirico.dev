globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CQ4muHDj.mjs";
import { n as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from "./worker-entry_BzkmT11j.mjs";
import { $ as $$BaseLayout } from "./BaseLayout_BxyMGie0.mjs";
const $$Live = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Live;
  const runtime = Astro2.locals.runtime;
  const CHANNEL_ID = runtime?.env?.PUBLIC_YOUTUBE_CHANNEL_ID || "UCHEjZL0bhxNSBxIAjBuLe9Q";
  const API_KEY = runtime?.env?.YOUTUBE_API_KEY || "AIzaSyB1_csIuPYMzj9Y0hKParVcsK-v19J3OGY";
  const MANUALLY_SET_VIDEO_ID = runtime?.env?.PUBLIC_CURRENT_LIVE_ID || void 0;
  let isLive = false;
  let videoId = MANUALLY_SET_VIDEO_ID || null;
  if (!videoId) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&type=video&eventType=live&key=${API_KEY}`
      );
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        isLive = true;
        videoId = data.items[0].id.videoId;
      }
    } catch (e) {
    }
  } else if (videoId) {
    isLive = true;
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "LIVE", "data-astro-cid-4an7u5kh": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="streaming-container" data-astro-cid-4an7u5kh> <div class="status-header glass-panel" data-astro-cid-4an7u5kh> <div class="status-indicator" data-astro-cid-4an7u5kh> <span${addAttribute(`dot ${isLive ? "live" : "offline"}`, "class")} data-astro-cid-4an7u5kh></span> <span class="status-text" data-astro-cid-4an7u5kh>${isLive ? "ON AIR" : "OFFLINE"}</span> </div> <h2 class="stream-title" data-astro-cid-4an7u5kh> ${isLive ? "Currently Streaming" : "Live Stream Status"} </h2> </div> ${isLive ? renderTemplate`<div class="video-grid" data-astro-cid-4an7u5kh> <div class="video-wrapper glass-panel" data-astro-cid-4an7u5kh> <iframe width="100%" height="100%"${addAttribute(`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`, "src")} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen data-astro-cid-4an7u5kh></iframe> </div> <div class="chat-wrapper glass-panel" data-astro-cid-4an7u5kh> <div class="chat-header" data-astro-cid-4an7u5kh>LIVE CHAT</div> <iframe width="100%" height="100%"${addAttribute(`https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${Astro2.url.hostname}`, "src")} data-astro-cid-4an7u5kh></iframe> </div> </div>` : renderTemplate`<div class="offline-placeholder glass-panel flex-center" data-astro-cid-4an7u5kh> <div class="offline-content" data-astro-cid-4an7u5kh> <div class="offline-icon" data-astro-cid-4an7u5kh>📡</div> <h3 data-astro-cid-4an7u5kh>現在オフラインです</h3> <p data-astro-cid-4an7u5kh>配信は不定期に行われます。最新の活動状況や告知は YouTube チャンネルをご確認ください。</p> <div class="offline-links" data-astro-cid-4an7u5kh> <a${addAttribute(`https://www.youtube.com/channel/${CHANNEL_ID}`, "href")} class="btn-glow" data-astro-cid-4an7u5kh>YouTube チャンネルへ</a> </div> </div> </div>`} </div> ` })}`;
}, "C:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/pages/live.astro", void 0);
const $$file = "C:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/pages/live.astro";
const $$url = "/live";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Live,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
