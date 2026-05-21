import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["Electronics", "Accessories", "Documents", "Clothing", "Others"];
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
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputClass = "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-gray-400 focus:bg-white transition-colors font-sans";
const inputErrorClass = "w-full px-3.5 py-2.5 rounded-lg border border-red-400 bg-gray-50 text-sm text-gray-800 outline-none focus:border-red-400 focus:bg-white transition-colors font-sans";

export default function ReportFoundItemPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "", description: "", category: "",
    color: "", marks: "", location: "", date: "",
  });
  const [images, setImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  }

  function handleFiles(files) {
    const valid = Array.from(files).filter(f => f.type.startsWith("image/"));
    const toAdd = valid.slice(0, 3 - images.length).map(f => ({
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

  function handleSubmit() {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    console.log("Submitting:", form, images);
    // TODO: POST to /api/found-items
    alert("Report submitted successfully!");
    navigate("/found-items");
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans py-8 px-4">
      {/* Back */}
      <div className="max-w-2xl mx-auto mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 bg-transparent border-none text-sm text-gray-500 cursor-pointer p-0 font-medium hover:text-gray-800 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back
        </button>
      </div>

      {/* Card */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-10">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1">Report Found Item</h1>
        <p className="text-sm text-gray-400 mb-8">Help someone reunite with their belongings.</p>

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
            placeholder="Describe the item you found..."
            rows={3}
            className={`${errors.description ? inputErrorClass : inputClass} resize-y`}
          />
          <p className="mt-1.5 text-xs text-gray-400">
            Note: For security, don't reveal all identifying details. The owner should be able to describe specific features to claim it.
          </p>
        </Field>

        {/* Category + Color */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
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
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Color</label>
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
        <Field label="Location Found" required error={errors.location}>
          <select
            name="location" value={form.location} onChange={handleChange}
            className={`${errors.location ? inputErrorClass : inputClass} appearance-none cursor-pointer`}
          >
            <option value="">Select location</option>
            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </Field>

        {/* Date */}
        <Field label="Date Found" required error={errors.date}>
          <input
            type="date" name="date" value={form.date} onChange={handleChange}
            className={errors.date ? inputErrorClass : inputClass}
          />
        </Field>

        {/* Image Upload */}
        <div className="mb-3">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Images <span className="text-gray-400 font-normal">(Recommended, max 3)</span>
          </label>

          {/* Dropzone */}
          <div
            onClick={() => images.length < 3 && fileInputRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-9 text-center transition-colors
              ${dragOver ? "border-indigo-400 bg-indigo-50" : "border-gray-200 bg-gray-50"}
              ${images.length < 3 ? "cursor-pointer hover:border-gray-400" : "cursor-default opacity-60"}`}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2.5">
              <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
            </svg>
            <p className="text-sm text-gray-600 mb-1">
              <span
                className="text-blue-500 font-semibold cursor-pointer hover:underline"
                onClick={e => { e.stopPropagation(); fileInputRef.current.click(); }}
              >
                Upload files
              </span>
              {" "}or drag and drop
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
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

        <p className="text-xs text-gray-400 mb-7">
          Photos help owners identify their items faster. A QR code will be automatically generated for this item.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-gray-900 text-white border-none rounded-xl text-sm font-bold cursor-pointer hover:bg-gray-800 transition-colors"
          >
            Submit Report
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-white text-gray-600 border border-gray-200 rounded-xl text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}