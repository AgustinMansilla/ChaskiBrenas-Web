import { createContext, useContext, type ReactNode } from "react";
import { defaultSectionMenu, type SectionMenu } from "@/lib/sections";
import type { SitePost } from "@/lib/posts";

const SectionContext = createContext<{ menu: SectionMenu; groups: Record<string, SitePost[]> }>({ menu: defaultSectionMenu, groups: {} });
export function SectionProvider({ menu = defaultSectionMenu, groups = {}, children }: { menu?: SectionMenu; groups?: Record<string, SitePost[]>; children: ReactNode }) {
  return <SectionContext.Provider value={{ menu, groups }}>{children}</SectionContext.Provider>;
}
export const useSections = () => useContext(SectionContext);
