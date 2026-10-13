"use client";

import { Crosshair, MapPin } from "@phosphor-icons/react";
import { Map, type MapCameraChangedEvent, useMap } from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useRef, useState } from "react";
import { Tombol } from "@/components/ui/tombol";
import { KUNCI_GMAPS, MAP_ID, PenyediaPeta, PUSAT_MEDAN } from "./penyedia-peta";

/**
 * Pilih lokasi seperti aplikasi ojek online: peta digeser, pin tetap di
 * tengah. Nilai dikirim setelah peta berhenti bergerak. Bila kunci Google Maps
 * belum diatur, titik diambil dari pusat kecamatan yang dipilih (cadangan).
 */
export type Titik = { lat: number; lng: number };

function KendaliPeta({ tuju }: { tuju: Titik | null }) {
  const map = useMap();
  useEffect(() => {
    if (map && tuju) {
      map.panTo(tuju);
      if ((map.getZoom() ?? 0) < 16) map.setZoom(17);
    }
  }, [map, tuju]);
  return null;
}

export function PemilihLokasi({ nilai, ubah }: { nilai: Titik | null; ubah: (t: Titik) => void }) {
  const [tuju, setTuju] = useState<Titik | null>(null);
  const [galatGps, setGalatGps] = useState<string | null>(null);
  const [mencari, setMencari] = useState(false);
  const pusat = useRef<Titik>(nilai ?? PUSAT_MEDAN);

  const onKamera = useCallback((e: MapCameraChangedEvent) => {
    pusat.current = e.detail.center;
  }, []);

  function lokasiSaya() {
    setGalatGps(null);
    if (!navigator.geolocation) {
      setGalatGps("Browser ini tidak mendukung lokasi. Geser peta ke lokasi masalah.");
      return;
    }
    setMencari(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setMencari(false);
        const t = { lat: p.coords.latitude, lng: p.coords.longitude };
        setTuju(t);
        ubah(t);
      },
      () => {
        setMencari(false);
        setGalatGps("Lokasi Anda tidak dapat dibaca. Izinkan akses lokasi, atau geser peta ke lokasi masalah.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  if (!KUNCI_GMAPS) return null;

  return (
    <div className="flex flex-col gap-2">
      <PenyediaPeta cadangan={null}>
        <div className="relative h-80 overflow-hidden rounded-md border-2 border-garis-tegas md:h-96">
          <Map
            mapId={MAP_ID}
            defaultCenter={nilai ?? PUSAT_MEDAN}
            defaultZoom={nilai ? 17 : 13}
            gestureHandling="greedy"
            disableDefaultUI
            zoomControl
            clickableIcons={false}
            onCameraChanged={onKamera}
            onIdle={() => ubah(pusat.current)}
            className="size-full"
          >
            <KendaliPeta tuju={tuju} />
          </Map>
          {/* Pin tetap di tengah; ujung bawah pin = titik yang dipilih */}
          <MapPin
            aria-hidden
            weight="fill"
            className="pointer-events-none absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-full text-merah"
          />
        </div>
      </PenyediaPeta>
      <div className="flex flex-wrap items-center gap-3">
        <Tombol varian="kedua" onClick={lokasiSaya} memuat={mencari} teksMemuat="Mencari lokasi…" ikon={<Crosshair aria-hidden className="size-5" />}>
          Gunakan lokasi saya
        </Tombol>
        {nilai && (
          <span className="font-kode text-kecil text-aspal-2">
            {nilai.lat.toFixed(5)}, {nilai.lng.toFixed(5)}
          </span>
        )}
      </div>
      {galatGps && <p className="text-kecil font-semibold text-merah">{galatGps}</p>}
    </div>
  );
}
