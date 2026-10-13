"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/**
 * Tautan navigasi yang tahu dirinya sedang aktif (aria-current="page").
 * Isi (ikon + label) dirender di server dan dikirim sebagai children.
 * `persis`: aktif hanya bila path sama persis (untuk tautan beranda area).
 */
export function TautanAktif({
  href,
  persis,
  className,
  kelasAktif,
  children,
}: {
  href: string;
  persis?: boolean;
  className?: string;
  kelasAktif?: string;
  children: ReactNode;
}) {
  const path = usePathname();
  const aktif = persis ? path === href : path === href || path.startsWith(`${href}/`);
  return (
    <Link href={href} aria-current={aktif ? "page" : undefined} className={cx(className, aktif && kelasAktif)}>
      {children}
    </Link>
  );
}
