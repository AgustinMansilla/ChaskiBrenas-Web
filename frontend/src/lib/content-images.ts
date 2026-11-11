import { siteAsset } from "@/lib/site-assets";


export const legacyImageFiles = [
  "Escuela_286_acto_de_90_aos.jpeg",
  "Asamblea_Consorcio_31_Ej_35.jpg",
  "ECI_con_Sophia_Portillo.jpg",
  "ECI_con_Jakub.jpg",
  "Alumnos_de_EES_26_en_San_Luis.jpg",
  "Delbn_en_UTN_Mercado_de_Carbono_2.jpg",
  "Inicio_Semana_Educacin_Especial.jpg",
  "Campus_U15_de_selecciones_CAP_Norte.jpg",
  "San_Miguel_Santa_Misa_patronal.jpg",
  "Estudiantes_de_la_regin_recorren_secciones_de_INTA.jpg",
  "Embajador_de_Ucrania_en_colectividad.jpeg",
  "Telfonos_tiles.jpg",
  "Eleccin_rectores_IES_Miguel_Neme.jpg",
  "Centenario_escuela_130_descubrimiento_placas.jpg",
  "Rosario_Hombres_II_encuentro.jpg",
  "Da_de_la_Raza_2026.jpg",
  "Camping_agua_potable.jpg",
  "Alumnos_de_EES_5_en_Resistencia_estudios.jpg",
  "Representantes_de_Escuela_N_302.jpeg",
  "Segundo_Congreso_Cereales_y_OIeaginosas_lanzamiento.jpg",
  "Torneo_Inmigrante_2026_presentacin.jpg",
  "EES_5_en_UNCAUS_2.jpg",
  "Doctora_Johana_Luzzi.jpg",
] as const;

export function resolveContentImage(src: string) {
  if (!src) return "/image-unavailable.svg";
  if (src === "/images/farmacias-de-turno.svg") return siteAsset(src);
  if (src.startsWith("/images/joomla/")) return src;
  if (src.startsWith("/images/publicidades/")) return src;
  try {
    const url = new URL(src);
    if (["xn--chaskibreas-9db.com.ar", "www.xn--chaskibreas-9db.com.ar"].includes(url.hostname)) {
      const filename = decodeURIComponent(url.pathname.split("/").pop() ?? "");
      if (legacyImageFiles.some((file) => file === filename)) return `/images/joomla/${filename}`;
      if (url.pathname.startsWith("/images/")) return `/media/joomla${url.pathname}`;
    }
    if (url.hostname === "imageshack.com" && url.pathname === "/i/pmaZjAesj") return "/images/joomla/seifert-lonas.jpg";
  } catch {

  }
  if (/^\/?images\//.test(src)) return `/media/joomla/${src.replace(/^\//, "").split("/").map(decodeURIComponent).map(encodeURIComponent).join("/")}`;
  return src;
}
