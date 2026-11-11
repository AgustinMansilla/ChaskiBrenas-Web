"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CloudSun,
  ExternalLink,
  HeartHandshake,
  Home,
  Menu,
  Pause,
  Play,
  Radio,
  Search,
  Sun,
  ThermometerSun,
  UserRound,
  Users,
  Wind,
  X,
} from "lucide-react";
import type { SitePost } from "@/lib/posts";
import { getCoverNews, wrapCoverIndex } from "@/lib/cover-news";
import { getNewsList } from "@/lib/news-list";
import { homePageSize, homeRefreshDue, homeReturnKey } from "@/lib/home-refresh";
import { formatDate } from "@/lib/posts";
import ContentImage from "@/components/content-image";
import Advertisements from "@/components/advertisements";
import { useSections } from "@/components/section-context";
import { sectionLabel } from "@/lib/sections";
import CustomPublicSections, { CustomSectionLinks } from "@/components/custom-public-sections";
import ObituariesPanel from "@/components/obituaries-panel";
import { recordPageView } from "@/lib/view-tracking";
import MenuDismissLayer from "@/components/menu-dismiss-layer";
import PharmacyPanel from "@/components/pharmacy-panel";
import ServicePanel from "@/components/service-panel";
import { RadioPanel, WeatherPanel, useLocalWeather } from "@/components/news-services";



