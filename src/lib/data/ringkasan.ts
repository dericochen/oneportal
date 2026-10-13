import "server-only";
import { buatKlienServer } from "@/lib/supabase/server";

/**
 * Ringkasan angka untuk command center Fase 0. Semua dihitung di database
 * (count exact, RLS berlaku), tidak ada angka yang ditulis tangan.
 * Command center lengkap (filter, grafik, rapor instansi) dibangun di Fase 5.
 */
export type RingkasanStaf = {
  menungguVerifikasi: number;
  diproses: number;
  peninjauanBukti: number;
  selesai: number;
  total: number;
};

export async function ambilRingkasanStaf(): Promise<RingkasanStaf | null> {
  const supabase = await buatKlienServer();
  const hitung = (status?: string[]) => {
    let q = supabase.from("reports").select("id", { count: "exact", head: true }).is("deleted_at", null);
    if (status) q = q.in("status", status);
    return q;
  };
  const [menunggu, diproses, tinjau, selesai, total] = await Promise.all([
    hitung(["SUBMITTED"]),
    hitung(["VERIFIED", "ASSIGNED", "IN_PROGRESS"]),
    hitung(["UNDER_REVIEW"]),
    hitung(["RESOLVED"]),
    hitung(),
  ]);
  if ([menunggu, diproses, tinjau, selesai, total].some((r) => r.error)) return null;
  return {
    menungguVerifikasi: menunggu.count ?? 0,
    diproses: diproses.count ?? 0,
    peninjauanBukti: tinjau.count ?? 0,
    selesai: selesai.count ?? 0,
    total: total.count ?? 0,
  };
}
