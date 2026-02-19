import { Eye } from "lucide-react";
import type { PriceLevel } from "@/lib/utils";
import { getPriceLevelLabel } from "@/lib/utils";

interface PriceLevelBadgeProps {
  level: PriceLevel;
  onClick: () => void;
}

export default function PriceLevelBadge({ level, onClick }: PriceLevelBadgeProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full p-3 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer text-center group"
    >
      <div className="text-[10px] text-amber-600 uppercase font-medium mb-0.5">
        Nível de preço
      </div>
      <div className="text-lg font-bold text-amber-800 tracking-wider">
        {level}
      </div>
      <div className="text-[11px] text-amber-600 mb-1">
        {getPriceLevelLabel(level)}
      </div>
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary group-hover:text-primary-dark transition-colors">
        <Eye className="h-3 w-3" />
        Ver preço real
      </span>
    </button>
  );
}
