export type TelephoneContact = { name: string; number: string };
export const telephoneBackground = "/images/telefonos-fondo-v1.png";
export const initialTelephoneContacts: TelephoneContact[] = [
  { name: "Servicios Públicos", number: "461-618 / 15-414-777" },
  { name: "Bomberos Voluntarios", number: "462-365" },
  { name: "SECHEEP", number: "460-014 / Cel. 15-623-010" },
  { name: "Hospital 9 de Julio", number: "107 ó 460-034 (Adm.)" },
  { name: "Policía Las Breñas", number: "101 ó 460-038" },
];

export function telephoneContacts(body: string): TelephoneContact[] {
  try {
    const value = JSON.parse(body);
    if (value?.format === "chaski-telephones-v1" && Array.isArray(value.contacts)) {
      return value.contacts.filter((row: unknown): row is TelephoneContact => !!row && typeof row === "object" && typeof (row as TelephoneContact).name === "string" && typeof (row as TelephoneContact).number === "string");
    }
  } catch { /* La placa anterior aún no tenía campos editables. */ }
  return initialTelephoneContacts.map(row => ({ ...row }));
}

export function telephoneBody(contacts: TelephoneContact[], validate = false) {
  const rows = contacts.map(row => validate ? { name: row.name.trim(), number: row.number.trim() } : row);
  if (validate && (rows.length > 50 || rows.some(row => !row.name || !row.number || row.name.length > 120 || row.number.length > 160))) {
    throw new Error("Completá el nombre y teléfono de cada contacto (hasta 50 contactos).");
  }
  return JSON.stringify({ format: "chaski-telephones-v1", contacts: rows });
}

export function isTelephoneService(post: { type: string; category: string; title?: string; slug?: string }) {
  const title = (post.title ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return post.type === "servicio" && (post.category === "Teléfonos útiles" || post.slug === "telefonos-utiles-las-brenas" || title.startsWith("telefonos utiles"));
}
