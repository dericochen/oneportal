import { Phone } from "@phosphor-icons/react/ssr";
import { Logo } from "@/components/ui/logo";
import { ambilPengaturan } from "@/lib/pengaturan";

/** Footer ringkas semua halaman: kontak, nomor darurat, disclaimer prototipe. */
export async function FooterSitus() {
  const p = await ambilPengaturan();
  return (
    <footer className="border-t border-garis bg-abu">
      <div className="mx-auto flex w-full max-w-daftar flex-col gap-4 px-4 py-8 md:flex-row md:items-start md:justify-between md:px-6">
        <div className="flex flex-col gap-2">
          <Logo ukuran="kecil" />
          <p className="max-w-baca text-kecil text-aspal-2">{p["footer.disclaimer"]}</p>
        </div>
        <div className="flex flex-col gap-1 text-kecil md:items-end">
          <a href={`tel:${p["darurat.nomor"]}`} className="inline-flex min-h-11 items-center gap-2 font-bold">
            <Phone aria-hidden weight="fill" className="size-5 text-merah" />
            Darurat: {p["darurat.nomor"]}
          </a>
          {p["kontak.telepon"] && (
            <a href={`tel:${p["kontak.telepon"].replace(/[^0-9+]/g, "")}`} className="tautan">
              {p["kontak.telepon"]}
            </a>
          )}
          {p["kontak.email"] && (
            <a href={`mailto:${p["kontak.email"]}`} className="tautan">
              {p["kontak.email"]}
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
