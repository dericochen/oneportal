"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import type { ReactNode } from "react";

/**
 * Google Maps JavaScript API. Kunci bersifat publik (dipakai di browser), jadi
 * WAJIB dibatasi HTTP referrer di Google Cloud Console ke domain situs ini.
 * Map ID dibutuhkan untuk Advanced Marker; DEMO_MAP_ID cukup untuk prototipe.
 */
export const KUNCI_GMAPS = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
export const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";
export const PUSAT_MEDAN = { lat: 3.595, lng: 98.672 };
export const BATAS_MEDAN = { north: 3.81, south: 3.47, west: 98.55, east: 98.8 };

export function PenyediaPeta({ children, cadangan }: { children: ReactNode; cadangan: ReactNode }) {
  if (!KUNCI_GMAPS) return <>{cadangan}</>;
  return (
    <APIProvider apiKey={KUNCI_GMAPS} language="id" region="ID" libraries={["marker"]}>
      {children}
    </APIProvider>
  );
}
