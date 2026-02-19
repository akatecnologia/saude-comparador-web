import { useState, useEffect } from "react";
import { getPrecos, getPrecoHistorico } from "@/lib/api-client";
import type { VcmFaixaItem, VcmHistoricoItem } from "@/types";

export function usePrecos(idPlanoAns: string | undefined) {
  const [faixas, setFaixas] = useState<VcmFaixaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!idPlanoAns) return;
    setLoading(true);
    getPrecos(idPlanoAns)
      .then((res) => setFaixas(res.faixas))
      .catch(() => setFaixas([]))
      .finally(() => setLoading(false));
  }, [idPlanoAns]);

  return { faixas, loading };
}

export function usePrecoHistorico(
  idPlanoAns: string | undefined,
  faixaEtaria: string | undefined,
) {
  const [historico, setHistorico] = useState<VcmHistoricoItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!idPlanoAns || !faixaEtaria) return;
    setLoading(true);
    getPrecoHistorico(idPlanoAns, faixaEtaria)
      .then((res) => setHistorico(res.historico))
      .catch(() => setHistorico([]))
      .finally(() => setLoading(false));
  }, [idPlanoAns, faixaEtaria]);

  return { historico, loading };
}
