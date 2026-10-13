import type { Metadata } from "next";
import { PesanGagal } from "@/components/ui/keadaan";
import { TombolTautan } from "@/components/ui/tombol";
import { ambilSesi } from "@/lib/auth";
import { BERANDA_PERAN } from "@/lib/domain/laporan";
import { supabaseTerkonfigurasi } from "@/lib/env";
import { formatAngka } from "@/lib/format";
import { buatKlienServer } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: { absolute: "ONE PORTAL, layanan publik Kota Medan" },
};

/**
 * Beranda Fase 0. Tata letak beranda lengkap (blok tugas, Minggu ini di Medan,
 * Baru saja selesai, dst.) dibangun di Fase 1–2 setelah fitur Lapor, Lacak,
 * dan Layanan tersedia. Hanya menaut ke halaman yang sudah ada.
 */
async function hitungWilayah() {
  if (!supabaseTerkonfigurasi) return null;
  const supabase = await buatKlienServer();
  const [kec, kel, kat] = await Promise.all([
    supabase.from("districts").select("code", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("villages").select("code", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("report_categories").select("id", { count: "exact", head: true }).is("deleted_at", null),
  ]);
  if (kec.error || kel.error || kat.error) return null;
  return { kecamatan: kec.count ?? 0, kelurahan: kel.count ?? 0, kategori: kat.count ?? 0 };
}

export default async function Beranda() {
  const [sesi, wilayah] = await Promise.all([ambilSesi(), hitungWilayah()]);

  return (
    <div className="mx-auto flex w-full max-w-daftar flex-col gap-12 px-4 py-8 md:px-6 md:py-12">
      <section aria-labelledby="judul-beranda" className="flex max-w-baca flex-col gap-4">
        <h1 id="judul-beranda" className="text-h1">
          Satu pintu layanan publik Kota Medan
        </h1>
        <p>
          Laporkan jalan rusak, sampah, atau lampu jalan mati. Setiap laporan punya penanggung jawab dan tenggat, dan
          baru dinyatakan selesai setelah admin memeriksa foto sebelum dan sesudah pengerjaannya.
        </p>
        <div className="flex flex-wrap gap-3">
          {sesi ? (
            <TombolTautan href={BERANDA_PERAN[sesi.peran]}>Buka halaman saya</TombolTautan>
          ) : (
            <TombolTautan href="/masuk">Masuk atau coba akun demo</TombolTautan>
          )}
          <TombolTautan href="/desain" varian="kedua">
            Lihat sistem desain
          </TombolTautan>
        </div>
      </section>

      <section aria-labelledby="judul-wilayah" className="flex flex-col gap-3 border-t border-garis pt-8">
        <h2 id="judul-wilayah" className="text-h2">
          Wilayah layanan
        </h2>
        {wilayah ? (
          <p className="max-w-baca">
            ONE PORTAL mencakup {formatAngka(wilayah.kecamatan)} kecamatan dan {formatAngka(wilayah.kelurahan)} kelurahan di
            Kota Medan, dengan {formatAngka(wilayah.kategori)} kategori masalah yang bisa dilaporkan.
          </p>
        ) : (
          <PesanGagal
            judul="Data wilayah belum termuat"
            pesan="Server data belum terhubung. Muat ulang halaman ini dalam beberapa saat."
          />
        )}
        <p className="text-kecil text-aspal-2">
          Kode dan nama wilayah dari data kode wilayah Kemendagri. Batas wilayah dari OpenStreetMap.
        </p>
      </section>
    </div>
  );
}
