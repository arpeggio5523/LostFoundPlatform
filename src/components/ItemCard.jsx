import StatusBadge from "./StatusBadge";
import QRIcon from "./QRIcon";
import NoImagePlaceholder from "./NoImagePlaceHolder";
import {Calendar, MapPinIcon} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentUserId } from "../services/authState";
import { useState } from "react";
import QRCodeModal from "./QRcode";

export default function ItemCard({ item, dateLabel }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/item/${item._id || item.id}`);
  }

  const currentUserId = getCurrentUserId();
  const showActions = item && currentUserId &&
    String(item.reportedBy?._id || item.reportedBy) === String(currentUserId);

  const handleEdit = (e) => {
    e.stopPropagation();
  };

  const [showQRModal, setShowQRModal] = useState(false);

  return (
    <>
      <div
        onClick={handleCardClick}
        className="bg-white dark:bg-[var(--color-bg-surface)] rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-[var(--color-border)] cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
      >
        {/* Image */}
        <div className="relative">
            {item.image
            ? <img src={item.image} alt={item.title} className="w-full h-52 object-cover block" />
            : <NoImagePlaceholder />
            }
            <QRIcon
              onClick={(e) => {
                e.stopPropagation();
                setShowQRModal(true);
              }}
            />
        </div>

        {/* Content */}
        <div className="p-4">
            <div className="flex items-center justify-between gap-2 mb-1.5">
                <h3 className="text-sm font-bold text-[var(--color-brand)] leading-snug flex-1">{item.title}</h3>
                <StatusBadge status={item.status} />
            </div>

            <p className="mb-2.5 h-[56px] overflow-hidden line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-[var(--color-text-secondary)]">{item.description}</p>

            <div className="mb-2 flex items-center gap-1.5 text-gray-500 dark:text-[var(--color-text-secondary)] text-xs">
                <MapPinIcon size={16} strokeWidth={2} className='shrink-0'/>
                <span className="truncate">{item.location}</span>
            </div>

            <div className="mb-2 flex items-center gap-2 text-xs text-gray-500 dark:text-[var(--color-text-secondary)]">
                <Calendar size={16} strokeWidth={2} className='shrink-0'/>
                <span>{dateLabel} {item.date}</span>
            </div>

            <div className="mb-4 border-t border-gray-200 dark:border-[var(--color-border)]"></div>
            <div className="mt-1 flex items-center justify-between">
                <span className="rounded-lg border border-gray-200 dark:border-[var(--color-border)] px-2 py-1 text-xs font-semibold text-black dark:text-[var(--color-text-primary)]">
                    {item.category}
                </span>
                <span className="text-xs text-gray-400 dark:text-[var(--color-text-muted)]">
                    By {item.user}
                </span>
            </div>
          </div>
      </div>
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        item={item}
      />
    </>
  );
}