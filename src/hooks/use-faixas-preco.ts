import { useState, useEffect, useCallback } from "react";
import { getFaixasPreco } from "@/lib/api-client";
import type { FaixaPrecoItem } from "@/types";

export function useFaixasPreco() {
  const [items, setItems] = useState<FaixaPrecoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFaixasPreco()
      .then((res) => setItems(res.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const lookup = useCallback(
    (tipoContratacao: string | null | undefined, faixaEtaria: string | null | undefined): FaixaPrecoItem | null => {
      if (!tipoContratacao || !faixaEtaria) return null;
      return items.find(
        (i) => i.tipo_contratacao === tipoContratacao && i.faixa_etaria === faixaEtaria,
      ) ?? null;
    },
    [items],
  );

  return { items, loading, lookup };
}
