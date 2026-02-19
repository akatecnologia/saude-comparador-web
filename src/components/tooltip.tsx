import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ text, children, className }: TooltipProps) {
  return (
    <span className={cn("relative group/tip inline-flex items-center", className)}>
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-gray-900 text-white text-[11px] leading-relaxed whitespace-normal w-56 text-center opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50 shadow-lg">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </span>
    </span>
  );
}

interface InfoTipProps {
  text: string;
  className?: string;
}

export function InfoTip({ text, className }: InfoTipProps) {
  return (
    <Tooltip text={text} className={className}>
      <Info className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-help ml-0.5 shrink-0" />
    </Tooltip>
  );
}

interface MetricLabelProps {
  label: string;
  tooltip: string;
  date?: string | null;
  className?: string;
}

export function MetricLabel({ label, tooltip, date, className }: MetricLabelProps) {
  return (
    <div className={cn("flex items-center justify-center gap-0.5", className)}>
      <Tooltip text={tooltip}>
        <span className="text-[10px] text-gray-500 uppercase font-medium cursor-help border-b border-dotted border-gray-300">
          {label}
        </span>
      </Tooltip>
      {date && (
        <span className="text-[9px] text-gray-400 font-normal ml-0.5">
          {date}
        </span>
      )}
    </div>
  );
}
