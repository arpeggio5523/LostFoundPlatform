import StatusBadge from "./StatusBadge";
import QRIcon from "./QRIcon";
import NoImagePlaceholder from "./NoImagePlaceholder";

export default function ItemCard({ item }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      {/* Image */}
      <div className="relative">
        {item.image
          ? <img src={item.image} alt={item.title} className="w-full h-52 object-cover block" />
          : <NoImagePlaceholder />
        }
        <QRIcon />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <h3 className="text-sm font-bold text-gray-900 leading-snug flex-1">{item.title}</h3>
          <StatusBadge status={item.status} />
        </div>

        <p className="text-sm text-gray-500 leading-relaxed mb-2.5 line-clamp-2">{item.description}</p>

        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span className="truncate">{item.location}</span>
        </div>
      </div>
    </div>
  );
}