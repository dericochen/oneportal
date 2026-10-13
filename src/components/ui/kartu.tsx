import Link from "next/link";
import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";

/**
 * Kartu hanya untuk objek yang bisa diklik (laporan, layanan, tugas), jadi
 * selalu berupa tautan. Hover hanya mengubah border; tanpa membesar/terangkat.
 * Tanpa kartu di dalam kartu, tanpa garis warna di sisi kiri.
 */
export function Kartu({ className, children, ...rest }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cx(
        "block rounded-md border border-garis bg-putih p-4 transition-colors duration-150 ease-keluar hover:border-aspal",
        className,
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}
