export type ContentType = "noticia" | "publicidad" | "servicio" | "obituario";
export type SectionItem = { id: string; label: string; type: ContentType | "todos" | "portada" | "papelera"; category: string; public: boolean };
export type MenuLink = { id: string; label: string; category: string };
export type SectionMenu = { revision: number; items: SectionItem[]; links: MenuLink[]; titles: Record<"inicio" | "radio" | "weather" | "community" | "videos", string> };
export const defaultSectionMenu: SectionMenu = {
  revision: 0,
  items: [
    { id: "todos", label: "Todo el contenido", type: "todos", category: "", public: false },
    { id: "portada", label: "Portada", type: "portada", category: "", public: true },
    { id: "noticia", label: "Noticias", type: "noticia", category: "", public: true },
    { id: "publicidad", label: "Publicidades", type: "publicidad", category: "", public: true },
    { id: "servicio", label: "Servicios", type: "servicio", category: "", public: true },
    { id: "obituario", label: "Obituarios", type: "obituario", category: "", public: true },
    { id: "papelera", label: "Papelera", type: "papelera", category: "", public: false },
  ],
  links: ["Locales", "Sociales", "Política", "Economía", "Producción", "Deportes"].map((name, index) => ({ id: `nav-${index + 1}`, label: name, category: name })),
  titles: { inicio: "Inicio", radio: "Chaski Radio", weather: "Pronóstico · Las Breñas", community: "Voces de la comunidad", videos: "Videos" },
};
export function sectionLabel(menu: SectionMenu, id: string) {
  return menu.items.find(item => item.id === id)?.label || defaultSectionMenu.items.find(item => item.id === id)?.label || "Contenido";
}
export function matchesSection(post: { type: string; category: string; deletedAt: unknown }, item: SectionItem, coverIds: ReadonlySet<number> = new Set(), postId = 0) {
  if (item.type === "papelera") return Boolean(post.deletedAt);
  if (post.deletedAt) return false;
  if (item.type === "portada") return coverIds.has(postId);
  return (item.type === "todos" || post.type === item.type) && (!item.category || post.category === item.category);
}
export function newSectionValues(item: SectionItem) {
  return { type: (["noticia", "publicidad", "servicio", "obituario"].includes(item.type) ? item.type : "noticia") as ContentType, category: item.category };
}
export function renameSection(item: SectionItem, label: string, isNew = false): SectionItem {
  return { ...item, label, ...(isNew && (!item.category || item.category === item.label) ? { category: label } : {}) };
}
