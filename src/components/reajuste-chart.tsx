import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { Reajuste } from "@/types";

interface ReajusteChartProps {
  data: Reajuste[];
  tetoAns?: number;
  className?: string;
}

interface ChartDataPoint {
  ano: number;
  individual: number | null;
  coletivo: number | null;
}

export default function ReajusteChart({
  data,
  tetoAns,
  className,
}: ReajusteChartProps) {
  // Group reajustes by year
  const grouped = data.reduce<Record<number, ChartDataPoint>>((acc, r) => {
    if (!acc[r.ano]) {
      acc[r.ano] = { ano: r.ano, individual: null, coletivo: null };
    }
    const entry = acc[r.ano]!;
    if (r.tipo_plano.toLowerCase().includes("individual")) {
      entry.individual = r.percentual;
    } else {
      entry.coletivo = r.percentual;
    }
    return acc;
  }, {});

  const chartData = Object.values(grouped).sort((a, b) => a.ano - b.ano);

  if (chartData.length === 0) {
    return (
      <div
        className={`flex items-center justify-center h-64 bg-gray-50 rounded-lg text-gray-500 text-sm ${className || ""}`}
      >
        Sem dados de reajuste disponíveis
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="ano"
            tick={{ fontSize: 12, fill: "#6B7280" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6B7280" }}
            tickLine={false}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              fontSize: "13px",
            }}
            formatter={(value: number) => [`${value.toFixed(2)}%`]}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px" }}
            iconType="circle"
          />
          <Bar
            dataKey="individual"
            name="Individual"
            fill="#0066FF"
            radius={[4, 4, 0, 0]}
            barSize={24}
          />
          <Bar
            dataKey="coletivo"
            name="Coletivo"
            fill="#00C853"
            radius={[4, 4, 0, 0]}
            barSize={24}
          />
          {tetoAns != null && (
            <ReferenceLine
              y={tetoAns}
              stroke="#FF1744"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `Teto ANS: ${tetoAns}%`,
                position: "insideTopRight",
                fill: "#FF1744",
                fontSize: 11,
              }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
