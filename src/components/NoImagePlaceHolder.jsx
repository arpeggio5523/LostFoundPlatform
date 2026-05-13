import{Search} from "lucide-react";

export default function NoImagePlaceholder() {
  return (
    <div className="w-full h-52 bg-green-50 flex items-center justify-center text-green-800">
      <Search
        size = {50}
        strokeWidth={2}
      /> 
    </div>
  );
}