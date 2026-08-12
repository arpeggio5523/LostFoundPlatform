import React from "react";
import { X } from "lucide-react";

export default function QRCodeModal({ isOpen, onClose, item }) {
  if (!isOpen || !item) return null;

  const qrImage = item.qrCode || item.qrCodeUrl || item.qrImage;

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
          {qrImage ? (
            <img
              src={qrImage}
              alt="Item QR Code"
              className="h-[250px] w-[250px] object-contain"
            />
          ) : (
            <div className="flex h-[250px] w-[250px] items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
              No QR code available
            </div>
          )}

          <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
            QR-{item.type?.toUpperCase()}-
          </p>
        </div>
      </div>
    </div>
  );
}