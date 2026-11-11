import { useSections } from "@/components/section-context";
import { sectionLabel } from "@/lib/sections";
import { HeartHandshake } from "lucide-react";
import ServicePanel from "@/components/service-panel";
import type { SitePost } from "@/lib/posts";

export default function ObituariesPanel({ posts }: { posts: SitePost[] }) {
  const { menu } = useSections();
  const obituaries = posts.filter(post => post.type === "obituario");
  return <section className="rounded-md border border-[#dce6e1] bg-white p-4 shadow-sm">
    <div className="mb-3 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-[#e8f4ed] text-[#3B9B68]"><HeartHandshake className="size-5"/></span><div><p className="text-xs font-black uppercase tracking-wide text-[#3B9B68]">Servicio a la comunidad</p><h2 className="text-xl font-black text-[#164B7A]">{sectionLabel(menu,"obituario")}</h2></div></div>
    {obituaries.length ? <div className="grid gap-3">{obituaries.map(item => <ServicePanel key={item.id} service={item}/>)}</div> : <p className="rounded bg-[#f3f8f5] p-3 text-sm text-[#60747d]">No hay obituarios el día de hoy.</p>}
  </section>;
}
