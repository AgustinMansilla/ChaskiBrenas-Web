"use client";

import { useState, type ComponentProps } from "react";
import { resolveContentImage } from "@/lib/content-images";

type Props = Omit<ComponentProps<"img">, "src"> & { src: string };

export default function ContentImage({ src, alt, onError, loading = "lazy", ...props }: Props) {
  const resolved = resolveContentImage(src);
  const [failed, setFailed] = useState<string | null>(null);
  const unavailable = failed === resolved || !src;
  return <img
    {...props}
    src={unavailable ? "/image-unavailable.svg" : resolved}
    alt={unavailable ? `Imagen no disponible${alt ? `: ${alt}` : ""}` : alt}
    loading={loading}
    decoding="async"
    onError={(event) => { if (!unavailable) setFailed(resolved); onError?.(event); }}
  />;
}
