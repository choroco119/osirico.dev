/**
 * YouTube の配信状態を取得する共通ユーティリティ
 */

export interface LiveStatus {
  isLive: boolean;
  videoId: string | null;
  title: string | null;
}

/**
 * チャンネル ID または特定の動画 ID から現在のライブ配信情報を取得する (oEmbed 方式)
 * API クォータを消費しません。
 */
export async function getLiveStatus(channelId: string, manualVideoId?: string): Promise<LiveStatus> {
  try {
    // URL の決定（手動指定ならその動画、なければチャンネルのライブURL）
    const targetUrl = manualVideoId 
      ? `https://www.youtube.com/watch?v=${manualVideoId}`
      : `https://www.youtube.com/channel/${channelId}/live`;

    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`;
    const res = await fetch(oembedUrl);
    
    if (res.ok) {
      const data = await res.json();
      const title = data.title || "";
      const html = data.html || "";
      
      // HTML 埋め込みコードから videoId を抽出
      const match = html.match(/embed\/([^?"]+)/);
      
      // タイトルに "Offline" が含まれておらず、videoId が見つかれば LIVE と判定
      // (手動指定の場合は ID があれば LIVE とみなす)
      if (match && (manualVideoId || !title.includes("Offline"))) {
        return {
          isLive: true,
          videoId: match[1],
          title: title
        };
      }
    }
  } catch (e) {
    console.error("Error fetching YouTube live status via oEmbed:", e);
  }

  return { isLive: false, videoId: null, title: null };
}
