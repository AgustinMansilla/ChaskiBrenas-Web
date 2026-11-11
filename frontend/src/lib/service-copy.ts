export const obsoleteTelephoneSummaries = [
  "Guía rápida de teléfonos y servicios para la comunidad.",
  "Guía rápida de servicios para la comunidad.",
];
export const obsoleteTelephoneBody = "Información de contacto de servicios esenciales de Las Breñas. La placa puede reemplazarse y los datos pueden actualizarse desde Administración.";

export function publicServiceCopy(value: string) {
  const text = value.trim();
  return obsoleteTelephoneSummaries.includes(text) || text === obsoleteTelephoneBody ? "" : text;
}
