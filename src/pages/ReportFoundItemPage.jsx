import { useLanguage } from "../context/LanguageContext";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authHeaders, buildApiUrl, apiFetch } from "../services/apiClient";
import { getAuthUser, isAdmin } from "../services/authState";
import { useToast } from "../context/ToastContext";
import LocationTagField from "../components/Locationtagfield";
import NotificationButton from "../components/NotificationButton";
import { useLanguage } from "../context/LanguageContext";

const CATEGORIES = [
  "Electronics",
  "Accessories",
  "Bag & Backpacks",
  "Documents",
  "Keys",
  "Clothing",
  "Books",
  "Sports Equipment",
  "Jewelry",
  "Other"
];

const LOCATIONS = [
  "Universiti Malaya (UM)",
  "Universiti Kebangsaan Malaysia (UKM)",
  "Universiti Sains Malaysia (USM)",
  "Universiti Putra Malaysia (UPM) Central Library",
  "Universiti Teknologi Malaysia (UTM)",
  "Universiti Teknologi MARA (UiTM)",
  "Taylor's University",
  "Sunway University",
  "Multimedia University (MMU)"
];

function Field({ label, required, error, children }) {
  const { t } = useLanguage();
  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{t(error)}</p>}
    </div>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-raised)] text-sm text-[var(--color-text-primary)] outline-none focus:border-gray-400 dark:focus:border-[var(--color-brand)] focus:bg-[var(--color-bg-surface)] transition-colors font-sans";
const inputErrorClass =
  "w-full px-3.5 py-2.5 rounded-lg border border-red-400 bg-[var(--color-bg-raised)]  text-sm text-[var(--color-text-primary)] outline-none focus:border-red-400 focus:bg-[var(--color-bg-surface)] transition-colors font-sans";

