"use client";

import { MarkerClusterer, type Renderer } from "@googlemaps/markerclusterer";
import { AdvancedMarker, Map, type MapCameraChangedEvent, useMap } from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IKON_KATEGORI } from "@/components/ui/pelat-kategori";
import { cx } from "@/lib/cx";
import { KELOMPOK_STATUS, type KelompokStatus, type StatusLaporan } from "@/lib/domain/laporan";
import type { SlugKategori } from "@/lib/domain/kategori";
import { MAP_ID, PUSAT_MEDAN } from "./penyedia-peta";

/**
 * Titik laporan di Google Maps. Warna titik = kelompok status (DESIGN.md),
 * pelat kategori di dalam titik (tidak mengandalkan warna saja). Momen khas 4:
 * laporan Selesai pada zoom ≥15 berubah menjadi thumbnail foto "sesudah"
 * berbingkai hijau. Titik berdekatan dikelompokkan (cluster) dengan jumlahnya.
 */
export type TitikMinimal = {
  id: string;
  kode: string;
  judul: string;
  status: StatusLaporan;
  kategoriSlug: string;
  lat: number;
  lng: number;
  thumbSesudah?: string | null;
};

const WARNA_KELOMPOK: Record<KelompokStatus, string> = {
  menunggu: "bg-aspal-2",
  dikerjakan: "bg-biru",
  selesai: "bg-hijau",
  ditolak: "bg-merah",
  dialihkan: "bg-aspal-2",
};

/** Renderer cluster: kotak aspal berisi jumlah (tanpa warna bawaan Google). */
const rendererCluster: Renderer = {
  render: ({ count, position }) => {
    const el = document.createElement("div");
    el.className =
      "flex min-w-9 items-center justify-center rounded-sm border-2 border-putih bg-aspal px-2 py-1 text-kecil-staf font-bold text-putih shadow-lapis";
    el.textContent = new Intl.NumberFormat("id-ID").format(count);
    el.setAttribute("aria-label", `${count} laporan`);
    return new google.maps.marker.AdvancedMarkerElement({ position, content: el, zIndex: 1000 + count });
  },
};

function TitikLaporan({
  t,
  zoom,
  tampilkanBukti,
  terpilih,
  onPilih,
  daftarkan,
}: {
  t: TitikMinimal;
  zoom: number;
  tampilkanBukti: boolean;
  terpilih: boolean;
  onPilih?: (id: string) => void;
  daftarkan: (id: string, m: google.maps.marker.AdvancedMarkerElement | null) => void;
}) {
  const Ikon = IKON_KATEGORI[t.kategoriSlug as SlugKategori] ?? IKON_KATEGORI.lainnya;
  const kelompok = KELOMPOK_STATUS[t.status];
  const bukti = tampilkanBukti && t.status === "RESOLVED" && t.thumbSesudah && zoom >= 15;
  const ref = useCallback((m: google.maps.marker.AdvancedMarkerElement | null) => daftarkan(t.id, m), [daftarkan, t.id]);

  return (
    <AdvancedMarker
      ref={ref}
      position={{ lat: t.lat, lng: t.lng }}
      title={`${t.kode}: ${t.judul}`}
      onClick={() => onPilih?.(t.id)}
      zIndex={terpilih ? 999 : undefined}
    >
      {bukti ? (
        // eslint-disable-next-line @next/next/no-img-element -- signed URL kedaluwarsa, tidak perlu optimasi
        <img
          src={t.thumbSesudah!}
          alt={`Foto sesudah perbaikan ${t.kode}`}
          width={56}
          height={42}
          loading="lazy"
          className={cx("block h-[42px] w-14 rounded-sm border-2 border-hijau bg-abu object-cover", terpilih && "ring-4 ring-kuning")}
        />
      ) : (
        <span
          className={cx(
            "flex size-7 items-center justify-center rounded-full border-2 border-putih text-putih",
            WARNA_KELOMPOK[kelompok],
            terpilih && "ring-4 ring-kuning",
          )}
        >
          <Ikon aria-hidden weight="fill" className="size-4" />
        </span>
      )}
    </AdvancedMarker>
  );
}

