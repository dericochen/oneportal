"use client";

import { useActionState } from "react";
import { type HasilForm, masuk, masukDemo } from "@/aksi/auth";
import { Masukan, PesanError } from "@/components/ui/isian";
import { TombolKirim } from "@/components/ui/tombol-kirim";
import { AKUN_DEMO, KATA_SANDI_DEMO } from "@/lib/demo";

export function FormMasuk({ lanjut }: { lanjut?: string }) {
  const [hasil, aksi] = useActionState<HasilForm, FormData>(masuk, {});
  return (
    <form action={aksi} noValidate className="flex flex-col gap-6">
      {lanjut && <input type="hidden" name="lanjut" value={lanjut} />}
      {hasil.galat && (
        <div role="alert" className="rounded-md border-2 border-merah p-4">
          <PesanError>{hasil.galat}</PesanError>
        </div>
      )}
      <Masukan
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        inputMode="email"
        defaultValue={hasil.nilai?.email}
        error={hasil.kolom?.email}
        wajib
      />
      <Masukan
        name="kata_sandi"
        type="password"
        label="Kata sandi"
        autoComplete="current-password"
        error={hasil.kolom?.kata_sandi}
        wajib
      />
      <TombolKirim teksMemuat="Memeriksa…" lebarPenuh>
        Masuk
      </TombolKirim>
    </form>
  );
}

/** Mode Juri: masuk cepat sebagai salah satu dari empat peran. */
export function KotakAkunDemo({ lanjut }: { lanjut?: string }) {
  const [hasil, aksi] = useActionState<HasilForm, FormData>(masukDemo, {});
  return (
    <section aria-labelledby="judul-demo" className="rounded-md border-2 border-aspal p-4 md:p-6">
      <h2 id="judul-demo" className="text-h3">
        Akun demo
      </h2>
      <p className="mt-1 text-aspal-2">
        Untuk juri dan penguji. Pilih peran untuk langsung masuk, atau ketik email di bawah dengan kata sandi{" "}
        <span className="font-kode font-bold text-aspal">{KATA_SANDI_DEMO}</span>.
      </p>
      <form action={aksi} className="mt-4 flex flex-col gap-3">
        {lanjut && <input type="hidden" name="lanjut" value={lanjut} />}
        {hasil.galat && <PesanError>{hasil.galat}</PesanError>}
        <ul className="flex flex-col gap-3">
          {AKUN_DEMO.map((a) => (
            <li key={a.kunci} className="flex flex-col gap-2 border-t border-garis pt-3 first:border-t-0 first:pt-0 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{a.label}</p>
                <p className="text-kecil text-aspal-2">{a.keterangan}</p>
                <p className="text-kecil break-all text-aspal-2">{a.email}</p>
              </div>
              <TombolKirim name="akun" value={a.kunci} varian="kedua" teksMemuat="Masuk…" className="sm:w-56">
                {`Masuk sebagai ${a.label.toLowerCase()}`}
              </TombolKirim>
            </li>
          ))}
        </ul>
      </form>
    </section>
  );
}
