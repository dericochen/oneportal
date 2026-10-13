import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/cx";

export type VarianTombol = "utama" | "kedua" | "ketiga" | "lapor" | "bahaya";
export type UkuranTombol = "normal" | "besar";

const dasar =
  "inline-flex items-center justify-center gap-2 rounded-sm font-semibold transition-colors duration-150 ease-keluar select-none disabled:cursor-not-allowed aria-disabled:cursor-not-allowed";

const varian: Record<VarianTombol, string> = {
  utama: "bg-aspal text-putih border-2 border-aspal hover:bg-aspal-2 hover:border-aspal-2 disabled:bg-garis-tegas disabled:border-garis-tegas",
  kedua: "bg-putih text-aspal border-2 border-aspal hover:bg-abu disabled:text-aspal-2 disabled:border-garis-tegas",
  ketiga: "text-biru underline underline-offset-4 decoration-1 hover:decoration-2 disabled:text-aspal-2",
  lapor: "bg-kuning text-aspal border-2 border-aspal hover:bg-aspal hover:text-kuning disabled:opacity-60",
  bahaya: "bg-merah text-putih border-2 border-merah hover:bg-aspal hover:border-aspal disabled:opacity-60",
};

const ukuran: Record<UkuranTombol, string> = {
  normal: "min-h-11 px-4 py-2",
  besar: "min-h-14 px-6 py-3 text-h3",
};

/** Kelas tombol untuk elemen lain (mis. label unggah file). */
export function kelasTombol(v: VarianTombol = "utama", u: UkuranTombol = "normal", lebarPenuh = false) {
  return cx(dasar, varian[v], v === "ketiga" ? "min-h-11 px-1" : ukuran[u], lebarPenuh && "w-full");
}

function Pemutar() {
  return (
    <span
      aria-hidden
      className="size-4 shrink-0 animate-putar rounded-full border-2 border-current border-r-transparent"
    />
  );
}

type PropsTombol = ComponentProps<"button"> & {
  varian?: VarianTombol;
  ukuran?: UkuranTombol;
  lebarPenuh?: boolean;
  /** Saat true: tombol nonaktif dan menampilkan `teksMemuat`. */
  memuat?: boolean;
  teksMemuat?: string;
  ikon?: ReactNode;
};

export function Tombol({
  varian: v = "utama",
  ukuran: u = "normal",
  lebarPenuh,
  memuat,
  teksMemuat,
  ikon,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: PropsTombol) {
  return (
    <button
      type={type}
      className={cx(kelasTombol(v, u, lebarPenuh), className)}
      disabled={disabled || memuat}
      aria-busy={memuat || undefined}
      {...rest}
    >
      {memuat ? <Pemutar /> : ikon}
      <span>{memuat && teksMemuat ? teksMemuat : children}</span>
    </button>
  );
}

type PropsTombolTautan = ComponentProps<typeof Link> & {
  varian?: VarianTombol;
  ukuran?: UkuranTombol;
  lebarPenuh?: boolean;
  ikon?: ReactNode;
};

export function TombolTautan({
  varian: v = "utama",
  ukuran: u = "normal",
  lebarPenuh,
  ikon,
  className,
  children,
  ...rest
}: PropsTombolTautan) {
  return (
    <Link className={cx(kelasTombol(v, u, lebarPenuh), className)} {...rest}>
      {ikon}
      <span>{children}</span>
    </Link>
  );
}
