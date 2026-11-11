import { isPublicPost, type SitePost } from "@/lib/posts";

export function getCoverNews(news: SitePost[]) {
  const published = news.filter((post) => post.type === "noticia" && isPublicPost(post));
  const automatic = [...published].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);
  const ids = new Set(automatic.map((post) => post.id));
  const additional = published.filter((post) => post.featured && !ids.has(post.id)).sort((a, b) => a.featuredOrder - b.featuredOrder).slice(0, 1);
  return [...automatic, ...additional];
}

export function wrapCoverIndex(index: number, count: number) {
  return count > 0 ? ((index % count) + count) % count : 0;
}
