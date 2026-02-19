import { useState, useEffect } from "react";
import { getQualidade } from "@/lib/api-client";
import type { QualidadeResponse } from "@/types";

export function useQualidade(registroAns: string | undefined) {
  const [qualidade, setQualidade] = useState<QualidadeResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!registroAns) return;
    setLoading(true);
    getQualidade(registroAns)
      .then((data) => setQualidade(data))
      .catch(() => setQualidade(null))
      .finally(() => setLoading(false));
  }, [registroAns]);

  return { qualidade, loading };
}
