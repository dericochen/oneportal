/**
 * Salinan token warna untuk konteks yang tidak bisa membaca variabel CSS
 * (SVG yang dibuat di server, QR, peta Leaflet, grafik). Harus sama persis
 * dengan `src/app/globals.css` dan DESIGN.md.
 */
export const warna = {
  aspal: "#1E2226",
  aspal2: "#4A4F55",
  putih: "#FFFFFF",
  abu: "#F2F3F1",
  garis: "#D5D8D4",
  garisTegas: "#6B7076",
  kuning: "#FFC629",
  biru: "#1F57B8",
  hijau: "#1F7A4A",
  oranye: "#B85412",
  merah: "#B42318",
} as const;

export type NamaWarna = keyof typeof warna;
