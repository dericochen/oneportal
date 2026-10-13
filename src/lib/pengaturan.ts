import "server-only";
import { cache } from "react";
import { supabaseTerkonfigurasi } from "@/lib/env";
import { buatKlienServer } from "@/lib/supabase/server";

/** Nilai bawaan bila tabel site_settings belum terisi atau tidak terjangkau. */
const BAWAAN = {
  "beranda.kalimat_pembuka": "Laporkan jalan rusak, sampah, atau lampu jalan mati. Anda akan dikabari sampai selesai.",
  "kontak.email": "",
  "kontak.telepon": "",
  "darurat.nomor": "112",
  "footer.disclaimer":
    "Prototipe untuk Lomba Web Development IT Fest UMK 2026, bukan kanal resmi Pemerintah Kota Medan. Keadaan darurat: hubungi 112.",
} as const;

export type KunciPengaturan = keyof typeof BAWAAN;

/** Pengaturan situs (dikelola admin di Fase 1). Di-cache per permintaan. */
export const ambilPengaturan = cache(async (): Promise<Record<KunciPengaturan, string>> => {
  const hasil: Record<KunciPengaturan, string> = { ...BAWAAN };
  if (!supabaseTerkonfigurasi) return hasil;
  try {
    const supabase = await buatKlienServer();
    const { data } = await supabase.from("site_settings").select("key, value").in("key", Object.keys(BAWAAN));
    for (const baris of data ?? []) {
      if (baris.key in hasil && typeof baris.value === "string") hasil[baris.key as KunciPengaturan] = baris.value;
    }
  } catch {
    // Footer tetap tampil dengan teks bawaan.
  }
  return hasil;
});
