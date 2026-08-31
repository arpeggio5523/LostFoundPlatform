import React, { useEffect, useRef, useState } from "react";
import { Check, Download, Share2, X } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRCodeModal({ isOpen, onClose, item }) {
  const qrCanvasRef = useRef(null);
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocusedElement = document.activeElement;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = modalRef.current?.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const itemId = item._id || item.id;
  const publicAppUrl = (import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin)
    .trim()
    .replace(/\/$/, "");
  const itemUrl = itemId
    ? `${publicAppUrl}/item/${encodeURIComponent(itemId)}`
    : null;

  const fileName = `qr-${itemId || "item"}.png`;

  const getQrBlob = () =>
    new Promise((resolve, reject) => {
      const canvas = qrCanvasRef.current;
      if (!canvas) {
        reject(new Error("QR code is not ready"));
        return;
      }

      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error("Could not create QR image")),
        "image/png"
      );
    });

  const handleDownload = async () => {
    const blob = await getQrBlob();
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const handleShare = async () => {
    setShareStatus("");

    try {
      const blob = await getQrBlob();
      const file = new File([blob], fileName, { type: "image/png" });
      const shareData = {
        title: `${item.title || "Item"} QR code`,
        text: `View the details for ${item.title || "this item"}`,
        url: itemUrl,
      };

      if (navigator.share) {
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ ...shareData, files: [file] });
        } else {
          await navigator.share(shareData);
        }
        return;
      }

      await navigator.clipboard.writeText(itemUrl);
      setShareStatus("Link copied");
    } catch (error) {
      if (error.name !== "AbortError") setShareStatus("Unable to share");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-modal-title"
        className="relative max-h-[calc(100vh-2rem)] w-full max-w-[480px] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-10"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close QR code dialog"
          className="absolute right-4 top-4 rounded-md border p-1 hover:bg-gray-100"
        >
          <X size={15} />
        </button>

        <h2 id="qr-modal-title" className="mb-6 pr-8 text-xl font-bold text-[var(--color-text-primary)]">
          QR Code
        </h2>

        <div className="flex flex-col items-center">
          {itemUrl ? (
            <div
              className="rounded-xl bg-white p-3"
              role="img"
              aria-label={`QR code for ${item.title || "item"}`}
            >
              <QRCodeCanvas
                ref={qrCanvasRef}
                value={itemUrl}
                size={250}
                level="H"
                marginSize={2}
                title={`Open ${item.title || "item"} details`}
                className="h-auto max-w-full"
              />
            </div>
          ) : (
            <div className="flex h-[250px] w-[250px] items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
              No QR code available
            </div>
          )}

          <p className="mt-2 text-center text-sm text-[var(--color-text-secondary)]">
            Scan to open the details for {item.title || "this item"}.
          </p>

          {itemUrl && (
            <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleDownload}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-gray-100"
              >
                <Download size={17} />
                Download
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-brand)] px-4 py-3 text-sm font-semibold text-[var(--color-brand-text)] transition hover:bg-[var(--color-brand-hover)]"
              >
                {shareStatus === "Link copied" ? <Check size={17} /> : <Share2 size={17} />}
                {shareStatus || "Share"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
