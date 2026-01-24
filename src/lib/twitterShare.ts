/**
 * Generates a Twitter Web Intent URL for sharing content
 */
export function generateTwitterShareUrl(options: {
  text: string;
  url?: string;
  hashtags?: string[];
  via?: string;
}): string {
  const { text, url, hashtags, via } = options;
  
  const params = new URLSearchParams();
  params.set("text", text);
  
  if (url) {
    params.set("url", url);
  }
  
  if (hashtags && hashtags.length > 0) {
    params.set("hashtags", hashtags.join(","));
  }
  
  if (via) {
    params.set("via", via);
  }
  
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/**
 * Generates a Twitter Quote Tweet Intent URL
 */
export function generateQuoteTweetUrl(options: {
  text: string;
  quoteTweetUrl: string;
  hashtags?: string[];
}): string {
  const { text, quoteTweetUrl, hashtags } = options;
  
  const params = new URLSearchParams();
  params.set("text", text);
  params.set("url", quoteTweetUrl);
  
  if (hashtags && hashtags.length > 0) {
    params.set("hashtags", hashtags.join(","));
  }
  
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/**
 * Opens Twitter share in a new window with optimal dimensions
 */
export function openTwitterShare(url: string): void {
  const width = 550;
  const height = 420;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;
  
  window.open(
    url,
    "twitter-share",
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
  );
}
