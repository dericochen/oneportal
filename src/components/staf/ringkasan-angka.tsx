import { PesanGagal } from "@/components/ui/keadaan";
import type { RingkasanStaf } from "@/lib/data/ringkasan";
import { formatAngka } from "@/lib/format";

/**
 * Pembuka command center: kalimat ringkasan dari data + deretan angka dipisah
 * garis tipis (bukan kartu KPI berikon). DESIGN.md / PROMPT 3 bagian 4.
 */
export function RingkasanAngka({ data }: { data: RingkasanStaf | null }) {
  if (!data) {
    return (
      <PesanGagal judul="Ringkasan belum termuat" pesan="Koneksi ke server data terputus. Muat ulang halaman ini." />
    );
  }
  const angka = [
    { label: "Menunggu verifikasi", nilai: data.menungguVerifikasi },
    { label: "Sedang diproses", nilai: data.diproses },
    { label: "Peninjauan bukti", nilai: data.peninjauanBukti },
    { label: "Selesai", nilai: data.selesai },
    { label: "Total laporan", nilai: data.total },
  ];
  const kalimat =
    data.total === 0
      ? "Belum ada laporan yang masuk. Laporan pertama dari warga akan langsung tampil di sini."
      : `${formatAngka(data.menungguVerifikasi)} laporan menunggu verifikasi, ${formatAngka(data.diproses)} sedang diproses, dan ${formatAngka(data.selesai)} sudah selesai dengan bukti yang disetujui.`;

  return (
    <section aria-labelledby="judul-ringkasan" className="flex flex-col gap-4">
      <h2 id="judul-ringkasan" className="text-h3">
        Ringkasan saat ini
      </h2>
      <p className="max-w-baca">{kalimat}</p>
      <dl className="grid grid-cols-2 border-y border-garis sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-garis">
        {angka.map((a) => (
          <div key={a.label} className="flex flex-col gap-1 border-b border-garis px-4 py-4 last:border-b-0 lg:border-b-0">
            <dt className="text-kecil-staf text-aspal-2">{a.label}</dt>
            <dd className="text-h2 font-bold tabular-nums">{formatAngka(a.nilai)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
