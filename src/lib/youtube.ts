/**
 * YouTube の配信状態を取得する共通ユーティリティ
 */

export interface LiveStatus {
  isLive: boolean;
  videoId: string | null;
}

/**
 * チャンネル ID から現在のライブ配信情報を取得する (oEmbed 方式)
 * API クォータを消費しません。
 */
export async function getLiveStatus(channelId: string, manualVideoId?: string): Promise<LiveStatus> {
  // 手動設定がある場合はそれを優先
  if (manualVideoId) {
    return { isLive: true, videoId: manualVideoId };
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/channel/${channelId}/live&format=json`;
    const res = await fetch(oembedUrl);
    
    if (res.ok) {
      const data = await res.json();
      const title = data.title || "";
      const html = data.html || "";
      
      // HTML 埋め込みコードから videoId を抽出
      const match = html.match(/embed\/([^?"]+)/);
      
      // タイトルに "Offline" が含まれておらず、videoId が見つかれば LIVE と判定
      if (match && !title.includes("Offline")) {
        return {
          isLive: true,
          videoId: match[1]
        };
      }
    }
  } catch (e) {
    console.error("Error fetching YouTube live status via oEmbed:", e);
  }

  return { isLive: false, videoId: null };
}
