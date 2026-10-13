import { cx } from "@/lib/cx";

/**
 * Logo "Medan Untuk Semua": kotak merah bertulisan MEDAN miring dan kotak biru
 * UNTUK SEMUA di sebelahnya, di atas piring putih seperti berkas aslinya.
 * Dibuat dari HTML dan CSS (bukan gambar) supaya tajam di semua ukuran dan
 * terbaca pembaca layar. Ukuran mengikuti `font-size` elemen, jadi cukup beri
 * kelas teks (mis. `text-h2`).
 */
export function LogoMedan({ className }: { className?: string }) {
  return (
    <span role="img" aria-label="Medan Untuk Semua" className={cx("inline-flex rounded-md bg-putih p-[0.3em] leading-none select-none", className)}>
      <span aria-hidden className="inline-flex items-center">
        <span className="relative z-10 -skew-x-6 rounded-sm border-[0.07em] border-putih bg-medan-merah px-[0.4em] py-[0.16em] text-[1em] font-extrabold tracking-tight text-putih italic">
          MEDAN
        </span>
        <span className="-ml-[0.22em] rounded-sm bg-medan-biru py-[0.2em] pr-[0.45em] pl-[0.6em] text-[0.52em] font-bold tracking-tight whitespace-nowrap text-putih">
          UNTUK SEMUA
        </span>
      </span>
    </span>
  );
}
