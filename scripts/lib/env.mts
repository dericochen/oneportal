/** Utilitas bersama skrip: memuat .env.local dan membuat klien. */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { join } from "node:path";
import pg from "pg";

config({ path: join(import.meta.dirname, "..", "..", ".env.local"), quiet: true });

export function wajibEnv(nama: string): string {
  const v = process.env[nama];
  if (!v) {
    console.error(`Variabel ${nama} belum diisi di .env.local. Lihat .env.example dan README.`);
    process.exit(1);
  }
  return v;
}

export async function klienDb() {
  const db = new pg.Client({
    connectionString: wajibEnv("SUPABASE_DB_URL"),
    // Supabase memakai sertifikat yang ditandatangani CA publik.
    ssl: { rejectUnauthorized: false },
  });
  await db.connect();
  return db;
}

/** Klien admin Supabase (service role). Hanya untuk skrip di mesin tim. */
export function klienAdmin() {
  return createClient(wajibEnv("NEXT_PUBLIC_SUPABASE_URL"), wajibEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
