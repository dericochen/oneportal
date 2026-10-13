import { UserCircle } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { TombolTautan } from "@/components/ui/tombol";
import { Logo } from "@/components/ui/logo";
import { ambilSesi } from "@/lib/auth";
import { BERANDA_PERAN, LABEL_PERAN } from "@/lib/domain/laporan";
import { LoncengNotifikasi } from "./lonceng-notifikasi";
import { NAV_PUBLIK, tersediaSaja } from "./navigasi";
import { TautanAktif } from "./tautan-aktif";

/**
 * Header publik: logo kiri; Layanan, Lapor, Lacak, Peta, Statistik (yang
 * sudah tersedia); Masuk/akun di kanan. Di HP navigasi pindah ke bottom nav.
 */
export async function HeaderPublik() {
  const sesi = await ambilSesi();
  const nav = tersediaSaja(NAV_PUBLIK);
  const lapor = nav.find((b) => b.lapor);
  const biasa = nav.filter((b) => !b.lapor);

  return (
    <header className="tanpa-cetak sticky top-0 z-30 border-b border-garis bg-putih">
      <div className="mx-auto flex min-h-16 w-full max-w-daftar items-center gap-4 px-4 md:px-6">
        <Logo href="/" />
        {biasa.length > 0 && (
          <nav aria-label="Navigasi utama" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {biasa.map((b) => (
                <li key={b.href}>
                  <TautanAktif
                    href={b.href}
                    className="inline-flex min-h-11 items-center rounded-sm px-3 font-semibold text-aspal-2 hover:text-aspal"
                    kelasAktif="text-aspal underline decoration-2 underline-offset-8"
                  >
                    {b.label}
                  </TautanAktif>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <div className="ml-auto flex items-center gap-2">
          {lapor && (
            <TombolTautan href={lapor.href} varian="lapor" className="hidden md:inline-flex">
              Lapor masalah
            </TombolTautan>
          )}
          {sesi ? (
            <>
              <LoncengNotifikasi />
              <Link
                href={BERANDA_PERAN[sesi.peran]}
                className="inline-flex min-h-11 items-center gap-2 rounded-sm px-2 font-semibold hover:bg-abu"
              >
                <UserCircle aria-hidden className="size-6" />
                <span className="hidden sm:inline">{sesi.peran === "CITIZEN" ? "Akun saya" : LABEL_PERAN[sesi.peran]}</span>
                <span className="sr-only sm:hidden">Akun saya</span>
              </Link>
            </>
          ) : (
            <TombolTautan href="/masuk" varian="kedua">
              Masuk
            </TombolTautan>
          )}
        </div>
      </div>
    </header>
  );
}
