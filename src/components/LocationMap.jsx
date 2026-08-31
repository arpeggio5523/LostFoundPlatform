import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function getCoordinates(location) {
  const coordinates = location?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length !== 2) return null;

  const [longitude, latitude] = coordinates;
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;
  if (Math.abs(longitude) > 180 || Math.abs(latitude) > 90) return null;

  return [longitude, latitude];
}

export default function LocationMap({ location, itemType, title, fullScreen = false }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const coordinates = getCoordinates(location);

  useEffect(() => {
    if (!containerRef.current || !coordinates || !mapboxgl.accessToken) return undefined;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: coordinates,
      zoom: fullScreen ? 15 : 13,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const markerColor = itemType === "Lost" ? "#dc2626" : "#059669";
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<strong>${itemType || "Item"} location</strong><br>${location.formattedAddress || "Reported location"}`
    );

    new mapboxgl.Marker({ color: markerColor })
      .setLngLat(coordinates)
      .setPopup(popup)
      .addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [coordinates, fullScreen, itemType, location]);

  if (!coordinates) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-raised)] p-5 text-sm text-[var(--color-text-muted)]">
        No map location was provided for this post.
      </div>
    );
  }

  if (!mapboxgl.accessToken) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        Map unavailable: VITE_MAPBOX_TOKEN is not configured.
      </div>
    );
  }

  return <div ref={containerRef} className={fullScreen ? "h-[calc(100vh-145px)] min-h-[420px] w-full" : "h-72 w-full"} aria-label={`${itemType || "Item"} location map`} />;
}