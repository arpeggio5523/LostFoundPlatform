import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
// import { createLostItemReport } from "../../services/reportService";

const categories = [
  "Electronics",
  "Accessories",
  "Bag & Backpacks",
  "Documents",
  "Keys",
  "Clothing",
  "Books",
  "Sport Equipment",
  "Jewelry",
  "Other",
];

const locations = [
  "Universiti Malaysia (UM)",
  "Universiti Kebangsaan Malaysia (UKM)",
  "Universiti Sains Malaysia (USM)",
  "Universiti Putra Malaysia (UPM)",
  "Universiti Teknologi Malaysia (UTM)",
  "Universiti Teknologi MARA (UiTM)",
  "Universiti Islam Antarabangsa Malaysia (UIAM)",
  "Universiti Utara Malaysia (UUM)",
  "Multimedia University (MMU)",
  "Taylor's University",
  "Sunway University",
  "INTI International University",
  "Other",
];

const INITIAL_FORM = {
  itemTitle: "",
  description: "",
  category: "",
  color: "",
  features: "",
  lastSeenLocation: "",
  dateLost: "",
};

export default function ReportLostItemPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Helpers ---
  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear error on change
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 3) {
      alert("Maximum 3 images allowed.");
      return;
    }
    const newFiles = [...selectedImages, ...files].slice(0, 3);
    const newUrls = newFiles.map((f, i) =>
      i < selectedImages.length ? previewUrls[i] : URL.createObjectURL(f)
    );
    setSelectedImages(newFiles);
    setPreviewUrls(newUrls);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- Validation ---
  const validate = () => {
    const newErrors = {};
    if (!formData.itemTitle.trim())
      newErrors.itemTitle = "Item title is required.";
    else if (formData.itemTitle.trim().length < 3)
      newErrors.itemTitle = "Minimum 3 characters.";

    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    else if (formData.description.trim().length < 10)
      newErrors.description = "Minimum 10 characters.";

    if (!formData.category) newErrors.category = "Category is required.";
    if (!formData.lastSeenLocation)
      newErrors.lastSeenLocation = "Last seen location is required.";
    if (!formData.dateLost) newErrors.dateLost = "Date lost is required.";

    return newErrors;
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // const payload = new FormData();
      // Object.entries(formData).forEach(([k, v]) => payload.append(k, v));
      // selectedImages.forEach((img) => payload.append("images", img));
      // await createLostItemReport(payload);

      setSubmitMessage("Lost item report submitted successfully.");
      setFormData(INITIAL_FORM);
      setSelectedImages([]);
      setErrors({});
    } catch (err) {
      console.error(err);
      setSubmitMessage("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Shared input style ---
  const inputClass = (field) =>
    `w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-slate-400 bg-white ${
      errors[field] ? "border-red-400" : "border-gray-300"
    }`;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
      <Sidebar />

      {/* Main content — offset by sidebar width */}
      <div style={{ marginLeft: 220, flex: 1, padding: "32px 40px" }}>
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
            color: "#374151",
            background: "none",
            border: "none",
            cursor: "pointer",
            marginBottom: 24,
            padding: 0,
            fontWeight: 500,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#111")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#374151")}
        >
          {/* Arrow left icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>

        {/* Card */}
        <div style={{
          maxWidth: 820,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          padding: "36px 40px",
        }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111", margin: 0 }}>
              Report Lost Item
            </h1>
            <p style={{ fontSize: 13.5, color: "#6b7280", marginTop: 6 }}>
              Provide detailed information to help others identify your item.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

              {/* Item Title */}
              <Field label="Item Title" required error={errors.itemTitle}>
                <input
                  type="text"
                  placeholder="e.g. Black Leather Wallet"
                  value={formData.itemTitle}
                  onChange={handleChange("itemTitle")}
                  className={inputClass("itemTitle")}
                  style={inputStyle(!!errors.itemTitle)}
                />
              </Field>

              {/* Description */}
              <Field label="Description" required error={errors.description}>
                <textarea
                  rows={4}
                  placeholder="Provide detailed description of the item..."
                  value={formData.description}
                  onChange={handleChange("description")}
                  style={{ ...inputStyle(!!errors.description), resize: "none" }}
                />
              </Field>

              {/* Category + Color */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <Field label="Category" required error={errors.category}>
                  <select
                    value={formData.category}
                    onChange={handleChange("category")}
                    style={inputStyle(!!errors.category)}
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Color">
                  <input
                    type="text"
                    placeholder="e.g. Black, Blue"
                    value={formData.color}
                    onChange={handleChange("color")}
                    style={inputStyle(false)}
                  />
                </Field>
              </div>

              {/* Distinctive Features */}
              <Field label="Distinctive Marks or Features">
                <textarea
                  rows={3}
                  placeholder="Any unique identifiers, scratches, initials, etc."
                  value={formData.features}
                  onChange={handleChange("features")}
                  style={{ ...inputStyle(false), resize: "none" }}
                />
              </Field>

              {/* Last Seen Location */}
              <Field label="Last Seen Location" required error={errors.lastSeenLocation}>
                <select
                  value={formData.lastSeenLocation}
                  onChange={handleChange("lastSeenLocation")}
                  style={inputStyle(!!errors.lastSeenLocation)}
                >
                  <option value="">Select location</option>
                  {locations.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </Field>

              {/* Date Lost */}
              <Field label="Date Lost" required error={errors.dateLost}>
                <input
                  type="date"
                  value={formData.dateLost}
                  onChange={handleChange("dateLost")}
                  style={inputStyle(!!errors.dateLost)}
                />
              </Field>

              {/* Image Upload */}
              <Field label="Images (Optional, max 3)">
                <label
                  style={{
                    border: "2px dashed #d1d5db",
                    borderRadius: 12,
                    padding: "32px 20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: selectedImages.length >= 3 ? "not-allowed" : "pointer",
                    transition: "border-color 0.15s",
                    opacity: selectedImages.length >= 3 ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => { if (selectedImages.length < 3) e.currentTarget.style.borderColor = "#64748b"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#d1d5db"; }}
                >
                  {/* Upload icon */}
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span style={{ fontSize: 13.5, color: "#2563eb", fontWeight: 500 }}>
                    Upload files
                  </span>
                  <span style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                    or drag and drop
                  </span>
                  <span style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>
                    PNG, JPG, JPEG up to 10MB
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/jpg"
                    style={{ display: "none" }}
                    disabled={selectedImages.length >= 3}
                    onChange={handleImageChange}
                  />
                </label>

                {/* Thumbnail previews */}
                {previewUrls.length > 0 && (
                  <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {previewUrls.map((url, i) => (
                      <div key={i} style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
                        <img
                          src={url}
                          alt={`preview-${i}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 8,
                            border: "1px solid #e5e7eb",
                            display: "block",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          style={{
                            position: "absolute",
                            top: -7,
                            right: -7,
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: "#ef4444",
                            border: "2px solid #fff",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            padding: 0,
                            lineHeight: 1,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                          }}
                        >
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Field>

              {/* Submit feedback */}
              {submitMessage && (
                <div style={{
                  borderRadius: 8,
                  background: submitMessage.includes("success") ? "#f0fdf4" : "#fef2f2",
                  border: `1px solid ${submitMessage.includes("success") ? "#bbf7d0" : "#fecaca"}`,
                  color: submitMessage.includes("success") ? "#166534" : "#991b1b",
                  padding: "10px 16px",
                  fontSize: 13.5,
                }}>
                  {submitMessage}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 4 }}>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  style={{
                    padding: "11px 22px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    background: "#fff",
                    color: "#374151",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "11px 26px",
                    borderRadius: 8,
                    border: "none",
                    background: isSubmitting ? "#6b7280" : "#0f172a",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.background = "#1e293b"; }}
                  onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.background = "#0f172a"; }}
                >
                  {isSubmitting ? "Submitting…" : "Submit Report"}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ── Tiny helper components & style utils ── */

function Field({ label, required, error, children }) {
  return (
    <div>
      <label style={{
        display: "block",
        fontSize: 13.5,
        fontWeight: 500,
        color: "#374151",
        marginBottom: 8,
      }}>
        {label}{required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {error && (
        <p style={{ fontSize: 12.5, color: "#ef4444", marginTop: 5 }}>{error}</p>
      )}
    </div>
  );
}

function inputStyle(hasError) {
  return {
    width: "100%",
    borderRadius: 8,
    border: `1px solid ${hasError ? "#f87171" : "#d1d5db"}`,
    padding: "11px 14px",
    fontSize: 13.5,
    color: "#111",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s",
    fontFamily: "inherit",
  };
}