export default function ReportFoundItemPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit"); // gets the ID if editing
  const requestedReturnTo = searchParams.get("returnTo");
  const returnTo = ["/admin-dashboard", "/lost-items", "/found-items"].includes(requestedReturnTo)
    ? requestedReturnTo
    : "/found-items";
  const fileInputRef = useRef(null);
  const formContainerRef = useRef(null);
  const submitLock = useRef(false);

  const [form, setForm] = useState({
    title: "", description: "", category: "",
    color: "", marks: "", location: "", exactLocation: "", date: "", status: "",
  });
  const [reportLocation, setReportLocation] = useState(null); // { type, coordinates: [lng, lat], formattedAddress }
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [images, setImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form if editing
  useEffect(() => {
    if (!editId) return;
    apiFetch(`/api/items/${editId}`)
      .then((res) => { if (!res.ok) throw new Error("Unable to load this item. Please try again."); return res.json(); })
      .then((data) => {
        const item = data.data;
        if (!isAdmin() && item.status !== "Pending") {
          showToast("You can only edit posts while they are pending approval.", "error");
          navigate(`/item/${editId}?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
          return;
        }
        setForm({
          title: item.title || "",
          description: item.description || "",
          category: item.category || "",
          color: item.color || "",
          marks: item.distMark || "",
          location: item.location || "",
          exactLocation: item.exactLocation || "",
          date: item.date ? item.date.split("T")[0] : "",
          status: item.status || "Pending",
        });
        if (item.reportLocation?.coordinates) {
          setReportLocation(item.reportLocation);
        }
        if (item.user === "Anonymous") setIsAnonymous(true);
        else setIsAnonymous(false);
        // Load existing images as previews (Item model images are plain strings)
        if (item.images?.length > 0) {
          setImages(
            item.images.map((img) => ({
              preview: img,
              name: "image",
              existing: true,
              url: img
            }))
          );
        }
      })
      .catch((err) => setSubmitError(err.message || "Unable to load this item. Please try again."));
  }, [editId]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (submitError) setSubmitError("");
  }

  function handleLocationTagChange(loc) {
    setReportLocation(loc);
    if (errors.reportLocation)
      setErrors((prev) => ({ ...prev, reportLocation: "" }));
    if (submitError) setSubmitError("");
  }

  function handleFiles(files) {
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const toAdd = valid.slice(0, 1 - images.length).map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      name: f.name
    }));
    setImages((prev) => [...prev, ...toAdd]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Item title is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    if (!form.category) e.category = "Please select a category.";
    if (!form.location) e.location = "Please select a location.";
    if (!form.date) {
      e.date = "Please select a date.";
    } else {
      const today = new Date();
      const localToday = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
      ].join("-");

      if (form.date > localToday) {
        e.date = "Date cannot be in the future";
      }
    }
    if (!reportLocation?.coordinates)
      e.reportLocation = "Please tag a location on the map.";
    return e;
  }

  async function handleSubmit() {
    if (submitLock.current) return;

    submitLock.current = true;
    setIsSubmitting(true);
    setSubmitError("");

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      submitLock.current = false;
      setIsSubmitting(false);

      const fieldOrder = [
        "title",
        "description",
        "category",
        "location",
        "reportLocation",
        "date",
      ];

      const firstError = fieldOrder.find(
        (field) => newErrors[field]
      );

      if (firstError) {
        const selector =
          firstError === "reportLocation"
            ? '[data-location-tag-field]'
            : `[name="${firstError}"]`;

        const field = formContainerRef.current?.querySelector(selector);

        if (field) {
          requestAnimationFrame(() => {
            field.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });

            if (firstError !== "reportLocation") {
              field.focus({ preventScroll: true });
            }
          });
        }
      }

      return;
    }

    try {
      const authUser = getAuthUser();
      if (!authUser) {
        setSubmitError("Not authenticated. Please log in.");
        return;
      }

      const imageData = await Promise.all(
        images.map((img) => {
          // If existing image from DB, just pass it as-is
          if (img.existing) {
            return Promise.resolve({
              url: img.url,
              filename: img.filename,
              mimetype: img.mimetype,
              size: img.size
            });
          }
          // New image — convert to base64
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                url: reader.result,
                filename: img.file.name,
                mimetype: img.file.type,
                size: img.file.size
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
      const imageUrls = imageData.map((img) => img.url);

      const response = await apiFetch(url, {
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
          type: "Found",
          user: isAnonymous ? "Anonymous" : authUser.fullName || "Anonymous",
          reportLocation: {
            type: "Point",
            coordinates: reportLocation.coordinates,
            formattedAddress: reportLocation.formattedAddress || ""
          },
          ...(editId && isAdmin() ? { status: form.status } : {}),
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));

        if (Array.isArray(error.missingFields)) {
          const serverErrors = {};
          for (const field of error.missingFields) {
            serverErrors[field === "dateFound" ? "date" : field] =
              "This field is required.";
          }
          setErrors((prev) => ({ ...prev, ...serverErrors }));
        }

        throw new Error(
          error.error || error.message || "Failed to submit report"
        );
      }

      showToast(editId ? "Item updated successfully!" : "Report submitted successfully!", "success");
      navigate(
        editId
          ? `/item/${editId}?returnTo=${encodeURIComponent(returnTo)}`
          : "/found-items"
      );
    } catch (error) {
      setSubmitError(error.message || "Failed to submit report");
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] font-sans py-8 px-4 transition-colors duration-200">
      {/* Back */}
      <div className="max-w-2xl mx-auto mb-4 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 bg-transparent border-none text-sm text-[var(--color-text-secondary)] cursor-pointer p-0 font-medium hover:text-[var(--color-text-primary)] transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          {t("Back")}
        </button>
        <NotificationButton />
      </div>

      {/* Card */}
      <div
        ref={formContainerRef}
        className="max-w-2xl mx-auto bg-[var(--color-bg-surface)] rounded-2xl shadow-sm border border-[var(--color-border)] p-10 transition-colors duration-200"
      >
        {/* <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1">Report Found Item</h1>
        <p className="text-sm text-gray-400 mb-8">Help someone reunite with their belongings.</p> */}
        <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)] tracking-tight mb-1">
          {editId ? t("Edit Found Item") : t("Report Found Item")}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">
          {editId
            ? t("Update the details below and save.")
            : t("Help someone reunite with their belongings.")}
        </p>

        {submitError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {t(submitError)}
          </div>
        )}

        {/* Item Title */}
        <Field label={t("Item Title")} required error={errors.title}>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder={t("e.g., iPhone with Blue Case")}
            className={errors.title ? inputErrorClass : inputClass}
          />
        </Field>

        {/* Description */}
        <Field label={t("Description")} required error={errors.description}>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder={t("Describe the item you found...")}
            rows={3}
            className={`${errors.description ? inputErrorClass : inputClass} resize-y`}
          />
          <p className="mt-1.5 text-xs text-gray-400">{t("Note: For security, don't reveal all identifying details. The owner should be able to describe specific features to claim it.")}</p>
        </Field>

        {/* Category + Color */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">{t("Category ")}<span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={`${errors.category ? inputErrorClass : inputClass} appearance-none cursor-pointer`}
            >
              <option value="">{t("Select category")}</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(c)}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-red-500">{t(errors.category)}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">{t("Color")}</label>
            <input
              name="color"
              value={form.color}
              onChange={handleChange}
              placeholder={t("e.g., Black, Blue")}
              className={inputClass}
            />
          </div>
        </div>

        {/* Distinctive Marks */}
        <Field label={t("Distinctive Marks or Features")}>
          <textarea
            name="marks"
            value={form.marks}
            onChange={handleChange}
            placeholder={t("Any unique identifiers (optional - for verification purposes)")}
            rows={2}
            className={`${inputClass} resize-y`}
          />
        </Field>

        {/* Location */}
        <Field
          label={t("Location Found (University)")}
          required
          error={errors.location}
        >
          <select
            name="location"
            value={form.location}
            onChange={handleChange}
            className={`${errors.location ? inputErrorClass : inputClass} appearance-none cursor-pointer`}
          >
            <option value="">{t("Select location")}</option>
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </Field>

        {/* Exact Location */}
        <Field label={t("Exact Place (e.g., Library 2nd floor, Cafe table)")}>
          <input
            name="exactLocation"
            value={form.exactLocation}
            onChange={handleChange}
            placeholder={t("Where exactly?")}
            className={inputClass}
          />
        </Field>

        {/* Location Tag (map pin) */}
        <div data-location-tag-field>
          <LocationTagField
            value={reportLocation}
            onChange={handleLocationTagChange}
            error={errors.reportLocation}
          />
        </div>

        {/* Date */}
        <Field label={t("Date Found")} required error={errors.date}>
          <input
            type="date" 
            name="date"
            value={form.date}
            onChange={handleChange}
            className={errors.date ? inputErrorClass : inputClass}
          />
        </Field>

        {editId && isAdmin() && (
          <Field label={t("Status")} required>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              <option value="Pending">{t("Pending")}</option>
              <option value="Approved">{t("Approved")}</option>
              <option value="Rejected">{t("Rejected")}</option>
              <option value="Matched">{t("Matched")}</option>
              <option value="Returned">{t("Returned")}</option>
            </select>
          </Field>
        )}

        {/* Image Upload */}
        <div className="mb-3">
          <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">{t("Images")}{" "}
            <span className="text-[var(--color-text-muted)] font-normal">{t("(Recommended, max 1)")}</span>
          </label>

          {/* Dropzone */}
          <div
            onClick={() => images.length < 1 && fileInputRef.current.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-9 text-center transition-colors
              ${dragOver ? "border-[var(--color-brand)] bg-[var(--color-brand-active-bg)]" : "border-[var(--color-border)] bg-[var(--color-bg-raised)]"}
              ${images.length < 1 ? "cursor-pointer hover:border-gray-400" : "cursor-default opacity-60"}`}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#aaa"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-2.5"
            >
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">
              <span
                className="text-blue-500 font-semibold cursor-pointer hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current.click();
                }}
              >{t("Upload files")}</span>{" "}{t("or drag and drop")}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{t("PNG, JPG, GIF up to 10MB")}</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {/* Previews */}
          {images.length > 0 && (
            <div className="flex gap-2.5 mt-3 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative w-20 h-20">
                  <img
                    src={img.preview}
                    alt={img.name}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() =>
                      setImages((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="absolute -top-1.5 -right-1.5 bg-red-500 border-none rounded-full w-5 h-5 flex items-center justify-center text-white text-xs font-bold cursor-pointer leading-none hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mb-7">{t("Photos help owners identify their items faster. A QR code will be automatically generated for this item.")}</p>

        {/* Anonymous Toggle */}
        <div className="flex items-center mb-5 mt-2">
          <input
            type="checkbox"
            id="anonToggleFound"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <label
            htmlFor="anonToggleFound"
            className="ml-2 text-sm font-semibold text-[var(--color-text-primary)] cursor-pointer select-none"
          >{t("Post Anonymously (Hide my name)")}</label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {/* <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-gray-900 text-white border-none rounded-xl text-sm font-bold cursor-pointer hover:bg-gray-800 transition-colors"
          >
            Submit Report
          </button> */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-[var(--color-brand)] text-[var(--color-brand-text)] border-none rounded-xl text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity"
          >
            {isSubmitting
              ? t("Submitting...")
              : editId
                ? t("Save Changes")
                : t("Submit Report")}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-xl text-sm font-semibold cursor-pointer hover:bg-[var(--color-bg-raised)] transition-colors"
          >{t("Cancel")}</button>
        </div>
      </div>
    </div>
  );
}
