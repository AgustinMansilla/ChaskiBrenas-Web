import { ChevronDown } from "lucide-react";
import { useSections } from "@/components/section-context";
import ContentImage from "@/components/content-image";
import Advertisements from "@/components/advertisements";
import PharmacyPanel from "@/components/pharmacy-panel";
import ServicePanel from "@/components/service-panel";

export function CustomSectionLinks({ onChoose }: { onChoose?: () => void }) {
  const { menu, groups } = useSections();
  const items = menu.items.filter(item => item.id.startsWith("seccion-") && item.public && groups[item.id]?.length);
  if (!items.length) return null;
  return <details className="relative min-w-0"><summary className="flex min-h-12 cursor-pointer list-none items-center justify-center gap-1 rounded px-3 font-serif text-base hover:bg-white/10">Más secciones<ChevronDown className="size-4 shrink-0"/></summary><div className="absolute right-0 z-[70] grid max-h-[60dvh] w-[min(18rem,80vw)] gap-1 overflow-auto rounded-md border border-white/20 bg-[#075389] p-2 shadow-xl">{items.map(item => <a key={item.id} href={`/#${item.id}`} onClick={event => { event.currentTarget.closest("details")?.removeAttribute("open"); onChoose?.(); }} className="rounded px-3 py-3 text-sm font-bold break-words hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white">{item.label}</a>)}</div></details>;
}

export default function CustomPublicSections() {
  const { menu, groups } = useSections();
  return <div className="grid min-w-0 gap-5">{menu.items.filter(item => item.id.startsWith("seccion-") && item.public && groups[item.id]?.length).map(item => {
    const posts = groups[item.id];
    if (item.type === "publicidad") return <div key={item.id} id={item.id} className="mb-5 scroll-mt-5"><Advertisements posts={posts} title={item.label}/></div>;
    return <section key={item.id} id={item.id} className="mb-5 min-w-0 scroll-mt-5 rounded-md border border-[#dce6e1] bg-white p-4 shadow-sm"><h2 className="mb-3 break-words text-lg font-black uppercase tracking-wide text-[#164B7A]">{item.label}</h2><div className={`grid min-w-0 gap-4 ${item.type === "noticia" ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2"}`}>{posts.map(post => item.type === "noticia" ? <a key={post.id} href={`/noticias/${encodeURIComponent(post.slug)}`} className="group min-w-0"><ContentImage src={post.imageUrl} alt="" className="aspect-[3/2] w-full rounded-md object-cover"/><h3 className="mt-2 font-serif text-xl font-bold leading-tight text-[#123d5d] group-hover:text-[#075389]">{post.title}</h3><p className="mt-2 line-clamp-2 text-sm text-[#60747d]">{post.summary}</p></a> : post.type === "servicio" && post.category === "Farmacias" ? <PharmacyPanel key={post.id} service={post}/> : <ServicePanel key={post.id} service={post}/>)}</div>{item.type === "noticia" && posts.length === 12 && <a className="mt-4 inline-flex min-h-11 items-center rounded-full border border-[#075389] px-5 text-sm font-bold text-[#075389]" href={`/?seccion=${encodeURIComponent(item.category)}#noticias`}>Ver todas las publicaciones de {item.label}</a>}</section>;
  })}</div>;
}
