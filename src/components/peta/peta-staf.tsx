"use client";

import { useRouter } from "next/navigation";
import { CadanganPeta } from "./peta-publik";
import { PenyediaPeta } from "./penyedia-peta";
import { PetaLaporan, type TitikMinimal } from "./peta-laporan";

/** Peta semua laporan untuk staf; klik titik membuka detail laporan. */
export function PetaStaf({ titik, dasar }: { titik: TitikMinimal[]; dasar: string }) {
  const router = useRouter();
  return (
    <PenyediaPeta cadangan={<CadanganPeta jumlah={titik.length} className="h-96" />}>
      <PetaLaporan
        titik={titik}
        className="h-96 rounded-md border border-garis lg:h-[28rem]"
        onPilih={(id) => router.push(`${dasar}/laporan/${id}`)}
        label="Peta semua laporan"
      />
    </PenyediaPeta>
  );
}
