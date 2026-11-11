export type SitePost = {
  id: number;
  type: "noticia" | "publicidad" | "servicio" | "obituario";
  title: string;
  slug: string;
  summary: string;
  body: string;
  bodyHtml?: string;
  author: string;
  category: string;
  imageUrl: string;
  adWidth?: number;
  adHeight?: number;
  linkUrl?: string | null;
  status: "draft" | "scheduled" | "published" | "archived";
  featured: boolean;
  featuredOrder: number;
  urgent: boolean;
  publishAt: Date | null;
  expiresAt: Date | null;
  updatedAt: Date;
  deletedAt: Date | null;
  tags: string;
  location: string;
  source: string;
  photographer: string;
  imageCaption: string;
  gallery: string;
  focalX: number;
  focalY: number;
  published: boolean;
  createdAt: Date;
};

export function isPublicPost(post: SitePost, now = new Date()) {
  const publishTime = post.publishAt ? new Date(post.publishAt).getTime() : null;
  const expiryTime = post.expiresAt ? new Date(post.expiresAt).getTime() : null;
  const statusVisible = post.status === "published" || (post.status === "scheduled" && publishTime !== null && publishTime <= now.getTime());
  return post.published && statusVisible && !post.deletedAt && (publishTime === null || publishTime <= now.getTime()) && (expiryTime === null || expiryTime > now.getTime());
}

export function sortEditorial(posts: SitePost[]) {
  return [...posts].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.featured && b.featured && a.featuredOrder !== b.featuredOrder) return a.featuredOrder - b.featuredOrder;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(date));
}
