import type { Metadata } from "next";
import Link from "next/link";
import { PetaMini } from "@/components/peta/peta-publik";
import { Masukan } from "@/components/ui/isian";
import { LayarKosong, PesanGagal } from "@/components/ui/keadaan";
import { LogResi, type KejadianLog } from "@/components/ui/log-resi";
import { PelatKategori } from "@/components/ui/pelat-kategori";
import { PenggeserBukti } from "@/components/ui/penggeser-bukti";
import { Tombol, TombolTautan } from "@/components/ui/tombol";
import { ambilBaruSelesai, ambilStatistikPublik, ambilTitikPeta } from "@/lib/data/publik";
import { formatAngka, formatDurasi, formatTanggalPendek } from "@/lib/format";
import { ambilPengaturan } from "@/lib/pengaturan";

export const metadata: Metadata = {
  title: { absolute: "ONE PORTAL, layanan publik Kota Medan" },
};

// Contoh alur (ilustrasi kasus OP-2026-00182). Waktu UTC, tampil 09.10–16.25 WIB.
const CONTOH_ALUR: KejadianLog[] = [
  { id: "1", waktu: "2026-10-14T02:10:00Z", judul: "Warga mengirim laporan dengan foto", aktor: "Pelapor", status: "SUBMITTED" },
  { id: "2", waktu: "2026-10-14T02:25:00Z", judul: "Admin memverifikasi, prioritas tinggi karena dekat sekolah", aktor: "Admin", status: "VERIFIED" },
  { id: "3", waktu: "2026-10-14T02:40:00Z", judul: "Ditugaskan ke petugas Dinas SDABMBK", aktor: "Admin", status: "ASSIGNED" },
  { id: "4", waktu: "2026-10-14T06:20:00Z", judul: "Petugas mulai menambal lubang", aktor: "Petugas Dinas SDABMBK", status: "IN_PROGRESS" },
  { id: "5", waktu: "2026-10-14T09:00:00Z", judul: "Foto sebelum dan sesudah diunggah", aktor: "Petugas Dinas SDABMBK", status: "UNDER_REVIEW" },
  { id: "6", waktu: "2026-10-14T09:25:00Z", judul: "Admin menyetujui bukti, laporan selesai dan tampil di peta", aktor: "Admin", status: "RESOLVED" },
];

export default async function Beranda() {
  const [pengaturan, statistik, titik, selesai] = await Promise.all([
    ambilPengaturan(),
    ambilStatistikPublik(30),
    ambilTitikPeta({ hari: 120 }),
    ambilBaruSelesai(3),
  ]);

  return (
    <div className="flex flex-col">
      {/* Blok tugas: hal yang ingin dilakukan warga, rata kiri. */}
      <section aria-labelledby="judul-beranda" className="border-b border-garis">
        <div className="mx-auto grid w-full max-w-daftar gap-8 px-4 py-8 md:px-6 md:py-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="flex max-w-baca flex-col gap-4">
            <h1 id="judul-beranda" className="text-h1">
              Ada masalah di jalan, parit, atau lingkungan Anda?
            </h1>
            <p>{pengaturan["beranda.kalimat_pembuka"]}</p>
            <TombolTautan href="/lapor" varian="lapor" ukuran="besar" className="self-start">
              Lapor masalah
            </TombolTautan>
          </div>
          <form action="/lacak" method="get" className="flex flex-col gap-3 rounded-md border-2 border-aspal p-4" aria-label="Lacak laporan">
            <Masukan name="kode" label="Lacak laporan" petunjuk="Masukkan kode di resi, contoh OP-2026-00182" autoComplete="off" spellCheck={false} />
            <Tombol type="submit" varian="kedua">
              Lacak
            </Tombol>
          </form>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-daftar flex-col gap-12 px-4 py-12 md:px-6">
        <section aria-labelledby="judul-minggu" className="flex flex-col gap-4">
          <h2 id="judul-minggu" className="text-h2">
            Minggu ini di Medan
          </h2>
          {statistik ? (
            <p className="max-w-baca">
              {statistik.masuk7Hari === 0 && statistik.selesai7Hari === 0
                ? "Belum ada laporan masuk dalam 7 hari terakhir."
                : `${formatAngka(statistik.masuk7Hari)} laporan masuk dan ${formatAngka(statistik.selesai7Hari)} selesai dalam 7 hari terakhir.`}
              {statistik.selesai > 0 && statistik.rataJamSelesai !== null &&
                ` Dalam 30 hari terakhir ${formatAngka(statistik.selesai)} laporan selesai, rata-rata dalam ${formatDurasi(statistik.rataJamSelesai)}.`}
            </p>
          ) : (
            <PesanGagal judul="Angka belum termuat" pesan="Server data tidak dapat dihubungi. Muat ulang halaman ini." />
          )}
          {titik && <PetaMini titik={titik} />}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-kecil text-aspal-2">
              Titik hijau = selesai, biru = sedang dikerjakan, abu = menunggu ditangani. Data simulasi prototipe.
            </p>
            <Link href="/peta" className="tautan font-semibold">
              Buka peta lengkap
            </Link>
          </div>
        </section>

        <section aria-labelledby="judul-selesai" className="flex flex-col gap-4">
          <h2 id="judul-selesai" className="text-h2">
            Baru saja selesai
          </h2>
          {!selesai ? (
            <PesanGagal judul="Bukti penyelesaian belum termuat" pesan="Muat ulang halaman ini dalam beberapa saat." />
          ) : selesai.length === 0 ? (
            <LayarKosong pesan="Belum ada laporan yang selesai dengan bukti foto. Laporan pertama yang selesai akan tampil di sini." />
          ) : (
            <ul className="grid gap-6 md:grid-cols-3">
              {selesai.map((s) => (
                <li key={s.id} className="flex flex-col gap-3">
                  {s.fotoSebelum && s.fotoSesudah && (
                    <PenggeserBukti
                      sebelum={s.fotoSebelum}
                      sesudah={s.fotoSesudah}
                      labelSebelum={`Sebelum, ${formatTanggalPendek(s.masukPada)}`}
                      labelSesudah={`Sesudah, ${formatTanggalPendek(s.selesaiPada)}`}
                      alt={s.judul}
                    />
                  )}
                  <div className="flex items-start gap-3">
                    <PelatKategori slug={s.kategoriSlug} />
                    <div className="min-w-0">
                      <Link href={`/lacak/${s.kode}`} className="font-semibold break-words hover:underline">
                        {s.judul}
                      </Link>
                      <p className="text-kecil text-aspal-2">
                        {s.kelurahan}, {s.kecamatan}. Selesai dalam {formatDurasi(s.jamPengerjaan)}
                        {s.instansi ? ` oleh ${s.instansi}` : ""}.
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="judul-alur" className="grid gap-6 border-t border-garis pt-12 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
          <div className="flex flex-col gap-3">
            <h2 id="judul-alur" className="text-h2">
              Bagaimana laporan ditangani
            </h2>
            <p className="text-aspal-2">
              Contoh satu laporan jalan berlubang di depan sekolah, dari masuk sampai selesai pada hari yang sama. Laporan baru
              dinyatakan selesai setelah admin memeriksa foto sebelum dan sesudah dari petugas.
            </p>
          </div>
          <LogResi kejadian={CONTOH_ALUR} />
        </section>
      </div>
    </div>
  );
}
