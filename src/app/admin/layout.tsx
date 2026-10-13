import { KerangkaStaf } from "@/components/tata-letak/kerangka-staf";
import { MENU_ADMIN } from "@/components/tata-letak/navigasi";
import { wajibPeran } from "@/lib/auth";

/** Area admin. Lapis 2: hanya peran ADMIN; lainnya 403. */
export default async function LayoutAdmin({ children }: LayoutProps<"/admin">) {
  const sesi = await wajibPeran(["ADMIN"], "/admin");
  return (
    <KerangkaStaf sesi={sesi} menu={MENU_ADMIN} beranda="/admin">
      {children}
    </KerangkaStaf>
  );
}
