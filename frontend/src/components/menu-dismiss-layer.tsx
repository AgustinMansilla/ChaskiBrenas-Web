"use client";

import { useEffect } from "react";

export default function MenuDismissLayer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const keyboard = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    const desktop = window.matchMedia("(min-width: 1280px)");
    const resize = () => { if (desktop.matches) onClose(); };
    document.addEventListener("keydown", keyboard);
    desktop.addEventListener("change", resize);
    return () => { document.removeEventListener("keydown", keyboard); desktop.removeEventListener("change", resize); };
  }, [open, onClose]);
  if (!open) return null;

  return <button type="button" tabIndex={-1} aria-label="Cerrar menú de secciones" className="menu-dismiss-layer fixed inset-0 z-50 cursor-default bg-black/10 xl:hidden" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.preventDefault(); event.stopPropagation(); onClose(); }}/>
}