/** Mengelompokkan marker yang terdaftar ke MarkerClusterer. */
function useCluster(aktif: boolean) {
  const map = useMap();
  const [marker, setMarker] = useState<Record<string, google.maps.marker.AdvancedMarkerElement>>({});
  const clusterer = useRef<MarkerClusterer | null>(null);

  useEffect(() => {
    if (!map || !aktif) return;
    clusterer.current = new MarkerClusterer({ map, renderer: rendererCluster });
    return () => {
      clusterer.current?.clearMarkers();
      clusterer.current?.setMap(null);
      clusterer.current = null;
    };
  }, [map, aktif]);

  useEffect(() => {
    if (!clusterer.current) return;
    clusterer.current.clearMarkers();
    clusterer.current.addMarkers(Object.values(marker));
  }, [marker]);

  const daftarkan = useCallback((id: string, m: google.maps.marker.AdvancedMarkerElement | null) => {
    setMarker((lama) => {
      if ((m && lama[id] === m) || (!m && !lama[id])) return lama;
      const baru = { ...lama };
      if (m) baru[id] = m;
      else delete baru[id];
      return baru;
    });
  }, []);
  return daftarkan;
}

function LapisTitik({
  titik,
  zoom,
  tampilkanBukti,
  terpilih,
  onPilih,
  cluster,
}: {
  titik: TitikMinimal[];
  zoom: number;
  tampilkanBukti: boolean;
  terpilih?: string | null;
  onPilih?: (id: string) => void;
  cluster: boolean;
}) {
  // Saat bukti foto tampil (zoom tinggi), cluster dimatikan agar thumbnail terlihat.
  const pakaiCluster = cluster && zoom < 15;
  const daftarkan = useCluster(pakaiCluster);
  const tanpaDaftar = useCallback(() => {}, []);
  return (
    <>
      {titik.map((t) => (
        <TitikLaporan
          key={`${t.id}-${pakaiCluster ? "c" : "b"}`}
          t={t}
          zoom={zoom}
          tampilkanBukti={tampilkanBukti}
          terpilih={terpilih === t.id}
          onPilih={onPilih}
          daftarkan={pakaiCluster ? daftarkan : tanpaDaftar}
        />
      ))}
    </>
  );
}

/** Arahkan peta ke titik terpilih. */
function IkutiTerpilih({ titik, terpilih }: { titik: TitikMinimal[]; terpilih?: string | null }) {
  const map = useMap();
  useEffect(() => {
    const t = titik.find((x) => x.id === terpilih);
    if (map && t) map.panTo({ lat: t.lat, lng: t.lng });
  }, [map, titik, terpilih]);
  return null;
}

export function PetaLaporan({
  titik,
  className,
  zoomAwal = 12,
  pusat = PUSAT_MEDAN,
  tampilkanBukti = true,
  terpilih,
  onPilih,
  cluster = true,
  label = "Peta laporan Kota Medan",
  interaktif = true,
}: {
  titik: TitikMinimal[];
  className?: string;
  zoomAwal?: number;
  pusat?: google.maps.LatLngLiteral;
  tampilkanBukti?: boolean;
  terpilih?: string | null;
  onPilih?: (id: string) => void;
  cluster?: boolean;
  label?: string;
  interaktif?: boolean;
}) {
  const [zoom, setZoom] = useState(zoomAwal);
  const onKamera = useCallback((e: MapCameraChangedEvent) => setZoom(e.detail.zoom), []);
  const opsi = useMemo(
    () => ({
      mapId: MAP_ID,
      defaultCenter: pusat,
      defaultZoom: zoomAwal,
      gestureHandling: interaktif ? "greedy" : "cooperative",
      disableDefaultUI: true,
      zoomControl: true,
      clickableIcons: false,
      minZoom: 10,
    }),
    [pusat, zoomAwal, interaktif],
  );

  return (
    <div role="region" aria-label={label} className={cx("relative overflow-hidden bg-abu", className)}>
      <Map {...opsi} onCameraChanged={onKamera} className="size-full">
        <LapisTitik titik={titik} zoom={zoom} tampilkanBukti={tampilkanBukti} terpilih={terpilih} onPilih={onPilih} cluster={cluster} />
        <IkutiTerpilih titik={titik} terpilih={terpilih} />
      </Map>
    </div>
  );
}
