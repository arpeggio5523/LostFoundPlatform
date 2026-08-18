import React from "react";
import { X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function QRCodeModal({ isOpen, onClose, item }) {
  if (!isOpen || !item) return null;

  const itemId = item._id || item.id;
  const itemUrl = itemId
    ? `${window.location.origin}/item/${encodeURIComponent(itemId)}`
    : null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="relative w-[480px] rounded-2xl bg-white p-10 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md border p-1 hover:bg-gray-100"
        >
          <X size={15} />
        </button>

        <h2 className="mb-6 text-xl font-bold text-[var(--color-text-primary)]">
          Item QR Code
        </h2>

        <div className="flex flex-col items-center">
          {itemUrl ? (
            <div
              className="rounded-xl bg-white p-3"
              role="img"
              aria-label={`QR code for ${item.title || "item"}`}
            >
              <QRCodeSVG
                value={itemUrl}
                size={250}
                level="H"
                marginSize={2}
                title={`Open ${item.title || "item"} details`}
              />
            </div>
          ) : (
            <div className="flex h-[250px] w-[250px] items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
              No QR code available
            </div>
          )}

          <p className="mt-4 text-center text-sm text-[var(--color-text-secondary)]">
            Scan to open the details for {item.title || "this item"}.
          </p>
        </div>
      </div>
    </div>
  );
}
