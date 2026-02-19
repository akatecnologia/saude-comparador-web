import { useSyncExternalStore } from "react";

const KEYS = {
  id: "saude_lead_id",
  nome: "saude_lead_nome",
  uf: "saude_lead_uf",
  faixa: "saude_lead_faixa",
  tipo: "saude_lead_tipo",
} as const;

// Simple event emitter so all hook instances stay in sync
const listeners = new Set<() => void>();
function emit() {
  for (const fn of listeners) fn();
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

function getSnapshot() {
  try {
    return localStorage.getItem(KEYS.id);
  } catch {
    return null;
  }
}

export interface LeadData {
  id: string;
  nome: string;
  uf: string;
  faixa_etaria: string;
  tipo_contratacao: string;
}

export function setLead(lead: LeadData) {
  try {
    localStorage.setItem(KEYS.id, lead.id);
    localStorage.setItem(KEYS.nome, lead.nome);
    localStorage.setItem(KEYS.uf, lead.uf);
    localStorage.setItem(KEYS.faixa, lead.faixa_etaria);
    localStorage.setItem(KEYS.tipo, lead.tipo_contratacao);
  } catch { /* ignore */ }
  emit();
}

export function clearLead() {
  try {
    for (const key of Object.values(KEYS)) localStorage.removeItem(key);
  } catch { /* ignore */ }
  emit();
}

function readLead(): LeadData | null {
  try {
    const id = localStorage.getItem(KEYS.id);
    if (!id) return null;
    return {
      id,
      nome: localStorage.getItem(KEYS.nome) || "",
      uf: localStorage.getItem(KEYS.uf) || "",
      faixa_etaria: localStorage.getItem(KEYS.faixa) || "",
      tipo_contratacao: localStorage.getItem(KEYS.tipo) || "",
    };
  } catch {
    return null;
  }
}

export function useLead() {
  const snapshotId = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const isLead = snapshotId != null;
  const lead = isLead ? readLead() : null;
  return { isLead, lead, setLead, clearLead };
}
