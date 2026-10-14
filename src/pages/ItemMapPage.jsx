import { useLanguage } from "../context/LanguageContext";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import Sidebar from "../components/Sidebar";
import LocationMap from "../components/LocationMap";
import { apiFetch } from "../services/apiClient";

export default function ItemMapPage() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await apiFetch(`/api/items/${id}`);
        if (!response.ok) throw new Error("Item not found");
        const result = await response.json();
        setItem(result.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchItem();
  }, [id]);

  if (error) {
    return <div style={{ padding: 40, color: "#f87171" }}>{t(error)}</div>;
  }

  if (!item) {
    return <div style={{ padding: 40, color: "var(--color-text-muted)" }}>{t("Loading map...")}</div>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg-base)" }}>
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main style={{ marginLeft: isCollapsed ? 70 : 220, transition: "margin-left 0.3s ease", flex: 1, padding: "32px 40px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <button
            onClick={() => navigate(`/item/${item._id}`)}
            style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, color: "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
          >
            <ArrowLeft size={16} />{t(" Back to post")}</button>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, color: item.type === "Lost" ? "#dc2626" : "#059669" }}>
            <MapPin size={20} />
            <span style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase" }}>{t("{{type}} location", { type: t(item.type) })}</span>
          </div>
          <h1 style={{ margin: "0 0 20px", color: "var(--color-text-primary)", fontSize: 30, fontWeight: 800 }}>{item.title}</h1>

          <div style={{ overflow: "hidden", border: "1px solid var(--color-border)", borderRadius: 18, background: "var(--color-bg-surface)" }}>
            <LocationMap location={item.reportLocation} itemType={item.type} title={item.title} fullScreen />
          </div>
        </div>
      </main>
    </div>
  );
}
