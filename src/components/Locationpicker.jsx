import { useLanguage } from "../context/LanguageContext";
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
  const { t } = useLanguage();
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

  // Place search
  const sessionToken = useRef(crypto.randomUUID());
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);

  // Debounced forward geocoding (Malaysia only, biased toward the current map view)
  useEffect(() => {
    const q = query.trim();
    if (tokenMissing || q.length < 2) {
      setResults([]);
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const c = mapRef.current?.getCenter();
        const prox = c ? `&proximity=${c.lng},${c.lat}` : "";
        const res = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(q)}&country=my&language=en&limit=8&types=poi,address,street,neighborhood,locality,place${prox}&session_token=${sessionToken.current}&access_token=${mapboxgl.accessToken}`
        );
        const data = await res.json();
        if (!cancelled) setResults(data.suggestions || []);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, tokenMissing]);

  async function pickResult(suggestion) {
    setQuery("");
    setResults([]);
    setShowResults(false);
    try {
      const res = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(suggestion.mapbox_id)}?session_token=${sessionToken.current}&access_token=${mapboxgl.accessToken}`
      );
      const data = await res.json();
      const f = data.features?.[0];
      if (!f) return;
      const [lng, lat] = f.geometry.coordinates;
      const label = [f.properties.name, f.properties.place_formatted].filter(Boolean).join(", ");
      dropPin(lng, lat, f.properties.full_address || label);
      mapRef.current?.flyTo({ center: [lng, lat], zoom: 17 });
    } catch {
      /* ignore: user can search again or click the map */
    } finally {
      // a retrieve ends the billing session; start a fresh one for the next search
      sessionToken.current = crypto.randomUUID();
    }
  }

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

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false
    });
    map.addControl(geolocate, "top-right");
    geolocate.on("geolocate", (e) => dropPin(e.coords.longitude, e.coords.latitude));

    map.on("click", (e) => dropPin(e.lngLat.lng, e.lngLat.lat));

    return () => map.remove();
  }, [tokenMissing]);

  // knownAddress: when the pin comes from a search result we already have the name,
  // so skip the reverse-geocode lookup.
  function dropPin(lng, lat, knownAddress) {
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
    if (knownAddress) {
      setAddress(knownAddress);
    } else {
      reverseGeocode(lng, lat);
    }
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
          <h2 className="text-base font-bold text-[var(--color-text-primary)]">{t("Tag Location")}</h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">{t("Search for a place, or click the map to drop a pin. Drag the pin to adjust.")}</p>

          {!tokenMissing && (
            <div className="relative mt-3">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 150)}
                placeholder={t("Search a place, building or address...")}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-raised)] text-sm text-[var(--color-text-primary)] outline-none focus:border-gray-400 dark:focus:border-[var(--color-brand)] transition-colors"
              />

              {showResults && query.trim().length >= 2 && (
                <ul className="absolute left-0 right-0 top-full mt-1 z-20 max-h-60 overflow-y-auto list-none m-0 p-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-lg">
                  {results.length === 0 ? (
                    <li className="px-3 py-2 text-xs text-[var(--color-text-muted)]">
                      {searching ? t("Searching…") : t("No places found")}
                    </li>
                  ) : (
                    results.map((f) => (
                      <li
                        key={f.mapbox_id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          pickResult(f);
                        }}
                        className="px-3 py-2 rounded-md cursor-pointer hover:bg-[var(--color-bg-raised)]"
                      >
                        <div className="text-sm font-semibold text-[var(--color-text-primary)]">{f.name}</div>
                        <div className="text-xs text-[var(--color-text-muted)] truncate">{f.full_address || f.place_formatted}</div>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          )}
        </div>

        {tokenMissing ? (
          <div className="p-8 text-center text-sm text-red-500">{t("Missing VITE_MAPBOX_TOKEN — map cannot load.")}</div>
        ) : (
          <div ref={mapContainer} className="w-full h-80" />
        )}

        <div className="p-5">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">{t("Selected address")}</p>
          <p className="text-sm text-[var(--color-text-primary)] min-h-[1.25rem]">
            {geocoding
              ? t("Looking up address…")
              : address ||
                (coords
                  ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
                  : t("No pin dropped yet"))}
          </p>
        </div>

        <div className="flex gap-3 p-5 pt-0">
          <button
            onClick={handleConfirm}
            disabled={!coords}
            className="flex-1 py-2.5 bg-[var(--color-brand)] text-[var(--color-brand-text)] border-none rounded-lg text-sm font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >{t("Confirm Location")}</button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[var(--color-bg-raised)] text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-lg text-sm font-semibold cursor-pointer"
          >{t("Cancel")}</button>
        </div>
      </div>
    </div>
  );
}