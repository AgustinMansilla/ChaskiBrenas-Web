import { isPublicPost, type SitePost } from "@/lib/posts";


export function getNewsList(posts: SitePost[], category = "Inicio", query = "") {
  const term = query.trim().toLocaleLowerCase("es");
  return posts.filter(post => post.type === "noticia" && isPublicPost(post))
    .filter(post => category === "Inicio" || post.category === category)
    .filter(post => !term || `${post.title} ${post.summary} ${post.body} ${post.category} ${post.tags}`.toLocaleLowerCase("es").includes(term))
    .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() || b.id - a.id);
}
