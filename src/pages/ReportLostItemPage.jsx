import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authHeaders, buildApiUrl } from "../services/apiClient";
import { getAuthUser } from "../services/authState";
import { useToast } from "../context/ToastContext";

const CATEGORIES = [
    "All Categories",
    "Electronics",
    "Accessories",
    "Bag & Backpacks",
    "Documents",
    "Keys",
    "Clothing",
    "Books",
    "Sports Equipment",
    "Jewelry",
    "Other"];
    
const LOCATIONS = [
  "Universiti Malaya (UM)",
  "Universiti Kebangsaan Malaysia (UKM)",
  "Universiti Sains Malaysia (USM)",
  "Universiti Putra Malaysia (UPM) Central Library",
  "Universiti Teknologi Malaysia (UTM)",
  "Universiti Teknologi MARA (UiTM)",
  "Taylor's University",
  "Sunway University",
  "Multimedia University (MMU)",
];

function Field({ label, required, error, children }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputClass      = "w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-raised)] text-sm text-[var(--color-text-primary)] outline-none focus:border-gray-400 dark:focus:border-[var(--color-brand)] focus:bg-[var(--color-bg-surface)] transition-colors font-sans";
const inputErrorClass = "w-full px-3.5 py-2.5 rounded-lg border border-red-400 bg-[var(--color-bg-raised)]  text-sm text-[var(--color-text-primary)] outline-none focus:border-red-400 focus:bg-[var(--color-bg-surface)] transition-colors font-sans";

export default function ReportLostItemPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit"); // gets the ID if editing
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "", description: "", category: "",
    color: "", marks: "", location: "", exactLocation: "", date: "",
  });
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [images, setImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");


 // Pre-fill form if editing
  useEffect(() => {
    if (!editId) return;
    fetch(buildApiUrl(`/api/items/${editId}`))
      .then(res => res.json())
      .then(data => {
        const item = data.data;
        setForm({
          title: item.title || "",
          description: item.description || "",
          category: item.category || "",
          color: item.color || "",
          marks: item.distMark || "",
          location: item.location || "",
          exactLocation: item.exactLocation || "",
          date: item.date ? item.date.split("T")[0] : "",
        });
        if (item.user === "Anonymous") setIsAnonymous(true);
        else setIsAnonymous(false);
        // Load existing images as previews (Item model images are plain strings)
        if (item.images?.length > 0) {
          setImages(item.images.map(img => ({
            preview: img,
            name: "image",
            existing: true,
            url: img,
          })));
        }
      })
      .catch(err => console.error("Failed to load item:", err));
  }, [editId]);



  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    if (submitError) setSubmitError("");
  }

  function handleFiles(files) {
    const valid = Array.from(files).filter(f => f.type.startsWith("image/"));
    const toAdd = valid.slice(0, 1 - images.length).map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
      name: f.name,
    }));
    setImages(prev => [...prev, ...toAdd]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  function validate() {
    const e = {};
    if (!form.title.trim())       e.title       = "Item title is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    if (!form.category)           e.category    = "Please select a category.";
    if (!form.location)           e.location    = "Please select a location.";
    if (!form.date)               e.date        = "Please select a date.";
    return e;
  }

    async function handleSubmit() {
    setSubmitError("");
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    try {
      const authUser = getAuthUser();
      if (!authUser) {
        setSubmitError("Not authenticated. Please log in.");
        return;
      }

      const imageData = await Promise.all(
        images.map(img => {
          // If existing image from DB, just pass it as-is
          if (img.existing) {
            return Promise.resolve({
              url: img.url,
              filename: img.filename,
              mimetype: img.mimetype,
              size: img.size,
            });
          }
          // New image — convert to base64
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({
              url: reader.result,
              filename: img.file.name,
              mimetype: img.file.type,
              size: img.file.size,
            });
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsDataURL(img.file);
          });
        })
      );

      const url = editId
        ? buildApiUrl(`/api/items/${editId}`)
        : buildApiUrl("/api/items");

      const method = editId ? "PUT" : "POST";

      // Resolve images: existing images are plain URL strings in the unified model
      const imageUrls = imageData.map(img => img.url);

      const response = await fetch(url, {
        method,
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          color: form.color,
          distMark: form.marks,
          location: form.location,
          exactLocation: form.exactLocation,
          date: form.date,
          images: imageUrls,
          type: "Lost",
          user: isAnonymous ? "Anonymous" : (authUser.fullName || "Anonymous"),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));

        if (Array.isArray(error.missingFields)) {
          const serverErrors = {};
          for (const field of error.missingFields) {
            serverErrors[field === "dateLost" ? "date" : field] = "This field is required.";
          }
          setErrors(prev => ({ ...prev, ...serverErrors }));
        }

        throw new Error(error.error || error.message || "Failed to submit report");
      }

      showToast(editId ? "Item updated successfully!" : "Report submitted successfully!", "success");
      navigate("/lost-items");
    } catch (error) {
      setSubmitError(error.message || "Failed to submit report");
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] font-sans py-8 px-4 transition-colors duration-200">
      {/* Back */}
      <div className="max-w-2xl mx-auto mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 bg-transparent border-none text-sm text-[var(--color-text-secondary)] cursor-pointer p-0 font-medium hover:text-[var(--color-text-primary)] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back
        </button>
      </div>

      {/* Card */}
      <div className="max-w-2xl mx-auto bg-[var(--color-bg-surface)] rounded-2xl shadow-sm border border-[var(--color-border)] p-10 transition-colors duration-200">
        <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)] tracking-tight mb-1">
        {editId ? "Edit Lost Item" : "Report Lost Item"}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">
          {editId ? "Update the details below and save." : "Provide detailed information to help others identify your item."}
        </p>

        {submitError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        {/* Item Title */}
        <Field label="Item Title" required error={errors.title}>
          <input
            name="title" value={form.title} onChange={handleChange}
            placeholder="e.g., iPhone with Blue Case"
            className={errors.title ? inputErrorClass : inputClass}
          />
        </Field>

        {/* Description */}
        <Field label="Description" required error={errors.description}>
          <textarea
            name="description" value={form.description} onChange={handleChange}
            placeholder="Describe the item you lost..."
            rows={3}
            className={`${errors.description ? inputErrorClass : inputClass} resize-y`}
          />
          <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
            Note: For security, don't reveal all identifying details. You should be able to describe specific features to claim it later.
          </p>
        </Field>

        {/* Category + Color */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category" value={form.category} onChange={handleChange}
              className={`${errors.category ? inputErrorClass : inputClass} appearance-none cursor-pointer`}
            >
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">Color</label>
            <input
              name="color" value={form.color} onChange={handleChange}
              placeholder="e.g., Black, Blue"
              className={inputClass}
            />
          </div>
        </div>

        {/* Distinctive Marks */}
        <Field label="Distinctive Marks or Features">
          <textarea
            name="marks" value={form.marks} onChange={handleChange}
            placeholder="Any unique identifiers (optional - for verification purposes)"
            rows={2}
            className={`${inputClass} resize-y`}
          />
        </Field>

        {/* Location */}
        <Field label="Last Seen Location (University)" required error={errors.location}>
          <select
            name="location" value={form.location} onChange={handleChange}
            className={`${errors.location ? inputErrorClass : inputClass} appearance-none cursor-pointer`}
          >
            <option value="">Select location</option>
            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </Field>

        {/* Exact Location */}
        <Field label="Exact Place (e.g., Library 2nd floor, Cafe table)">
          <input
            name="exactLocation" value={form.exactLocation} onChange={handleChange}
            placeholder="Where exactly?"
            className={inputClass}
          />
        </Field>

        {/* Date */}
        <Field label="Date Lost" required error={errors.date}>
          <input
            type="date" name="date" value={form.date} onChange={handleChange}
            className={errors.date ? inputErrorClass : inputClass}
          />
        </Field>

        {/* Image Upload */}
        <div className="mb-3">
          <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
            Images <span className="text-[var(--color-text-muted)] font-normal">(Optional, max 1)</span>
          </label>

          {/* Dropzone */}
          <div
            onClick={() => images.length < 1 && fileInputRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-9 text-center transition-colors
              ${dragOver ? "border-[var(--color-brand)] bg-[var(--color-brand-active-bg)]" : "border-[var(--color-border)] bg-[var(--color-bg-raised)]"}
              ${images.length < 1 ? "cursor-pointer hover:border-gray-400" : "cursor-default opacity-60"}`}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2.5">
              <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
            </svg>
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">
              <span
                className="text-blue-500 font-semibold cursor-pointer hover:underline"
                onClick={e => { e.stopPropagation(); fileInputRef.current.click(); }}
              >
                Upload files
              </span>
              {" "}or drag and drop
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">PNG, JPG, GIF up to 10MB</p>
          </div>

          <input
            ref={fileInputRef} type="file" accept="image/*" multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />

          {/* Previews */}
          {images.length > 0 && (
            <div className="flex gap-2.5 mt-3 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative w-20 h-20">
                  <img src={img.preview} alt={img.name} className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                  <button
                    onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 border-none rounded-full w-5 h-5 flex items-center justify-center text-white text-xs font-bold cursor-pointer leading-none hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Anonymous Toggle */}
        <div className="flex items-center mb-5 mt-2">
          <input
            type="checkbox"
            id="anonToggleLost"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <label htmlFor="anonToggleLost" className="ml-2 text-sm font-semibold text-[var(--color-text-primary)] cursor-pointer select-none">
            Post Anonymously (Hide my name)
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-7">
          <button onClick={handleSubmit} className="flex-1 py-3 bg-[var(--color-text-primary)] text-[var(--color-bg-base)] border-none rounded-xl text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity">
          {editId ? "Save Changes" : "Submit Report"}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-xl text-sm font-semibold cursor-pointer hover:bg-[var(--color-bg-raised)] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
