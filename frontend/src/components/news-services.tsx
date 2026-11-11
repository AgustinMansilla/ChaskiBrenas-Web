"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight, CloudSun, ExternalLink, LoaderCircle, Pause, Play, Radio, Wind } from "lucide-react";
import { useSections } from "@/components/section-context";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type LocalWeather = {
  temperature: number;
  apparentTemperature?: number;
  weatherCode?: number;
  windSpeed?: number;
  condition?: string;
  observedAt?: string;
  daily?: Array<{ date: string; max?: number; min?: number; rainChance?: number }>;
  source?: string;
};



export function useLocalWeather() {
  const [weather, setWeather] = useState<LocalWeather | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    let active = true;
    const controllers: AbortController[] = [];
    const fallback = "https://api.open-meteo.com/v1/forecast?latitude=-27.089&longitude=-61.082&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=3&timezone=America%2FArgentina%2FCordoba";
    async function load() {
      for (const url of ["/api/weather", fallback]) {
        if (!active) return;
        const controller = new AbortController();
        controllers.push(controller);
        const timer = setTimeout(() => controller.abort(), 12000);
        try {
          const response = await fetch(url, { signal: controller.signal });
          if (!response.ok) throw new Error("weather unavailable");
          const raw = await response.json() as Record<string, unknown>;
          const current = raw.current as Record<string, number | string> | undefined;
          const daily = raw.daily as { time?: string[]; temperature_2m_max?: number[]; temperature_2m_min?: number[]; precipitation_probability_max?: number[] } | undefined;
          const data: LocalWeather = typeof raw.temperature === "number" ? raw as LocalWeather : {
            temperature: Number(current?.temperature_2m),
            apparentTemperature: Number(current?.apparent_temperature), weatherCode: Number(current?.weather_code), windSpeed: Number(current?.wind_speed_10m), observedAt: String(current?.time ?? ""), source: "Open-Meteo",
            daily: (daily?.time ?? []).map((date, index) => ({ date, max: daily?.temperature_2m_max?.[index], min: daily?.temperature_2m_min?.[index], rainChance: daily?.precipitation_probability_max?.[index] })),
          };
          if (!Number.isFinite(data.temperature)) throw new Error("invalid weather");
          if (active) setWeather(data);
          return;
        } catch { /* Intentar el siguiente canal sin mostrar datos inventados. */ }
        finally { clearTimeout(timer); }
      }
      if (active) setUnavailable(true);
    }
    void load();
    return () => { active = false; controllers.forEach((controller) => controller.abort()); };
  }, []);
  return { weather, unavailable };
}

export function RadioPanel() {
  const { menu } = useSections();
  const audio = useRef<HTMLAudioElement>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "playing" | "error">("idle");
  async function toggle() {
    if (!audio.current) return;
    if (!audio.current.paused) { audio.current.pause(); return; }
    setStatus("connecting");
    if (audio.current.error) audio.current.load();
    try { await audio.current.play(); } catch { setStatus("error"); }
  }
  useEffect(() => { if (status !== "connecting") return; const timer = window.setTimeout(() => { audio.current?.pause(); setStatus("error"); }, 20000); return () => window.clearTimeout(timer); }, [status]);
  return <section className="radio-panel compact-service" aria-label={menu.titles.radio}>
    <div className="desktop-radio-heading"><Radio className="size-6"/><b>{menu.titles.radio}</b><span>{status === "playing" ? "EN VIVO" : "RADIO ONLINE"}</span></div>
    <audio ref={audio} src="https://server.laradio.online/proxy/ruben_mansilla?mp=/stream" preload="none" onPlaying={() => setStatus("playing")} onPause={() => setStatus(previous => previous === "error" ? "error" : "idle")} onError={() => setStatus("error")} onWaiting={() => setStatus("connecting")}/>
    <button type="button" onClick={toggle} aria-label={status === "playing" ? "Pausar radio" : `Escuchar ${menu.titles.radio}`} aria-pressed={status === "playing"} disabled={status === "connecting"} aria-busy={status === "connecting"} className="service-play">
      {status === "connecting" ? <LoaderCircle className="size-5 animate-spin"/> : status === "playing" ? <Pause className="size-5 fill-current"/> : <Play className="ml-0.5 size-5 fill-current"/>}
    </button>
    <div className="service-copy"><b className="service-name"><Radio className="size-3.5"/>{menu.titles.radio}</b><span role="status" aria-live="polite" className="service-status">{status === "playing" ? "En vivo" : status === "connecting" ? "Conectando…" : status === "error" ? "Reintentar" : "Escuchar en vivo"}</span></div>
  </section>;
}

