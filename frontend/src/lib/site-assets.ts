export function siteAsset(path: string) {
  const base = typeof window === "undefined" ? "/" : window.__CHASKI__?.assetBase || "/";
  return base.replace(/\/?$/, "/") + path.replace(/^\/+/, "");
}