export default function HomeClient({ posts, initialNews = posts, initialCursor = null }: { posts: SitePost[]; initialNews?: SitePost[]; initialCursor?: string | null }) {
  const { menu } = useSections();
  const navigation = [{id:"inicio",label:menu.titles.inicio,category:"Inicio"},...menu.links];
  const categories = navigation.map(item => item.category);
  const [newsRows, setNewsRows] = useState(initialNews.slice(0, homePageSize));
  const [editorialPosts, setEditorialPosts] = useState(posts);
  const [refreshKey, setRefreshKey] = useState(0);
  const lastRequestAt = useRef(Date.now());
  const requestVersion = useRef(0);
  const moreRequest = useRef<AbortController | null>(null);
  const [nextCursor, setNextCursor] = useState(initialCursor);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState("");
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHero, setActiveHero] = useState(0);
  const [activeCategory, setActiveCategory] = useState("Inicio");
  const { weather, unavailable: weatherUnavailable } = useLocalWeather();

  useEffect(() => { void recordPageView("home"); }, []);

  const news = useMemo(() => getNewsList(editorialPosts), [editorialPosts]);
  const services = editorialPosts.filter((post) => post.type === "servicio");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedCategory = params.get("seccion");
    const requestedQuery = params.get("buscar");
    if (requestedCategory) setActiveCategory(requestedCategory);
    if (requestedQuery) setQuery(requestedQuery);
  }, []);

  const filtered = useMemo(() => getNewsList(newsRows), [newsRows]);

  useEffect(() => {
    const controller = new AbortController();
    moreRequest.current?.abort();
    const version = ++requestVersion.current;
    const timer = window.setTimeout(async () => {
      setNewsLoading(true); setNewsError("");
      try {
        const params = new URLSearchParams({ seccion: activeCategory, buscar: query });
        const response = await fetch(`/api/news?${params}`, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error();
        const data = await response.json() as { news: SitePost[]; nextCursor: string | null; posts?: SitePost[] };
        if (version !== requestVersion.current || controller.signal.aborted) return;
        setNewsRows(data.news); setNextCursor(data.nextCursor);
        if (data.posts && activeCategory === "Inicio" && !query.trim()) setEditorialPosts(data.posts);
        lastRequestAt.current = Date.now();
      } catch { if (!controller.signal.aborted) setNewsError("No se pudieron cargar las noticias. Intentá nuevamente."); }
      finally { if (!controller.signal.aborted) setNewsLoading(false); }
    }, query ? 300 : 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [activeCategory, query, refreshKey]);

  async function loadMore() {
    if (!nextCursor || newsLoading) return;
    const controller = new AbortController();
    moreRequest.current = controller;
    const version = requestVersion.current;
    lastRequestAt.current = Date.now();
    setNewsLoading(true); setNewsError("");
    try {
      const params = new URLSearchParams({ seccion: activeCategory, buscar: query, cursor: nextCursor });
      const response = await fetch(`/api/news?${params}`, { signal: controller.signal, cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = await response.json() as { news: SitePost[]; nextCursor: string | null };
      if (version !== requestVersion.current || controller.signal.aborted) return;
      setNewsRows(current => [...new Map([...current, ...data.news].map(post => [post.id, post])).values()]);
      setNextCursor(data.nextCursor);
    } catch { if (!controller.signal.aborted) setNewsError("No se pudieron cargar más noticias. Podés volver a intentarlo."); }
    finally { if (version === requestVersion.current && !controller.signal.aborted) setNewsLoading(false); }
  }

  useEffect(() => {
    function resetHome(scrollTop: boolean) {
      ++requestVersion.current;
      moreRequest.current?.abort();
      setNewsRows(getNewsList(editorialPosts).slice(0, homePageSize));
      setNextCursor(null);
      setActiveCategory("Inicio"); setQuery(""); setActiveHero(0); setMenuOpen(false);
      lastRequestAt.current = Date.now();
      setRefreshKey(value => value + 1);
      window.history.replaceState(null, "", "/");
      if (scrollTop) window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" }));
    }
    function checkReturn(event?: PageTransitionEvent) {
      const returned = sessionStorage.getItem(homeReturnKey) === "1";
      if (returned || event?.persisted) {
        sessionStorage.removeItem(homeReturnKey);
        resetHome(true);
      } else if (document.visibilityState === "visible" && homeRefreshDue(lastRequestAt.current, Date.now())) resetHome(newsRows.length > homePageSize);
    }
    const oldRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    checkReturn();
    const visible = () => { if (document.visibilityState === "visible") checkReturn(); };
    const timer = window.setInterval(visible, 10000);
    window.addEventListener("pageshow", checkReturn);
    window.addEventListener("focus", visible);
    document.addEventListener("visibilitychange", visible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("pageshow", checkReturn);
      window.removeEventListener("focus", visible);
      document.removeEventListener("visibilitychange", visible);
      history.scrollRestoration = oldRestoration;
    };
  }, [editorialPosts, newsRows.length]);

  const homeCover = useMemo(() => getCoverNews(news), [news]);
  const heroPool = activeCategory === "Inicio" && !query.trim() ? homeCover : filtered.slice(0, 4);
  const hero = heroPool[wrapCoverIndex(activeHero, heroPool.length)];
  const gridNews = filtered;
  const communityStories = news.filter((post) => ["Educación", "Locales", "Sociales", "Comunidad"].includes(post.category)).slice(0, 2);
  const videoStories = news.slice(2, 5);

  useEffect(() => {
    if (heroPool.length < 2 || menuOpen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setActiveHero((current) => wrapCoverIndex(current + 1, heroPool.length)), 7000);
    return () => window.clearTimeout(timer);
  }, [heroPool.length, activeHero, menuOpen]);

  useEffect(() => { setActiveHero(0); }, [query, activeCategory]);

  function selectCategory(category: string) {
    setActiveCategory(category);
    setActiveHero(0);
    if (category === "Inicio") setQuery("");
    const params = new URLSearchParams();
    if (category !== "Inicio") {
      params.set("seccion", category);
      if (query.trim()) params.set("buscar", query.trim());
    }
    window.history.replaceState(null, "", params.size ? `/?${params}` : "/");
    setMenuOpen(false);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const dateLabel = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());

  return (
    <div onClickCapture={event => { const link = (event.target as Element).closest("a[href]"); if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0 && link?.getAttribute("href")?.startsWith("/noticias/") && link.getAttribute("target") !== "_blank") sessionStorage.setItem(homeReturnKey, "1"); }} className="public-site min-h-screen bg-[#f7faf8] text-[#173449]">
      <MenuDismissLayer open={menuOpen} onClose={() => setMenuOpen(false)}/>
      <header className="border-t-[5px] border-black bg-white">
        <div className="site-masthead mx-auto grid min-w-0 max-w-[1900px] items-center gap-x-6 px-[4vw] py-2 xl:grid-cols-[minmax(280px,380px)_minmax(0,1fr)] xl:grid-rows-[42px_auto] 2xl:grid-cols-[minmax(360px,520px)_minmax(0,1fr)]">
          <Link href="/" className="site-logo group flex min-w-0 h-[84px] items-center overflow-hidden sm:h-[96px] xl:row-span-2" aria-label="Chaski Breñas, inicio">
            <img src="/logo-chaski-oficial.png" alt="Chaski Breñas, las noticias llegan" className="h-[150px] w-auto max-w-full object-contain transition-transform group-hover:scale-[1.01]" />
          </Link>

          <div className="hidden items-center justify-end gap-4 xl:flex">
            <div className="flex items-center gap-2 border-r border-[#cbd8de] pr-4">
              <Sun className="size-7 text-[#E9A23B]" />
              <div><p className="text-xs font-black text-[#164B7A]">Las Breñas, Chaco</p><p className="text-xs text-[#61737d]">{weather ? `${Math.round(weather.temperature)}°` : "—"} | {weather ? weatherLabel(weather.weatherCode) : "Consultar clima"}</p></div>
            </div>
            <p className="border-r border-[#cbd8de] pr-4 text-xs font-bold capitalize text-[#405d6e]">{dateLabel}</p>
            <button className="grid size-8 place-items-center text-[#164B7A]" aria-label="Buscar" onClick={() => document.getElementById("buscar-noticias")?.focus()}><Search className="size-5" /></button>
            <div className="flex items-center gap-2 border-l border-[#cbd8de] pl-4" aria-label="Redes sociales">
              <a href="https://www.facebook.com/chaskiportal" target="_blank" rel="noreferrer" aria-label="Chaski Breñas en Facebook" className="grid size-8 place-items-center rounded-full bg-[#164B7A] text-sm font-black text-white transition hover:bg-[#3B9B68]">f</a>
            </div>
          </div>

          <div className={`${menuOpen ? "z-[60]" : ""} site-navigation relative mt-3 flex min-w-0 min-h-12 items-center rounded-md bg-[#075389] text-white shadow-sm xl:mt-0`}>
            <button className="grid size-12 place-items-center xl:hidden" onClick={() => menuOpen ? selectCategory("Inicio") : setMenuOpen(true)} aria-expanded={menuOpen} aria-controls="home-sections" aria-label={menuOpen ? "Ir al inicio y cerrar menú" : "Abrir menú"}>{menuOpen ? <Home /> : <Menu />}</button>
            <nav id="home-sections" className={`${menuOpen ? "grid" : "hidden"} grid-cols-2 absolute inset-x-0 top-12 z-50 gap-1 rounded-b-md bg-[#075389] p-3 shadow-xl xl:static xl:flex xl:flex-wrap xl:min-w-0 xl:flex-1 xl:items-center xl:justify-center xl:bg-transparent xl:p-0 xl:shadow-none`} aria-label="Secciones principales">
              {navigation.map(({id,label,category}, index) => (
                <button key={id} type="button" onClick={() => selectCategory(category)} aria-label={label} aria-pressed={activeCategory === category} className={`${index === 0 ? "hidden xl:flex" : "flex"} min-h-12 max-w-full break-words items-center justify-center border-b-[3px] px-3 font-serif text-base transition ${activeCategory === category ? "border-[#E9A23B] bg-white/10" : "border-transparent hover:bg-white/10"}`}>
                  {index === 0 ? <Home className="size-4" aria-label={menu.titles.inicio} /> : label}
                </button>
              ))}
            </nav>
            <CustomSectionLinks onChoose={()=>setMenuOpen(false)}/>
            <div className="relative ml-auto mr-3 w-[min(70%,18rem)] xl:hidden 2xl:block 2xl:w-[190px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/65" />
              <input id="buscar-noticias" value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setMenuOpen(false)} aria-label="Buscar noticias" placeholder="Buscar noticias" className="h-10 w-full rounded-full border border-white/15 bg-white/10 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/60 focus:bg-white/15" />
            </div>
          </div>
        </div>
      </header>

      <main id="inicio" className="mx-auto max-w-[1900px] px-[4vw] pb-10">
        {news.find((post) => post.urgent) && <a href={`/noticias/${encodeURIComponent(news.find((post) => post.urgent)!.slug)}`} className="my-3 flex items-center gap-3 rounded-md bg-[#b72828] px-4 py-3 font-black text-white shadow"><span className="rounded bg-white px-2 py-1 text-xs text-[#b72828]">URGENTE</span><span className="line-clamp-1">{news.find((post) => post.urgent)!.title}</span></a>}
        {hero ? (
          <section className="public-layout grid min-w-0 items-start gap-5 pb-5 lg:grid-cols-[minmax(0,3fr)_minmax(230px,1fr)]">
            <div className="main-column grid min-w-0 gap-4"><h2 className="break-words text-sm font-black uppercase tracking-wide text-[#164B7A]">{sectionLabel(menu,"portada")}</h2>
              <HeroStory post={hero} main dots={heroPool} active={activeHero} onSelect={setActiveHero} onPrevious={() => setActiveHero((current) => wrapCoverIndex(current - 1, heroPool.length))} onNext={() => setActiveHero((current) => wrapCoverIndex(current + 1, heroPool.length))} />
              <h2 className="break-words text-lg font-black text-[#164B7A]">{sectionLabel(menu,"noticia")}</h2><div id="noticias" className="news-list scroll-mt-4 grid min-w-0 gap-4 md:grid-cols-2">
                {gridNews.map((post) => <NewsCard key={post.id} post={post} />)}
              </div>
              <div className="text-center" aria-live="polite">{newsError && <p className="mb-3 text-sm">{newsError}</p>}{nextCursor && <button disabled={newsLoading} onClick={loadMore} className="min-h-12 rounded-full border border-[#075389] bg-white px-6 py-3 font-bold text-[#075389] disabled:opacity-50">{newsLoading ? "Cargando…" : "Ver más noticias"}</button>}</div>
            </div>

            <aside className="services-column grid min-w-0 gap-4" aria-label="Servicios y publicidad">
              <RadioPanel/>
              <WeatherPanel weather={weather} unavailable={weatherUnavailable}/>

              <Advertisements posts={editorialPosts}/>

              <section className="rounded-md border border-[#dce6e1] bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-3"><h2 className="text-lg font-black uppercase tracking-wide text-[#164B7A]">{sectionLabel(menu,"servicio")}</h2><div className="h-px flex-1 bg-[#E9A23B]" /></div>
                <div className="grid gap-4">
                  {services.map((service) => service.category === "Farmacias" ? <PharmacyPanel key={service.id} service={service}/> : <ServicePanel key={service.id} service={service}/>)}
                </div>
              </section>

              <ObituariesPanel posts={editorialPosts}/>
            </aside>
          </section>
        ) : (
          <section id="noticias" className="my-4 scroll-mt-4 rounded-md border bg-white p-10 text-center"><h1 className="text-2xl font-black">No hay noticias en {activeCategory === "Inicio" ? "esta búsqueda" : activeCategory}</h1><p className="mt-2 text-[#63737b]">Probá otra sección o volvé a Inicio para ver todas las publicaciones.</p></section>
        )}

        <CustomPublicSections/>

        <section className="grid gap-7 border-t-2 border-[#0a6598] py-4 xl:grid-cols-[1.55fr_1fr]">
          <div id="voces-comunidad" className="scroll-mt-5">
            <SectionHeading icon={<Users className="size-7" />} title={menu.titles.community} action="Ver más historias" />
            <div className="grid gap-4 md:grid-cols-2">
              {(communityStories.length ? communityStories : news.slice(0, 2)).map((post, index) => (
                <a key={post.id} href={`/noticias/${encodeURIComponent(post.slug)}`} className="community-card grid min-w-0 min-h-[118px] grid-cols-[minmax(0,.8fr)_minmax(0,1fr)] sm:grid-cols-[150px_minmax(0,1fr)] overflow-hidden rounded-md border border-[#dae4e0] bg-white shadow-[0_4px_12px_rgba(25,61,82,.08)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(25,61,82,.14)]">
                  <ContentImage src={post.imageUrl} alt="" className="news-photo aspect-[3/2] w-full self-start object-cover" />
                  <span className="flex flex-col justify-center p-4"><strong className="font-serif text-xl leading-tight text-[#123d5d]">{post.title}</strong><span className="mt-2 line-clamp-2 text-sm leading-snug text-[#536b78]">{post.summary}</span><span className="mt-2 text-xs font-black uppercase tracking-wide text-[#0a6598]">Leer noticia completa</span></span>
                </a>
              ))}
            </div>
          </div>

          <div id="videos" className="scroll-mt-5">
            <SectionHeading icon={<Play className="size-6 fill-current" />} title={menu.titles.videos} action="Ver más videos" />
            <div className="grid grid-cols-3 gap-3">
              {videoStories.map((post) => (
                <a key={post.id} href={`/noticias/${encodeURIComponent(post.slug)}`} className="group min-w-0">
                  <span className="relative block aspect-[3/2] overflow-hidden rounded-md bg-[#d9e6e1]"><ContentImage src={post.imageUrl} alt="" className="h-full w-full object-cover transition group-hover:scale-105" /><span className="absolute inset-0 grid place-items-center bg-black/5"><span className="grid size-9 place-items-center rounded-full bg-white/95 text-[#164B7A] shadow"><Play className="ml-0.5 size-4 fill-current" /></span></span></span>
                  <strong className="mt-2 block line-clamp-2 font-serif text-sm leading-tight text-[#123d5d]">{post.title}</strong>
                </a>
              ))}
            </div>
          </div>
        </section>

      </main>

      <footer id="contacto" className="bg-[#0d3c5d] text-white"><div className="mx-auto flex max-w-[1900px] flex-col gap-4 px-[4vw] py-7 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-2xl font-black">CHASKI <span className="text-[#74c498]">BREÑAS</span></p><p className="mt-1 text-sm text-white/60">Las noticias llegan.</p></div><p className="text-sm text-white/55">Información de Las Breñas, Chaco</p></div></footer>
    </div>
  );
}

function HeroStory({ post, main = false, dots = [], active = 0, onSelect, onPrevious, onNext }: { post: SitePost; main?: boolean; dots?: SitePost[]; active?: number; onSelect?: (index: number) => void; onPrevious?: () => void; onNext?: () => void }) {
  return (
    <article key={post.id} className="hero-story group relative flex min-w-0 flex-col justify-end overflow-hidden rounded-md bg-[#123c59] sm:min-h-[410px] xl:min-h-[430px]">
      <ContentImage src={post.imageUrl} alt={post.title} loading="eager" fetchPriority="high" className="news-photo aspect-[3/2] w-full object-cover transition duration-700 group-hover:scale-[1.025] " style={{ objectPosition: `${post.focalX}% ${post.focalY}%` }} />
      <span className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-[#061722]/95 via-[#071a28]/22 to-transparent sm:block" />
      <div className="hero-copy pointer-events-none relative min-w-0 p-5 sm:p-7 sm:pt-28">
          <span className="rounded-sm bg-[#27865a] px-2 py-1 text-xs font-black uppercase tracking-wide text-white">{post.category}</span>
          {main ? <h1 className="mt-3 max-w-4xl break-words font-serif text-[clamp(1.5rem,6vw,1.9rem)] font-black leading-[1.08] tracking-[-.025em] text-white sm:text-[clamp(2rem,3.05vw,3.35rem)] sm:leading-[1.02]">{post.title}</h1> : <h2 className="mt-3 break-words font-serif text-2xl font-black leading-[1.08] tracking-[-.025em] text-white sm:text-[clamp(1.85rem,2.75vw,3rem)]">{post.title}</h2>}
          <p className="mt-2 line-clamp-2 max-w-3xl text-base leading-snug text-white/88">{post.summary}</p>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-white/75"><span className="flex items-center gap-1.5"><CalendarDays className="size-3.5 shrink-0" /> {formatDate(new Date(post.createdAt))}</span><span className="flex items-center gap-1.5"><UserRound className="size-3.5 shrink-0" /> Por {post.author}</span><span className="mt-1 rounded-full border border-white/40 bg-white/10 px-3 py-2 uppercase tracking-wide text-white">Leer noticia completa</span></p>
      </div>
      <a href={`/noticias/${encodeURIComponent(post.slug)}`} aria-label={`Leer la noticia completa: ${post.title}`} className="absolute inset-0 z-10 rounded-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#E9A23B]" />
      {main && dots.length > 1 && <div className="hero-controls relative z-20 flex items-center justify-between gap-2 border-t border-white/15 bg-[#061722]/70 px-4 py-3 backdrop-blur-sm">
        <button type="button" onClick={onPrevious} aria-label="Ver noticia anterior" className="grid size-11 shrink-0 place-items-center rounded-full border border-white/40 bg-white/10 text-white transition hover:bg-[#075389] focus-visible:ring-2 focus-visible:ring-[#E9A23B]"><ChevronLeft className="size-6" /></button>
        <div className="flex flex-wrap justify-center gap-1.5">{dots.map((item, index) => <button key={item.id} type="button" onClick={() => onSelect?.(index)} aria-label={`Mostrar noticia ${index + 1}: ${item.title}`} aria-current={index === active % dots.length ? "true" : undefined} className={`grid size-11 place-items-center rounded-full text-sm font-black transition focus-visible:ring-2 focus-visible:ring-[#E9A23B] ${index === active % dots.length ? "bg-[#E9A23B] text-[#173449]" : "bg-white/15 text-white hover:bg-white/30"}`}>{index + 1}</button>)}</div>
        <button type="button" onClick={onNext} aria-label="Ver noticia siguiente" className="grid size-11 shrink-0 place-items-center rounded-full border border-white/40 bg-white/10 text-white transition hover:bg-[#075389] focus-visible:ring-2 focus-visible:ring-[#E9A23B]"><ChevronRight className="size-6" /></button>
      </div>}
    </article>
  );
}

function NewsCard({ post }: { post: SitePost }) {
  return (
    <a href={`/noticias/${encodeURIComponent(post.slug)}`} aria-label={`Leer la noticia completa: ${post.title}`} className="news-card group grid min-w-0 min-h-[176px] grid-cols-1 overflow-hidden rounded-md border border-[#dce6e1] bg-white shadow-[0_5px_15px_rgba(19,66,91,.07)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(19,66,91,.13)] sm:grid-cols-[minmax(0,.94fr)_minmax(0,1.06fr)] md:grid-cols-1 xl:grid-cols-[minmax(0,.94fr)_minmax(0,1.06fr)]">
      <div className="news-photo-frame aspect-[3/2] min-w-0 self-start overflow-hidden"><ContentImage src={post.imageUrl} alt={post.title} className="news-photo aspect-[3/2] h-full w-full object-cover transition duration-500 group-hover:scale-105" style={{ objectPosition: `${post.focalX}% ${post.focalY}%` }} /></div>
      <div className="flex min-w-0 flex-col justify-center p-4"><span className="w-fit rounded-sm bg-[#0a6598] px-2 py-1 text-[.66rem] font-black uppercase text-white">{post.category}</span><h3 className="mt-2 break-words font-serif text-[1.4rem] font-black leading-[1.12] text-[#123d5d] sm:text-xl">{post.title}</h3><p className="mt-2 line-clamp-3 text-sm leading-snug text-[#63737b]">{post.summary}</p><p className="mt-3 text-xs font-bold text-[#8a979d]">{formatDate(new Date(post.createdAt))} · Por {post.author}</p><span className="mt-2 text-xs font-black uppercase tracking-wide text-[#0a6598]">Leer noticia completa</span></div>
    </a>
  );
}

function SectionHeading({ icon, title, action }: { icon: ReactNode; title: string; action: string }) {
  return <div className="mb-3 flex items-center gap-3"><h2 className="flex shrink-0 items-center gap-2 text-xl font-black uppercase tracking-tight text-[#164B7A]">{icon}{title}</h2><div className="h-px flex-1 bg-[#3B9B68]" /><span className="hidden text-xs font-bold text-[#164B7A] sm:block">{action}</span></div>;
}

function weatherLabel(code?: number) {
  if (code === undefined) return "Pronóstico local";
  if (code === 0) return "Despejado";
  if (code <= 3) return "Nubes y sol";
  if (code <= 48) return "Neblina";
  if (code <= 67) return "Lluvias";
  if (code <= 77) return "Granizo o nieve";
  if (code <= 82) return "Chaparrones";
  return "Tormentas";
}
