"use client";

import { useActionState } from "react";
import { daftar, type HasilForm } from "@/aksi/auth";
import { KotakCentang, Masukan, PesanError, RingkasanError } from "@/components/ui/isian";
import { TombolKirim } from "@/components/ui/tombol-kirim";

const LABEL_KOLOM: Record<string, string> = {
  nama: "nama",
  email: "email",
  hp: "hp",
  kata_sandi: "kata_sandi",
  setuju: "setuju-ya",
};

export function FormDaftar({ lanjut }: { lanjut?: string }) {
  const [hasil, aksi] = useActionState<HasilForm, FormData>(daftar, {});
  const galatKolom = Object.entries(hasil.kolom ?? {}).map(([k, pesan]) => ({ id: LABEL_KOLOM[k] ?? k, pesan: pesan ?? "" }));

  return (
    <form action={aksi} noValidate className="flex flex-col gap-6">
      {lanjut && <input type="hidden" name="lanjut" value={lanjut} />}
      <RingkasanError galat={galatKolom} />
      {hasil.galat && (
        <div role="alert" className="rounded-md border-2 border-merah p-4">
          <PesanError>{hasil.galat}</PesanError>
        </div>
      )}
      <Masukan
        name="nama"
        label="Nama"
        petunjuk="Nama tidak pernah ditampilkan ke publik."
        autoComplete="name"
        defaultValue={hasil.nilai?.nama}
        error={hasil.kolom?.nama}
        wajib
      />
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
        name="hp"
        type="tel"
        label="Nomor HP"
        petunjuk="Dipakai petugas bila perlu menanyakan lokasi. Anda bisa mengosongkannya."
        autoComplete="tel"
        inputMode="tel"
        defaultValue={hasil.nilai?.hp}
        error={hasil.kolom?.hp}
        opsional
      />
      <Masukan
        name="kata_sandi"
        type="password"
        label="Kata sandi"
        petunjuk="Minimal 8 karakter."
        autoComplete="new-password"
        error={hasil.kolom?.kata_sandi}
        wajib
      />
      <div>
        <KotakCentang
          name="setuju"
          value="ya"
          label="Saya setuju data saya diproses untuk menangani laporan"
          keterangan="ONE PORTAL tidak meminta NIK. Identitas Anda tidak pernah tampil di halaman publik."
        />
        {hasil.kolom?.setuju && <PesanError>{hasil.kolom.setuju}</PesanError>}
      </div>
      <TombolKirim teksMemuat="Membuat akun…" lebarPenuh>
        Buat akun
      </TombolKirim>
    </form>
  );
}
