"use client";

import { CaretLeft, CaretRight, Pause, Play } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cx } from "@/lib/cx";
import { DURASI_SLIDE_MS, type Slide } from "@/lib/domain/slide";

/**
 * Slideshow hero beranda (DESIGN.md bagian 6, momen 5). Berganti tiap
 * DURASI_SLIDE_MS (2 detik). Agar aman untuk semua pengguna:
 * - berhenti saat kursor atau fokus keyboard ada di dalamnya;
 * - tombol Jeda/Putar, panah, indikator, geser di layar sentuh, tombol panah keyboard;
 * - tidak jalan otomatis bila pengguna memilih `prefers-reduced-motion`;
 * - slide yang tidak tampil di-`inert`, jadi tautannya tidak bisa difokus;
 * - pembaca layar hanya diberi pengumuman saat slideshow sedang dijeda.
 */

const QUERY_GERAK = "(prefers-reduced-motion: reduce)";

function useGerakDikurangi() {
  return useSyncExternalStore(
    (ubah) => {
      const m = window.matchMedia(QUERY_GERAK);
      m.addEventListener("change", ubah);
      return () => m.removeEventListener("change", ubah);
    },
    () => window.matchMedia(QUERY_GERAK).matches,
    () => false,
  );
}

function TautanSlide({ slide }: { slide: Slide }) {
  if (!slide.tautan || !slide.labelTautan) return null;
  const kelas = "mt-2 inline-flex min-h-11 items-center font-semibold text-putih underline decoration-2 underline-offset-4";
  const isi: ReactNode = slide.labelTautan;
  return slide.tautan.startsWith("/") ? (
    <Link href={slide.tautan} className={kelas}>
      {isi}
    </Link>
  ) : (
    <a href={slide.tautan} className={kelas} rel="noopener noreferrer">
      {isi}
    </a>
  );
}

function IsiSlide({ slide, urutan }: { slide: Slide; urutan: number }) {
  if (slide.gambar) {
    return (
      <>
        <Image
          src={slide.gambar}
          alt={slide.judul}
          fill
          sizes="(min-width: 1024px) 480px, (min-width: 768px) 640px, 100vw"
          loading={urutan === 0 ? "eager" : undefined}
          fetchPriority={urutan === 0 ? "high" : undefined}
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-col bg-aspal/85 px-4 pt-3 pb-2 text-putih">
          <p className="text-h3 font-bold [overflow-wrap:anywhere]">{slide.judul}</p>
          {slide.keterangan && <p className="text-kecil">{slide.keterangan}</p>}
          <TautanSlide slide={slide} />
        </div>
      </>
    );
  }
  // Slide teks: panel merah atau biru bercorak songket, bergantian.
  return (
    <div
      className={cx(
        "absolute inset-0 flex flex-col justify-center gap-2 p-6 text-putih md:p-8",
        urutan % 2 === 0 ? "corak-songket-merah" : "corak-songket",
      )}
    >
      <p className="text-h2 font-bold [overflow-wrap:anywhere]">{slide.judul}</p>
      {slide.keterangan && <p className="max-w-baca">{slide.keterangan}</p>}
      <TautanSlide slide={slide} />
    </div>
  );
}

const kelasTombolIkon =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-sm border-2 border-putih bg-putih text-aspal transition-colors duration-150 ease-keluar hover:bg-kuning";

export function SlideBeranda({ slide, className }: { slide: Slide[]; className?: string }) {
  const n = slide.length;
  const [indeks, setIndeks] = useState(0);
  const [dijeda, setDijeda] = useState(false);
  const [kursor, setKursor] = useState(false);
  const [fokus, setFokus] = useState(false);
  const kurangiGerak = useGerakDikurangi();
  const awalSentuh = useRef<number | null>(null);

  const aktif = Math.min(indeks, Math.max(n - 1, 0));
  const jalan = n > 1 && !dijeda && !kursor && !fokus && !kurangiGerak;

  // Timeout (bukan interval) yang dikunci pada slide aktif: pindah manual
  // otomatis memulai hitungan 2 detik dari awal.
  useEffect(() => {
    if (!jalan) return;
    const t = window.setTimeout(() => setIndeks((aktif + 1) % n), DURASI_SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [jalan, aktif, n]);

  if (n === 0) return null;

  const pindah = (i: number) => setIndeks(((i % n) + n) % n);

  function tekanTombol(e: KeyboardEvent<HTMLElement>) {
    if (e.key === "ArrowLeft") pindah(aktif - 1);
    else if (e.key === "ArrowRight") pindah(aktif + 1);
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Sorotan Medan Untuk Semua"
      className={cx("relative pr-3 pb-3", className)}
      onMouseEnter={() => setKursor(true)}
      onMouseLeave={() => setKursor(false)}
      onFocus={(e) => setFokus(e.target.matches(":focus-visible"))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFokus(false);
      }}
      onKeyDown={tekanTombol}
    >
      {/* Blok merah di belakang bingkai: datar, tanpa bayangan. */}
      <span aria-hidden className="absolute top-3 right-0 bottom-0 left-3 rounded-md bg-medan-merah" />
      <div
        aria-live={jalan ? "off" : "polite"}
        className="relative aspect-[4/3] overflow-hidden rounded-md border-2 border-putih bg-aspal"
        onTouchStart={(e) => {
          awalSentuh.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const awal = awalSentuh.current;
          awalSentuh.current = null;
          if (awal === null) return;
          const selisih = (e.changedTouches[0]?.clientX ?? awal) - awal;
          if (Math.abs(selisih) > 48) pindah(aktif + (selisih < 0 ? 1 : -1));
        }}
      >
        {slide.map((s, i) => (
          <div
            key={s.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} dari ${n}`}
            aria-hidden={i !== aktif}
            inert={i !== aktif}
            className={cx(
              "absolute inset-0 transition-opacity duration-200 ease-keluar",
              i === aktif ? "z-10 opacity-100" : "z-0 opacity-0",
            )}
          >
            <IsiSlide slide={s} urutan={i} />
          </div>
        ))}
      </div>

      {n > 1 && (
        <div className="relative mt-3 flex items-center gap-2">
          <button type="button" onClick={() => pindah(aktif - 1)} aria-label="Slide sebelumnya" className={kelasTombolIkon}>
            <CaretLeft aria-hidden weight="bold" className="size-5" />
          </button>
          {!kurangiGerak && (
            <button
              type="button"
              onClick={() => {
                // Menekan Putar harus langsung berjalan, walau kursor masih di atas slideshow.
                if (dijeda) setKursor(false);
                setDijeda((d) => !d);
              }}
              aria-label={dijeda ? "Putar slideshow" : "Jeda slideshow"}
              className={kelasTombolIkon}
            >
              {dijeda ? <Play aria-hidden weight="fill" className="size-5" /> : <Pause aria-hidden weight="fill" className="size-5" />}
            </button>
          )}
          <button type="button" onClick={() => pindah(aktif + 1)} aria-label="Slide berikutnya" className={kelasTombolIkon}>
            <CaretRight aria-hidden weight="bold" className="size-5" />
          </button>
          <ul className="flex flex-1 flex-wrap items-center justify-end">
            {slide.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => pindah(i)}
                  aria-label={`Ke slide ${i + 1}: ${s.judul}`}
                  aria-current={i === aktif ? "true" : undefined}
                  className="inline-flex min-h-11 min-w-8 items-center justify-center"
                >
                  <span aria-hidden className={cx("h-1.5 w-6 rounded-sm", i === aktif ? "bg-kuning" : "bg-putih/50")} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
