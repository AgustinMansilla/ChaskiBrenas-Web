import React from "react";
import { createRoot } from "react-dom/client";
import HomeClient from "@/app/home-client";
import { SectionProvider } from "@/components/section-context";
import type { SitePost } from "@/lib/posts";
import "@/app/globals.css";

const entries = [["ASISTENCIA DE PARTO EN VÍA PÚBLICA FUE TEMA DE CAPACITACIÓN","Un grupo de bomberos voluntarios de Las Breñas y Charata participó de una capacitación sobre partos de emergencia.","asistencia-de-parto-en-v-a-p-blica-fue-tema-de-capacitaci-n-43524cef"],["COOPERATIVA DE AGUA POTABLE CON PROYECTO DE AMPLIACIÓN","La cooperativa de agua potable de Las Breñas prepara la ampliación de su oferta de servicios.","cooperativa-de-agua-potable-con-proyecto-de-ampliaci-n-79a32d43"],["CONCLUYÓ UN POSITIVO 2° ENCUENTRO DE CEREALES Y OLEAGINOSAS","Las Breñas fue sede del segundo encuentro de cereales y oleaginosas del Gran Chaco Argentino.","concluy-un-positivo-2-encuentro-de-cereales-y-oleaginosas-21225153"],["OSCAR GONZÁLEZ, EL CANILLITA DE TODOS LOS TIEMPOS, TUVO SU DISTINCIÓN","El canillita Oscar González recibió una distinción en el Palacio Municipal de Las Breñas.","oscar-gonz-lez-el-canillita-de-todos-los-tiempos-tuvo-su-distinci-n-80225d44"],["RECONOCIMIENTO PARA HISTÓRICO CANILLITA DE NORTE","El Concejo Municipal reconoció la trayectoria de Oscar González.","reconocimiento-para-hist-rico-canillita-de-norte-9e1a3247"],["COMISIÓN DEL INMIGRANTE SE REUNIÓ CON EL INTENDENTE","Autoridades municipales y de la Comisión Central se reunieron por la Fiesta Provincial del Inmigrante.","comisi-n-del-inmigrante-se-reuni-n-con-el-intendente-d22e994b"]];
function article(row: string[], index: number): SitePost {
  const [title, summary, slug] = row;
  return {
    id: index + 1, type: "noticia", title, slug, summary, body: summary,
    author: "Chaski Breñas", category: "Locales", imageUrl: "",
    status: "published", featured: index < 3, featuredOrder: index + 1,
    urgent: false, publishAt: null, expiresAt: null,
    updatedAt: new Date(), deletedAt: null, tags: "", location: "Las Breñas",
    source: "", photographer: "", imageCaption: "", gallery: "",
    focalX: 50, focalY: 50, published: true, createdAt: new Date()
  };
}
const news = entries.map(article);
const advertisement: SitePost = {
  ...article(["Espacio publicitario", "Publicidad comercial", "publicidad"], 99),
  type: "publicidad", category: "Publicidad", featured: false,
  imageUrl: "/publicidad-ejemplo.svg", adWidth: 360, adHeight: 240, linkUrl: null
};
const posts = [...news, advertisement];
const realFetch = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  const url = new URL(input instanceof Request ? input.url : String(input), location.origin);
  if (url.pathname === "/api/news") {
    const section = url.searchParams.get("seccion") || "Inicio";
    const text = (url.searchParams.get("buscar") || "").toLocaleLowerCase("es");
    const rows = news.filter(item => (section === "Inicio" || item.category === section) &&
      (item.title + " " + item.summary).toLocaleLowerCase("es").includes(text));
    return Promise.resolve(new Response(JSON.stringify({ news: rows, posts, nextCursor: null }), { status: 200, headers: { "Content-Type": "application/json" } }));
  }
  if (url.pathname.startsWith("/api/")) return Promise.resolve(new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } }));
  return realFetch(input, init);
};
document.addEventListener("click", event => {
  const link = (event.target as Element)?.closest?.("a[href^='/noticias/']") as HTMLAnchorElement | null;
  if (!link) return;
  const slug = link.getAttribute("href")?.slice("/noticias/".length);
  if (!slug) return;
  event.preventDefault();
  window.open("https://xn--chaskibreas-9db.com.ar/noticias/" + encodeURIComponent(decodeURIComponent(slug)), "_blank", "noopener,noreferrer");
}, { capture: true });
createRoot(document.getElementById("root")!).render(<SectionProvider><HomeClient posts={posts} initialNews={news}/></SectionProvider>);
