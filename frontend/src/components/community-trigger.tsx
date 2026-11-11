import type { ReactNode, Ref } from "react";
import { ChevronRight } from "lucide-react";
import ContentImage from "@/components/content-image";

export default function CommunityTrigger({ title, description, image, icon, onOpen, expanded = false, buttonRef }: { title: string; description: string; image?: string; icon: ReactNode; onOpen: () => void; expanded?: boolean; buttonRef?: Ref<HTMLButtonElement> }) {
  return <button ref={buttonRef} type="button" aria-haspopup="dialog" aria-expanded={expanded} onClick={onOpen} className="community-trigger" aria-label={`Ver ${title}`}>
    {image ? <ContentImage src={image} alt="" className="community-thumbnail"/> : <span className="community-icon">{icon}</span>}
    <span className="min-w-0 flex-1"><b className="block text-base leading-tight text-[#164B7A]">{title}</b><span className="mt-1 block text-sm leading-snug text-[#5f727c]">{description}</span></span><ChevronRight className="community-arrow size-5 shrink-0"/>
  </button>;
}
