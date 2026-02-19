/**
 * Detects the user's Brazilian state (UF) via timezone mapping.
 *
 * No external API call needed — uses Intl.DateTimeFormat to get the
 * IANA timezone (e.g. "America/Sao_Paulo") and maps it to a UF.
 * Falls back to localStorage if the user has previously selected a state.
 */

import { useState } from "react";

const TIMEZONE_TO_UF: Record<string, string> = {
  "America/Rio_Branco": "AC",
  "America/Maceio": "AL",
  "America/Manaus": "AM",
  "America/Macapa": "AP",
  "America/Bahia": "BA",
  "America/Fortaleza": "CE",
  "America/Sao_Paulo": "SP",
  "America/Campo_Grande": "MS",
  "America/Cuiaba": "MT",
  "America/Belem": "PA",
  "America/Santarem": "PA",
  "America/Recife": "PE",
  "America/Araguaina": "TO",
  "America/Noronha": "PE",
  "America/Porto_Velho": "RO",
  "America/Boa_Vista": "RR",
  "America/Eirunepe": "AM",
};

// Timezones shared by multiple states — map to the most populated one
const TIMEZONE_REGION_FALLBACK: Record<string, string> = {
  "America/Sao_Paulo": "SP", // SP, PR, SC, RS, MG, RJ, ES, GO, DF
  "America/Fortaleza": "CE", // CE, RN, PB, PI, MA, SE
  "America/Recife": "PE",
  "America/Bahia": "BA",
  "America/Manaus": "AM",
  "America/Belem": "PA",
};

const STORAGE_KEY = "saudecomparador_uf";

function detectUfFromTimezone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIMEZONE_TO_UF[tz] || TIMEZONE_REGION_FALLBACK[tz] || null;
  } catch {
    return null;
  }
}

export function useUserUf(): [string, (uf: string) => void] {
  const [uf, setUfState] = useState<string>(() => {
    // 1. Check localStorage first (user's explicit choice)
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return saved;
    } catch {
      // localStorage unavailable
    }

    // 2. Detect from timezone
    return detectUfFromTimezone() || "";
  });

  function setUf(value: string) {
    setUfState(value);
    try {
      if (value) {
        localStorage.setItem(STORAGE_KEY, value);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // localStorage unavailable
    }
  }

  return [uf, setUf];
}
