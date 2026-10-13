"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { BERANDA_PERAN, type Peran } from "@/lib/domain/laporan";
import { AKUN_DEMO, KATA_SANDI_DEMO, type KunciDemo } from "@/lib/demo";
import { pesanGalat } from "@/lib/galat";
import { buatKlienServer } from "@/lib/supabase/server";

export type HasilForm = {
  galat?: string;
  kolom?: Partial<Record<string, string>>;
  nilai?: Record<string, string>;
};

/** Hanya izinkan tujuan relatif di situs ini (mencegah open redirect). */
function tujuanAman(lanjut: unknown): string | null {
  if (typeof lanjut !== "string") return null;
  if (!lanjut.startsWith("/") || lanjut.startsWith("//") || lanjut.startsWith("/\\")) return null;
  if (lanjut.startsWith("/masuk") || lanjut.startsWith("/daftar")) return null;
  return lanjut;
}

async function berandaPengguna(id: string, lanjut: string | null): Promise<string> {
  if (lanjut) return lanjut;
  const supabase = await buatKlienServer();
  const { data } = await supabase.from("profiles").select("role").eq("id", id).maybeSingle();
  return BERANDA_PERAN[(data?.role as Peran) ?? "CITIZEN"];
}

const skemaMasuk = z.object({
  email: z.email({ error: "Masukkan email yang valid, contoh: nama@contoh.com." }).max(254),
  kata_sandi: z.string().min(1, { error: "Masukkan kata sandi." }).max(128),
});

export async function masuk(_: HasilForm, data: FormData): Promise<HasilForm> {
  const nilai = { email: String(data.get("email") ?? "").trim() };
  const cek = skemaMasuk.safeParse({ email: nilai.email, kata_sandi: data.get("kata_sandi") });
  if (!cek.success) {
    const kolom: HasilForm["kolom"] = {};
    for (const i of cek.error.issues) kolom[String(i.path[0])] ??= i.message;
    return { kolom, nilai };
  }

  const supabase = await buatKlienServer();
  const { data: hasil, error } = await supabase.auth.signInWithPassword({
    email: cek.data.email,
    password: cek.data.kata_sandi,
  });
  if (error || !hasil.user) return { galat: pesanGalat(error), nilai };

  redirect(await berandaPengguna(hasil.user.id, tujuanAman(data.get("lanjut"))));
}

/** Mode Juri: masuk cepat dengan satu klik sebagai salah satu akun demo. */
export async function masukDemo(_: HasilForm, data: FormData): Promise<HasilForm> {
  const akun = AKUN_DEMO.find((a) => a.kunci === (data.get("akun") as KunciDemo));
  if (!akun) return { galat: "Akun demo tidak dikenal." };
  const supabase = await buatKlienServer();
  const { data: hasil, error } = await supabase.auth.signInWithPassword({ email: akun.email, password: KATA_SANDI_DEMO });
  if (error || !hasil.user) {
    return {
      galat:
        error?.message && /invalid login credentials/i.test(error.message)
          ? "Akun demo belum dibuat di database. Tim perlu menjalankan npm run db:seed."
          : pesanGalat(error),
    };
  }
  redirect(await berandaPengguna(hasil.user.id, tujuanAman(data.get("lanjut"))));
}

const skemaDaftar = z.object({
  nama: z
    .string()
    .trim()
    .min(2, { error: "Tulis nama Anda, minimal 2 huruf." })
    .max(120, { error: "Nama paling panjang 120 karakter." }),
  email: z.email({ error: "Masukkan email yang valid, contoh: nama@contoh.com." }).max(254),
  hp: z
    .string()
    .trim()
    .regex(/^(\+?[0-9 -]{8,20})?$/, { error: "Nomor HP tidak valid. Contoh: 0812 3456 7890." }),
  kata_sandi: z
    .string()
    .min(8, { error: "Kata sandi minimal 8 karakter." })
    .max(72, { error: "Kata sandi paling panjang 72 karakter." }),
  setuju: z.literal("ya", { error: "Centang persetujuan untuk membuat akun." }),
});

export async function daftar(_: HasilForm, data: FormData): Promise<HasilForm> {
  const nilai = {
    nama: String(data.get("nama") ?? ""),
    email: String(data.get("email") ?? "").trim(),
    hp: String(data.get("hp") ?? ""),
  };
  const cek = skemaDaftar.safeParse({ ...nilai, kata_sandi: data.get("kata_sandi"), setuju: data.get("setuju") });
  if (!cek.success) {
    const kolom: HasilForm["kolom"] = {};
    for (const i of cek.error.issues) kolom[String(i.path[0])] ??= i.message;
    return { kolom, nilai };
  }

  const supabase = await buatKlienServer();
  // Peran tidak dikirim: trigger database selalu membuat akun baru sebagai warga.
  const { data: hasil, error } = await supabase.auth.signUp({
    email: cek.data.email,
    password: cek.data.kata_sandi,
    options: { data: { full_name: cek.data.nama, phone: cek.data.hp || null } },
  });
  if (error) return { galat: pesanGalat(error), nilai };
  if (!hasil.session) {
    // "Confirm email" masih menyala di Supabase.
    return {
      galat: "Akun dibuat, tetapi email perlu dikonfirmasi lebih dulu. Buka email Anda, klik tautan konfirmasi, lalu masuk.",
      nilai,
    };
  }
  redirect(tujuanAman(data.get("lanjut")) ?? "/akun");
}

export async function keluar() {
  const supabase = await buatKlienServer();
  await supabase.auth.signOut();
  redirect("/masuk?keluar=1");
}
