import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ambilSesi } from "@/lib/auth";
import { BERANDA_PERAN } from "@/lib/domain/laporan";
import { FormMasuk, KotakAkunDemo } from "./form-masuk";

export const metadata: Metadata = { title: "Masuk" };

export default async function HalamanMasuk(props: PageProps<"/masuk">) {
  const sp = await props.searchParams;
  const lanjut = typeof sp.lanjut === "string" ? sp.lanjut : undefined;
  const baruKeluar = sp.keluar === "1";

  const sesi = await ambilSesi();
  if (sesi) redirect(BERANDA_PERAN[sesi.peran]);

  return (
    <div className="mx-auto grid w-full max-w-daftar gap-12 px-4 py-8 md:px-6 md:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
      <div className="flex max-w-form flex-col gap-6">
        <div>
          <h1 className="text-h1">Masuk</h1>
          <p className="mt-2 text-aspal-2">
            {lanjut ? "Masuk dulu untuk melanjutkan ke halaman yang Anda buka." : "Masuk untuk membuat dan melacak laporan Anda."}
          </p>
        </div>
        {baruKeluar && (
          <p role="status" className="rounded-md bg-abu p-4">
            Anda sudah keluar. Sampai jumpa lagi.
          </p>
        )}
        <FormMasuk lanjut={lanjut} />
        <p>
          Belum punya akun?{" "}
          <Link href={lanjut ? `/daftar?lanjut=${encodeURIComponent(lanjut)}` : "/daftar"} className="tautan">
            Daftar sebagai warga
          </Link>
        </p>
      </div>
      <KotakAkunDemo lanjut={lanjut} />
    </div>
  );
}
