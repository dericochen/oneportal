import type { Metadata } from "next";
import { RingkasanAngka } from "@/components/staf/ringkasan-angka";
import { wajibPeran } from "@/lib/auth";
import { ambilRingkasanStaf } from "@/lib/data/ringkasan";

export const metadata: Metadata = { title: "Command center" };

export default async function BerandaAdmin() {
  const sesi = await wajibPeran(["ADMIN"], "/admin");
  const ringkasan = await ambilRingkasanStaf();
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-h1">Command center</h1>
        <p className="mt-1 text-aspal-2">Masuk sebagai {sesi.namaLengkap}, admin ONE PORTAL.</p>
      </header>
      <RingkasanAngka data={ringkasan} />
    </div>
  );
}
