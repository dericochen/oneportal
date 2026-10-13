import Image from "next/image";
import { cx } from "@/lib/cx";

/**
 * Logo "Medan Untuk Semua" (berkas asli di public/logo-medan.png, 500x88) di
 * atas piring putih supaya terbaca di latar biru hero. Lebar mengikuti
 * `font-size` elemen, jadi cukup beri kelas teks (mis. `text-h1`).
 */
export function LogoMedan({ className }: { className?: string }) {
  return (
    <span className={cx("inline-flex rounded-md bg-putih p-[0.25em] leading-none", className)}>
      <Image
        src="/logo-medan.png"
        alt="Medan Untuk Semua"
        width={500}
        height={88}
        preload
        className="h-auto w-[8.5em] max-w-full"
      />
    </span>
  );
}
