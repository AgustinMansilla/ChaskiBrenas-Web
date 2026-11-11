"use client";

import { useEffect, useRef, useState } from "react";
import { Pill } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { SitePost } from "@/lib/posts";
import CommunityTrigger from "@/components/community-trigger";
import ContentImage from "@/components/content-image";
import { recordContentView } from "@/lib/view-tracking";
import { argentinaDateKey, formatPharmacyDate, getPharmacyMonth, parsePharmacyShifts, pharmacyDetails, visiblePharmacyShifts } from "@/lib/pharmacy-dates";

export default function PharmacyPanel({ service }: { service: SitePost }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const image = !service.imageUrl || service.imageUrl === "/image-unavailable.svg" ? "/images/farmacias-de-turno.svg" : service.imageUrl;
  function openPharmacies() { setOpen(true); void recordContentView(service.id); }
  const [today, setToday] = useState(() => argentinaDateKey());
  useEffect(() => {
    const refresh = () => setToday(argentinaDateKey());
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, []);
  let shifts: ReturnType<typeof parsePharmacyShifts> = [];
  try { shifts = visiblePharmacyShifts(parsePharmacyShifts(service.body, getPharmacyMonth(service.summary, service.body)), new Date(`${today}T12:00:00-03:00`)); } catch { /* Datos antiguos sin fecha: no mostrar un turno como vigente. */ }
  return <>
    <CommunityTrigger title={service.title} description="Consultar fechas, direcciones y teléfonos" image={image} icon={<Pill/>} onOpen={openPharmacies} expanded={open} buttonRef={trigger}/>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent onCloseAutoFocus={event => { event.preventDefault(); trigger.current?.focus(); }} className="max-h-[90dvh] overflow-y-auto sm:max-w-[650px]"><DialogHeader><DialogTitle>{service.title}</DialogTitle><DialogDescription>{service.summary}</DialogDescription></DialogHeader>
      <ContentImage src={image} alt="Farmacias de turno" className="h-auto max-h-52 w-full rounded-lg bg-[#e8f4ed] object-contain"/>
      {!shifts.length && <p className="rounded-lg border p-4 text-sm text-[#526975]">No hay turnos de farmacia disponibles para estas fechas.</p>}
      <div className="grid gap-3">{shifts.map((shift,index) => {
        const date = formatPharmacyDate(shift.date);
        const { name, address, phone } = pharmacyDetails(shift.details);
        return <article key={index} className="rounded-lg border border-[#d7e3dd] bg-[#f9fcfa] p-4"><p className="mb-2 text-sm font-black text-[#27865a]">{date}{shift.date === today && <span className="ml-2 rounded-full bg-[#27865a] px-2 py-1 text-xs text-white">HOY</span>}</p><h3 className="font-bold text-[#164B7A]">{name}</h3>{address && <p className="mt-1 text-sm leading-relaxed text-[#526975]">{address}</p>}{phone && <p className="mt-1 text-sm leading-relaxed text-[#526975]">{phone.startsWith("Tel") ? phone : `Tel. ${phone}`}</p>}</article>;
      })}</div>
    </DialogContent></Dialog>
  </>;
}
