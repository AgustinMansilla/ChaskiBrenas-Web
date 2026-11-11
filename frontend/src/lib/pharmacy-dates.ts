export type PharmacyShift = { date: string; details: string };
const months = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const weekday = "(?:lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)";

export function argentinaDateKey(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  return ["year","month","day"].map(type => parts.find(part => part.type === type)!.value).join("-");
}

export function getPharmacyMonth(summary: string, body = "") {
  const named = `${summary} ${body}`.toLocaleLowerCase("es").match(new RegExp(`(${months.join("|")})\\s+(?:de\\s+)?(\\d{4})`));
  if (named) return `${named[2]}-${String(months.indexOf(named[1])+1).padStart(2,"0")}`;
  return body.match(/\b(\d{4}-\d{2})-\d{2}\b/)?.[1] ?? null;
}

export function pharmacySummary(month: string) {
  return `Turnos de 8:00 AM a 8:00 AM del día siguiente · ${months[Number(month.slice(5))-1]} de ${month.slice(0,4)}.`;
}

export function formatPharmacyDate(date: string) {
  const label = new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00-03:00`));
  return (label.charAt(0).toUpperCase() + label.slice(1)).replace(",", "");
}



export function parsePharmacyShifts(body: string, month: string | null): PharmacyShift[] {
  const prefix = new RegExp(`^(?:${weekday}\\s+)?(\\d{1,2})(?:\\s+de\\s+(${months.join("|")})(?:\\s+de\\s+(\\d{4}))?)?\\s*:\\s*([\\s\\S]+)$`, "i");
  const text = body.replace(new RegExp(`\\s*\\/\\s*(?=${weekday}\\s+\\d{1,2}\\s*:)`,"gi"), "\n\n");
  const chunks = text.split(new RegExp(`\\n+|(?=${weekday}\\s+\\d{1,2}(?:\\s+de\\s+[^:]+)?\\s*:)`, "i")).map(line => line.replace(/\s*\/\s*$/, "").trim()).filter(Boolean);
  const shifts: PharmacyShift[] = [];
  for (const chunk of chunks) {
    if (/^\(?turnos\b/i.test(chunk)) continue;
    const iso = chunk.match(/^(\d{4}-\d{2}-\d{2})\s*:\s*([\s\S]+)$/);
    const match = chunk.match(prefix);
    if (!iso && !match) throw new Error(`No se reconoce este turno: ${chunk.slice(0,70)}. Usá, por ejemplo, Lunes 12: MOIA, dirección, teléfono.`);
    const selectedMonth = match?.[2] ? `${match[3] ?? month?.slice(0,4)}-${String(months.indexOf(match[2].toLocaleLowerCase("es"))+1).padStart(2,"0")}` : month;
    if (!iso && !selectedMonth) throw new Error("Elegí el mes y año de los turnos.");
    const date = iso?.[1] ?? `${selectedMonth}-${String(Number(match![1])).padStart(2,"0")}`;
    const parsed = new Date(`${date}T12:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0,10) !== date) throw new Error(`La fecha ${date} no existe.`);
    shifts.push({ date, details: (iso?.[2] ?? match![4]).trim() });
  }
  return shifts.sort((a,b) => a.date.localeCompare(b.date));
}

export function normalizePharmacyBody(body: string, month: string) {
  const shifts = parsePharmacyShifts(body, month);
  if (!shifts.length) throw new Error("Ingresá al menos un día de farmacia de turno.");
  return shifts.map(shift => `${formatPharmacyDate(shift.date)}: ${shift.details}`).join("\n\n");
}

export function visiblePharmacyShifts(shifts: PharmacyShift[], now = new Date()) {
  const today = argentinaDateKey(now);
  return shifts.filter(shift => shift.date >= today).sort((a,b) => a.date.localeCompare(b.date));
}

export function pharmacyDetails(details: string) {
  const parts = details.includes(" — ") ? details.split(" — ") : details.split(/,\s*/);
  const name = parts.shift() ?? details;
  const last = parts.at(-1) ?? "";
  const phone = /^(?:Tel\.?\s*)?[\d\s+()-]{6,}$/i.test(last) ? parts.pop()! : "";
  return { name, address: parts.join(", "), phone };
}
