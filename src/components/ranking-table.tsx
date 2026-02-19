import { Link } from "react-router";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { RankingEntry } from "@/types";
import { cn, getIdssBadge, getIdssBgColor } from "@/lib/utils";

interface RankingTableProps {
  data: RankingEntry[];
  sortField?: string;
  sortDir?: "asc" | "desc";
  onSort?: (field: string) => void;
}

function SortIcon({
  field,
  activeField,
  dir,
}: {
  field: string;
  activeField?: string;
  dir?: "asc" | "desc";
}) {
  if (field !== activeField) {
    return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
  }
  return dir === "asc" ? (
    <ArrowUp className="h-3 w-3 text-primary" />
  ) : (
    <ArrowDown className="h-3 w-3 text-primary" />
  );
}

function ScoreBar({ value, max = 1 }: { value: number | null; max?: number }) {
  if (value == null) return <span className="text-gray-400 text-xs">N/D</span>;
  const num = Number(value);
  const pct = Math.min((num / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct >= 80
              ? "bg-success"
              : pct >= 60
                ? "bg-warning"
                : "bg-danger",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-700 w-10 text-right">
        {num.toFixed(2)}
      </span>
    </div>
  );
}

export default function RankingTable({
  data,
  sortField,
  sortDir,
  onSort,
}: RankingTableProps) {
  const headers = [
    { key: "posicao", label: "#", sortable: true },
    { key: "nome", label: "Operadora", sortable: true },
    { key: "modalidade", label: "Modalidade", sortable: false },
    { key: "uf", label: "UF", sortable: false },
    { key: "idss", label: "IDSS", sortable: true },
    { key: "idqs", label: "IDQS", sortable: true },
    { key: "idga", label: "IDGA", sortable: true },
    { key: "idsm", label: "IDSM", sortable: true },
    { key: "idgr", label: "IDGR", sortable: true },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-gray-200">
            {headers.map((h) => (
              <th
                key={h.key}
                className={cn(
                  "px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider",
                  h.sortable && onSort && "cursor-pointer hover:text-gray-700",
                )}
                onClick={() => h.sortable && onSort?.(h.key)}
              >
                <div className="flex items-center gap-1">
                  {h.label}
                  {h.sortable && onSort && (
                    <SortIcon
                      field={h.key}
                      activeField={sortField}
                      dir={sortDir}
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((entry) => (
            <tr
              key={`${entry.registro_ans}-${entry.ano_referencia}`}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-3 py-3">
                <span className="text-sm font-bold text-gray-400">
                  {entry.posicao}
                </span>
              </td>
              <td className="px-3 py-3">
                <Link
                  to={`/operadoras/${entry.registro_ans}`}
                  className="text-sm font-medium text-gray-900 hover:text-primary transition-colors"
                >
                  {entry.nome_fantasia || entry.razao_social}
                </Link>
                <div className="text-xs text-gray-400">
                  {entry.registro_ans}
                </div>
              </td>
              <td className="px-3 py-3 text-xs text-gray-600">
                {entry.modalidade}
              </td>
              <td className="px-3 py-3 text-xs text-gray-600">{entry.uf}</td>
              <td className="px-3 py-3">
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold",
                    getIdssBgColor(entry.idss),
                  )}
                >
                  {getIdssBadge(entry.idss)}
                </span>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {entry.idss != null ? Number(entry.idss).toFixed(2) : "N/D"}
                </span>
              </td>
              <td className="px-3 py-3 min-w-[140px]">
                <ScoreBar value={entry.idqs} />
              </td>
              <td className="px-3 py-3 min-w-[140px]">
                <ScoreBar value={entry.idga} />
              </td>
              <td className="px-3 py-3 min-w-[140px]">
                <ScoreBar value={entry.idsm} />
              </td>
              <td className="px-3 py-3 min-w-[140px]">
                <ScoreBar value={entry.idgr} />
              </td>
            </tr>
          ))}

          {data.length === 0 && (
            <tr>
              <td
                colSpan={9}
                className="px-3 py-12 text-center text-gray-500 text-sm"
              >
                Nenhum resultado encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