export function WeatherPanel({ weather, unavailable = false }: { weather: LocalWeather | null; unavailable?: boolean }) {
  const { menu } = useSections();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement | null>(null);
  return <>
    <section className="weather-panel compact-service">
      <button type="button" className="weather-open" aria-haspopup="dialog" aria-expanded={open} onClick={event => { trigger.current = event.currentTarget; setOpen(true); }} aria-label="Ver pronóstico completo de Las Breñas">
        <CloudSun className="weather-symbol"/>
        <span className="service-copy"><b className="service-name">{weather ? `${Math.round(weather.temperature)}° · Las Breñas` : "Las Breñas"}</b><span className="service-status">{weather ? weatherLabel(weather.weatherCode, weather.condition) : unavailable ? "Clima no disponible" : "Consultar clima"}</span></span>
        <ChevronRight className="size-4 shrink-0"/>
      </button>
      <div className="desktop-weather">
        <div className="flex items-start justify-between"><div><p className="text-sm font-bold text-white/70">{menu.titles.weather}</p><p className="mt-1 text-5xl font-black">{weather ? `${Math.round(weather.temperature)}°` : "—"}</p><p className="mt-1 font-bold">{weather ? weatherLabel(weather.weatherCode, weather.condition) : unavailable ? "Clima no disponible" : "Consultando clima…"}</p></div><CloudSun className="size-11 text-[#f6c365]"/></div>
        {weather && <><div className="mt-4 grid grid-cols-2 gap-2 text-sm"><p className="rounded bg-white/10 p-2.5">ST {Math.round(weather.apparentTemperature ?? weather.temperature)}°</p><p className="rounded bg-white/10 p-2.5">{Math.round(weather.windSpeed ?? 0)} km/h</p></div><div className="mt-2 grid gap-1.5">{weather.daily?.slice(0,2).map((day,index)=><div key={day.date} className="flex justify-between rounded bg-white/10 px-3 py-2 text-sm"><b>{index === 0 ? "Hoy" : "Mañana"}</b><span>{Math.round(day.max ?? 0)}° / {Math.round(day.min ?? 0)}°</span></div>)}</div></>}
        <button type="button" onClick={event => { trigger.current = event.currentTarget; setOpen(true); }} aria-haspopup="dialog" aria-expanded={open} className="forecast-button mt-4">Ver pronóstico completo <ChevronRight className="size-4"/></button>
      </div>
    </section>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent onCloseAutoFocus={event => { event.preventDefault(); trigger.current?.focus(); }} className="max-h-[85dvh] overflow-y-auto sm:max-w-[440px]"><DialogHeader><DialogTitle>{menu.titles.weather}</DialogTitle><DialogDescription>{weather ? `Fuente: ${weather.source || "Open-Meteo"}.` : "Pronóstico de Las Breñas."}</DialogDescription></DialogHeader>
      {weather ? <div><div className="flex items-center gap-4"><CloudSun className="size-12 text-[#E9A23B]"/><div><p className="text-4xl font-black text-[#164B7A]">{Math.round(weather.temperature)}°</p><p className="text-sm">{weatherLabel(weather.weatherCode, weather.condition)}</p></div></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><p className="rounded-lg bg-[#E8F4ED] p-3">Sensación: {Math.round(weather.apparentTemperature ?? weather.temperature)}°</p><p className="flex items-center gap-2 rounded-lg bg-[#E8F4ED] p-3"><Wind className="size-4"/>{Math.round(weather.windSpeed ?? 0)} km/h</p></div><div className="mt-4 grid gap-2">{weather.daily?.slice(0, 3).map((day) => <div key={day.date} className="flex items-center justify-between rounded-lg border p-3 text-sm"><b>{new Intl.DateTimeFormat("es-AR", { weekday: "short", day: "numeric", month: "short" }).format(new Date(`${day.date}T12:00:00-03:00`))}</b><span>{Math.round(day.max ?? 0)}° / {Math.round(day.min ?? 0)}°</span></div>)}</div>{weather.observedAt && <p className="mt-3 text-xs text-[#60737c]">Dato meteorológico: {weather.observedAt.replace("T", " ")} (hora local).</p>}</div> : <p className="rounded-lg border bg-[#f7faf8] p-4 text-sm">{unavailable ? "El pronóstico no está disponible en este momento." : "Consultando el pronóstico…"}</p>}
      <a href="https://www.argentina.gob.ar/smn" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#164B7A] px-4 py-3 text-sm font-bold text-white">Ver pronóstico en el SMN <ExternalLink className="size-4"/></a>
    </DialogContent></Dialog>
  </>;
}

function weatherLabel(code?: number, condition?: string) {
  if (condition) return condition;
  if (code === undefined) return "Ver pronóstico";
  if (code === 0) return "Despejado";
  if (code <= 3) return "Nubes y sol";
  if (code <= 48) return "Neblina";
  if (code <= 67) return "Lluvias";
  if (code <= 77) return "Nieve o granizo";
  if (code <= 82) return "Chaparrones";
  return "Tormentas";
}
