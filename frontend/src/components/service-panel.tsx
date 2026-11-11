"use client";

import { useRef, useState } from "react";
import { HeartHandshake, PhoneCall } from "lucide-react";
import ContentImage from "@/components/content-image";
import CommunityTrigger from "@/components/community-trigger";
import { TelephoneCard } from "@/components/telephone-panel";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { SitePost } from "@/lib/posts";
import { publicServiceCopy } from "@/lib/service-copy";
import { isTelephoneService } from "@/lib/telephone-directory";
import { recordContentView } from "@/lib/view-tracking";

export default function ServicePanel({ service }: { service: SitePost }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const telephone = isTelephoneService(service), obituary = service.type === "obituario";
  const summary = publicServiceCopy(service.summary), body = publicServiceCopy(service.body);
  const description = telephone ? "Consultar teléfonos de servicios e instituciones" : obituary ? "Abrir el aviso completo" : "Consultar información y contactos";
  const openContent = () => { setOpen(true); void recordContentView(service.id); };
  return <>
    <CommunityTrigger title={service.title} description={description} image={!telephone && service.imageUrl ? service.imageUrl : undefined} icon={obituary ? <HeartHandshake/> : <PhoneCall/>} onOpen={openContent} expanded={open} buttonRef={trigger}/>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent onCloseAutoFocus={event => { event.preventDefault(); trigger.current?.focus(); }} className="community-dialog max-h-[90dvh] overflow-y-auto sm:max-w-[650px]"><DialogHeader><DialogTitle>{service.title}</DialogTitle><DialogDescription>{summary || (telephone ? "Teléfonos útiles de Las Breñas." : "Información de la comunidad.")}</DialogDescription></DialogHeader>
      {telephone ? <TelephoneCard body={service.body}/> : <>
        {service.imageUrl && <ContentImage src={service.imageUrl} alt={service.title} className="h-auto max-h-[65dvh] w-full rounded-lg bg-white object-contain"/>}
        {body && <p className="whitespace-pre-line text-base leading-relaxed text-[#405d6e]">{body}</p>}
        {!body && !summary && !service.imageUrl && <p className="rounded-lg border p-4 text-sm">No hay más información disponible.</p>}
      </>}
    </DialogContent></Dialog>
  </>;
}
