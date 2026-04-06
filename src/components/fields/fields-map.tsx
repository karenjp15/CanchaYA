"use client";

import { useEffect, useState } from "react";
import {
  fieldAddress,
  fieldLatitude,
  fieldLongitude,
  type Field,
} from "@/lib/data/field-model";
import Link from "next/link";
import L from "leaflet";

const BOGOTA_CENTER: [number, number] = [4.65, -74.08];
const DEFAULT_ZOOM = 12;

const markerIcon = typeof window !== "undefined"
  ? new L.Icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    })
  : undefined;

function formatCOP(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function FieldsMap({ fields }: { fields: Field[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Leaflet solo en cliente; evita mismatch de hidratación
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-full min-h-[12rem] w-full items-center justify-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Cargando mapa...</p>
      </div>
    );
  }

  return <MapInner fields={fields} />;
}

function MapInner({ fields }: { fields: Field[] }) {
  /* Carga dinámica tras montar en cliente (evita SSR de react-leaflet) */
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const rl = require("react-leaflet") as typeof import("react-leaflet");
  const { MapContainer, TileLayer, Marker, Popup } = rl;

  const validFields = fields.filter((f) => {
    const lat = fieldLatitude(f);
    const lng = fieldLongitude(f);
    return lat != null && lng != null;
  });

  const center: [number, number] =
    validFields.length > 0
      ? [
          fieldLatitude(validFields[0])!,
          fieldLongitude(validFields[0])!,
        ]
      : BOGOTA_CENTER;

  return (
    <div className="h-full w-full min-h-0 overflow-hidden">
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        className="h-full w-full min-h-[12rem]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validFields.map((field) => (
          <Marker
            key={field.id}
            position={[
              fieldLatitude(field)!,
              fieldLongitude(field)!,
            ]}
            icon={markerIcon}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">{field.name}</p>
                <p className="text-muted-foreground">
                  {fieldAddress(field)}
                </p>
                <p className="font-medium" style={{ color: "#f97316" }}>
                  {formatCOP(Number(field.hourly_price))}/h
                </p>
                <Link
                  href={`/canchas/${field.id}`}
                  className="inline-block text-xs font-medium text-primary underline underline-offset-2"
                >
                  Ver detalle
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
