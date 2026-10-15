import type { Metadata } from "next";
import { type BarisAkun, KelolaAkun } from "@/components/staf/kelola-akun";
import { PesanGagal } from "@/components/ui/keadaan";
import { wajibPeran } from "@/lib/auth";
import type { Peran } from "@/lib/domain/laporan";
import { buatKlienServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Kelola akun" };

/** Supervisor membuat & mengelola akun admin, petugas, supervisor (dan warga). */
export default async function HalamanAkunStaf() {
  const sesi = await wajibPeran(["SUPERVISOR"], "/supervisor/akun");
  const supabase = await buatKlienServer();
  const [akun, ins] = await Promise.all([
    supabase.rpc("staff_list_accounts"),
    supabase.from("agencies").select("id, short_name").eq("kind", "INTERNAL").eq("is_active", true).is("deleted_at", null).order("short_name"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-h1">Kelola akun</h1>
        <p className="mt-1 max-w-baca text-aspal-2">
          Warga mendaftar sendiri. Akun admin, petugas lapangan, dan supervisor hanya dibuat di sini. Pemilik akun masuk lewat halaman Masuk
          biasa, lalu sistem langsung membuka halaman sesuai perannya.
        </p>
      </header>
      {akun.error ? (
        <PesanGagal judul="Daftar akun belum termuat" pesan="Muat ulang halaman ini." />
      ) : (
        <KelolaAkun
          idSaya={sesi.id}
          instansi={(ins.data ?? []).map((a) => ({ id: a.id, nama: a.short_name }))}
          akun={((akun.data ?? []) as Array<Record<string, unknown>>).map<BarisAkun>((a) => ({
            id: a.id as string,
            email: (a.email as string) ?? "",
            nama: (a.full_name as string) || "(tanpa nama)",
            hp: (a.phone as string) ?? "",
            peran: a.role as Peran,
            instansiId: (a.agency_id as string) ?? null,
            instansi: (a.agency_name as string) ?? null,
            aktif: Boolean(a.is_active),
            demo: Boolean(a.is_demo),
            tugasAktif: Number(a.active_tasks ?? 0),
            dibuat: a.created_at as string,
            terakhirMasuk: (a.last_sign_in_at as string) ?? null,
          }))}
        />
      )}
    </div>
  );
}
