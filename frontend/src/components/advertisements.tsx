"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import type { SitePost } from "@/lib/posts";
import ContentImage from "@/components/content-image";
import { useSections } from "@/components/section-context";
import { sectionLabel } from "@/lib/sections";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { observeAdvertisement, recordContentView } from "@/lib/view-tracking";

function Advertisement({ ad }: { ad: SitePost }) {
  const card = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const width = Math.max(120, Math.min(1200, ad.adWidth || 300));
  const height = Math.max(120, Math.min(1200, ad.adHeight || 250));
  useEffect(() => card.current ? observeAdvertisement(card.current, ad.id) : undefined, [ad.id]);
  return <>
    <button ref={card} type="button" onClick={() => { setOpen(true); void recordContentView(ad.id); }} aria-label={`Ver publicidad de ${ad.title}`} style={{ maxWidth: width }} className="ads-card public-advertisement block w-full overflow-hidden rounded-md border border-[#d4ded9] bg-[#fbfdfc] text-left">
      <ContentImage src={ad.imageUrl} alt={`Publicidad de ${ad.title}`} className="block w-full bg-white object-contain" style={{ aspectRatio: `${width} / ${height}` }}/>
      <span className="block border-t border-[#e0e8e4] p-3"><strong className="block text-base leading-tight text-[#15344d]">{ad.title}</strong>{ad.summary && <small className="mt-1 block text-xs leading-relaxed text-[#6c7c83]">{ad.summary}</small>}</span>
    </button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent onCloseAutoFocus={event => { event.preventDefault(); card.current?.focus(); }} className="max-h-[92dvh] overflow-y-auto sm:max-w-[720px]"><DialogHeader><DialogTitle>{ad.title}</DialogTitle><DialogDescription>{ad.summary || "Publicidad de un comercio de nuestra comunidad."}</DialogDescription></DialogHeader><ContentImage src={ad.imageUrl} alt={`Publicidad de ${ad.title}`} className="h-auto max-h-[65dvh] w-full bg-white object-contain"/>{ad.linkUrl && <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#164B7A] px-4 py-3 font-bold text-white transition hover:bg-[#0e3557] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#164B7A]">Contactar al comercio <ExternalLink className="size-4"/></a>}</DialogContent></Dialog>
  </>;
}

export default function Advertisements({ posts, title }: { posts: SitePost[]; title?: string }) {
  const { menu } = useSections();
  const heading = title || sectionLabel(menu,"publicidad");
  const ads = posts.filter(post => post.type === "publicidad");
  if (!ads.length) return null;
  return <section className="ads-panel rounded-md border border-[#dce6e1] bg-white p-4 shadow-sm" aria-label={heading}><div className="mb-3 flex items-center gap-3"><h2 className="text-lg font-black uppercase tracking-wide text-[#164B7A]">{heading}</h2><div className="h-px flex-1 bg-[#3B9B68]"/></div><div className="ads-grid grid items-start gap-3">{ads.map(ad => <Advertisement key={ad.id} ad={ad}/>)}</div></section>;
}
