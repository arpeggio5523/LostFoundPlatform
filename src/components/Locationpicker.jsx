import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Requires: npm install mapbox-gl
// Requires: VITE_MAPBOX_TOKEN set in your .env
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const DEFAULT_CENTER = [101.6869, 3.139]; // Kuala Lumpur fallback

export default function LocationPicker({
  initialLocation,
  onConfirm,
  onClose
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [coords, setCoords] = useState(
    initialLocation?.coordinates
      ? {
          lng: initialLocation.coordinates[0],
          lat: initialLocation.coordinates[1]
        }
      : null
  );
  const [address, setAddress] = useState(
    initialLocation?.formattedAddress || ""
  );
  const [geocoding, setGeocoding] = useState(false);
  const [tokenMissing, setTokenMissing] = useState(!mapboxgl.accessToken);

  useEffect(() => {
    if (tokenMissing || !mapContainer.current) return;

    const center = coords ? [coords.lng, coords.lat] : DEFAULT_CENTER;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom: coords ? 15 : 11
    });
    mapRef.current = map;

    if (coords) {
      markerRef.current = new mapboxgl.Marker({
        draggable: true,
        color: "#ef4444"
      })
        .setLngLat([coords.lng, coords.lat])
        .addTo(map);
      markerRef.current.on("dragend", handleMarkerMove);
    }

    map.on("click", (e) => dropPin(e.lngLat.lng, e.lngLat.lat));

    return () => map.remove();
  }, [tokenMissing]);

  function dropPin(lng, lat) {
    setCoords({ lng, lat });
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    } else {
      markerRef.current = new mapboxgl.Marker({
        draggable: true,
        color: "#ef4444"
      })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);
      markerRef.current.on("dragend", handleMarkerMove);
    }
    reverseGeocode(lng, lat);
  }

  function handleMarkerMove() {
    const { lng, lat } = markerRef.current.getLngLat();
    setCoords({ lng, lat });
    reverseGeocode(lng, lat);
  }

  async function reverseGeocode(lng, lat) {
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await res.json();
      setAddress(data.features?.[0]?.place_name || "");
    } catch {
      setAddress("");
    } finally {
      setGeocoding(false);
    }
  }

  function handleConfirm() {
    if (!coords) return;
    onConfirm({
      type: "Point",
      coordinates: [coords.lng, coords.lat],
      formattedAddress: address
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg bg-[var(--color-bg-surface)] rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-[var(--color-border)]">
          <h2 className="text-base font-bold text-[var(--color-text-primary)]">
            Tag Location
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Click the map to drop a pin, or drag the pin to adjust.
          </p>
        </div>

        {tokenMissing ? (
          <div className="p-8 text-center text-sm text-red-500">
            Missing VITE_MAPBOX_TOKEN — map cannot load.
          </div>
        ) : (
          <div ref={mapContainer} className="w-full h-80" />
        )}

        <div className="p-5">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">
            Selected address
          </p>
          <p className="text-sm text-[var(--color-text-primary)] min-h-[1.25rem]">
            {geocoding
              ? "Looking up address…"
              : address ||
                (coords
                  ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
                  : "No pin dropped yet")}
          </p>
        </div>

        <div className="flex gap-3 p-5 pt-0">
          <button
            onClick={handleConfirm}
            disabled={!coords}
            className="flex-1 py-2.5 bg-[var(--color-brand)] text-[var(--color-brand-text)] border-none rounded-lg text-sm font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm Location
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[var(--color-bg-raised)] text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-lg text-sm font-semibold cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
