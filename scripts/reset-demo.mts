/**
 * Reset data demo: menghapus laporan, riwayat, notifikasi, dan audit log
 * transaksi; mengosongkan foto di bucket "laporan"; lalu menjalankan seed
 * master ulang. Data master dan akun tetap ada.
 *
 *   npm run db:reset-demo -- --ya
 *
 * Tidak dapat dibatalkan. Tanpa --ya, skrip hanya menampilkan apa yang akan dihapus.
 */
import { buatSqlMaster, buatSqlPeranDemo } from "./lib/master.mts";
import { klienAdmin, klienDb } from "./lib/env.mts";

const yakin = process.argv.includes("--ya");
const db = await klienDb();

try {
  const { rows } = await db.query<Record<string, number>>(`select
    (select count(*)::int from public.reports) laporan,
    (select count(*)::int from public.report_events) riwayat,
    (select count(*)::int from public.notifications) notifikasi`);
  console.log("Akan dihapus:", rows[0]);
  if (!yakin) {
    console.log("\nTidak ada yang dihapus. Jalankan ulang dengan --ya untuk melanjutkan.");
    process.exit(0);
  }

  await db.query("begin");
  await db.query(`select set_config('oneportal.reset', 'on', true), set_config('oneportal.transition', 'on', true)`);
  await db.query(`truncate public.notifications, public.report_supports, public.report_media, public.completion_proofs,
    public.report_events, public.reports, public.area_cases, public.report_code_counters restart identity cascade`);
  await db.query(`delete from public.audit_logs where table_name not in ('profiles')`);
  await db.query(buatSqlMaster());
  await db.query(buatSqlPeranDemo());
  await db.query("commit");

  // Kosongkan foto laporan di Storage (per folder pengguna).
  const supabase = klienAdmin();
  let terhapus = 0;
  const { data: folder } = await supabase.storage.from("laporan").list("", { limit: 1000 });
  for (const f of folder ?? []) {
    const { data: isi } = await supabase.storage.from("laporan").list(f.name, { limit: 1000 });
    const path = (isi ?? []).map((o) => `${f.name}/${o.name}`);
    if (path.length) {
      await supabase.storage.from("laporan").remove(path);
      terhapus += path.length;
    }
  }
  console.log(`Data demo direset. ${terhapus} berkas foto dihapus dari Storage.`);
} catch (e) {
  await db.query("rollback").catch(() => {});
  console.error("Reset gagal:", (e as Error).message);
  process.exitCode = 1;
} finally {
  await db.end();
}
