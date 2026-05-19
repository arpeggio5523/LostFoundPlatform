import StatusBadge from "./StatusBadge";
import QRIcon from "./QRIcon";
import NoImagePlaceholder from "./NoImagePlaceHolder";
import {Calendar, MapPinIcon} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isOwner } from "../services/authState";

export default function ItemCard({ item, dateLabel }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/item/${item._id || item.id}`);
  }

    const showActions = isOwner(item);

    const handleEdit = (e) => {
        e.stopPropagation();
        navigate(`/report-found?edit=${item._id || item.id}`);
    };

  return (
    <div
      onClick={handleCardClick} 
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
    >

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

            <p className="mb-2.5 h-[56px] overflow-hidden line-clamp-2 text-sm leading-relaxed text-gray-500">{item.description}</p>
            
            <div className="mb-2 flex items-center gap-1.5 text-gray-500 text-xs">
                <MapPinIcon size={16} strokeWidth={2} className='shrink-0'/> 
                <span className="truncate">{item.location}</span>
            </div>

            <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={16} strokeWidth={2} className='shrink-0'/>
                <span>{dateLabel} {item.date}</span>
            </div>

            <div className="mb-4 border-t border-gray-200"></div>
            <div className="mt-1 flex items-center justify-between">
                <span className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-black">
                    {item.category}
                </span>

                <span className="text-xs text-gray-400">
                    By {item.user}
                </span>
            </div>
                        {showActions && (
                            <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                                <button
                                    onClick={handleEdit}
                                    className="flex-1 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all"
                                >
                                    Edit
                                </button>
                            </div>
                        )}
        </div>


    </div>
  );
}