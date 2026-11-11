const contentRequests = new Map<number, { at: number; pending?: Promise<boolean> }>();
let pageRequest: Promise<boolean> | undefined;

export function recordContentView(id: number): Promise<boolean> {
  if (!Number.isSafeInteger(id) || id < 1) return Promise.resolve(false);
  const previous = contentRequests.get(id);
  if (previous?.pending) return previous.pending;
  if (previous && Date.now() - previous.at < 30 * 60 * 1000) return Promise.resolve(true);
  const pending = fetch(`/api/posts/${id}/view`, { method: "POST", keepalive: true })
    .then(response => { if (!response.ok) throw new Error("view unavailable"); contentRequests.set(id, { at: Date.now() }); return true; })
    .catch(() => { contentRequests.delete(id); return false; });
  contentRequests.set(id, { at: 0, pending });
  return pending;
}

export function recordPageView(page: "home" | "article"): Promise<boolean> {
  if (pageRequest) return pageRequest;
  const event = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`;
  pageRequest = fetch("/api/visit", { method: "POST", keepalive: true, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ page, event }) })
    .then(response => { if (!response.ok) throw new Error("visit unavailable"); return true; })
    .catch(() => { pageRequest = undefined; return false; });
  return pageRequest;
}


export function observeAdvertisement(element: Element, id: number): () => void {
  if (typeof IntersectionObserver === "undefined") return () => {};
  let visible = false, finished = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const clear = () => { if (timer !== undefined) clearTimeout(timer); timer = undefined; };
  const schedule = () => {
    clear();
    if (!visible || finished || document.visibilityState !== "visible") return;
    timer = setTimeout(() => { void recordContentView(id).then(ok => { if (ok) { finished = true; observer.disconnect(); document.removeEventListener("visibilitychange", schedule); } }); }, 1000);
  };
  const observer = new IntersectionObserver(entries => { const entry = entries[entries.length - 1]; visible = !!entry && entry.isIntersecting && entry.intersectionRatio >= .5; schedule(); }, { threshold: [.5] });
  observer.observe(element); document.addEventListener("visibilitychange", schedule);
  return () => { finished = true; clear(); observer.disconnect(); document.removeEventListener("visibilitychange", schedule); };
}
