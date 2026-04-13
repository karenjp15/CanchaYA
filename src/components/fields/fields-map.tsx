"use client";

import { useEffect, useState } from "react";
import {
  fieldAddress,
  fieldLatitude,
  fieldLongitude,
  fieldVenueName,
  type Field,
} from "@/lib/data/field-model";
import type { FieldWithAvailability } from "@/lib/data/field-availability";
import {
  formatPadelPricingHint,
  padelSlotTotalRange,
} from "@/lib/field-pricing";
import { totalPriceFromHourlyAndMinutes } from "@/lib/pricing";
import type { SportType } from "@/types/database.types";
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

type MapField = Field | FieldWithAvailability;

export function FieldsMap({
  fields,
  sport,
}: {
  fields: MapField[];
  sport: SportType;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
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

  return <MapInner fields={fields} sport={sport} />;
}

function MapInner({ fields, sport }: { fields: MapField[]; sport: SportType }) {
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
        {validFields.map((field) => {
          const venue = fieldVenueName(field);
          const padelRange =
            field.sport === "PADEL" && (field.pricing_windows?.length ?? 0) > 0
              ? padelSlotTotalRange(
                  field.pricing_windows ?? [],
                  field.slot_duration_minutes,
                )
              : null;
          const padelHint =
            field.sport === "PADEL" && (field.pricing_windows?.length ?? 0) > 0
              ? formatPadelPricingHint(
                  field.pricing_windows ?? [],
                  formatCOP,
                )
              : null;
          const total = padelRange
            ? padelRange.valleyTotal
            : totalPriceFromHourlyAndMinutes(
                Number(field.hourly_price),
                field.slot_duration_minutes,
              );
          return (
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
                <p className="font-semibold">
                  {venue || field.name}
                </p>
                {venue ? (
                  <p className="text-xs text-muted-foreground">{field.name}</p>
                ) : null}
                <p className="text-muted-foreground">
                  {fieldAddress(field)}
                </p>
                <p className="font-medium" style={{ color: "#f97316" }}>
                  {padelRange && padelHint ? (
                    <>
                      {formatCOP(padelRange.valleyTotal)} –{" "}
                      {formatCOP(padelRange.peakTotal)} ·{" "}
                      {field.slot_duration_minutes} min
                    </>
                  ) : (
                    <>
                      {formatCOP(total)} · {field.slot_duration_minutes} min
                    </>
                  )}
                </p>
                {padelHint ? (
                  <p className="text-[11px] text-muted-foreground">{padelHint}</p>
                ) : null}
                <Link
                  href={`/canchas/${field.id}?sport=${sport}`}
                  className="inline-block text-xs font-medium text-primary underline underline-offset-2"
                >
                  Ver detalle
                </Link>
              </div>
            </Popup>
          </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
