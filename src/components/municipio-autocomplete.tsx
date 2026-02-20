import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Loader2, X } from "lucide-react";
import { buscarMunicipios } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { MunicipioOption } from "@/types";

interface MunicipioAutocompleteProps {
  value: string;
  uf?: string;
  onChange: (cidade: string) => void;
}

export default function MunicipioAutocomplete({
  value,
  uf,
  onChange,
}: MunicipioAutocompleteProps) {
  const [inputText, setInputText] = useState(value);
  const [options, setOptions] = useState<MunicipioOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Sync input text when external value changes (e.g. cleared by parent)
  useEffect(() => {
    setInputText(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  const fetchOptions = useCallback(
    (query: string) => {
      clearTimeout(debounceRef.current);
      if (query.length < 2) {
        setOptions([]);
        setIsOpen(false);
        return;
      }
      setLoading(true);
      debounceRef.current = setTimeout(() => {
        buscarMunicipios({ q: query, uf: uf || undefined })
          .then((data) => {
            setOptions(data);
            setIsOpen(data.length > 0);
            setActiveIndex(-1);
          })
          .catch(() => {
            setOptions([]);
            setIsOpen(false);
          })
          .finally(() => setLoading(false));
      }, 300);
    },
    [uf],
  );

  function handleInputChange(text: string) {
    setInputText(text);
    // If user clears or edits text and previously had a selection, clear value
    if (value && text !== value) {
      onChange("");
    }
    fetchOptions(text);
  }

  function selectOption(option: MunicipioOption) {
    setInputText(option.nome);
    onChange(option.nome);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  }

  function handleClear() {
    setInputText("");
    onChange("");
    setOptions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) {
      if (e.key === "ArrowDown" && options.length > 0) {
        setIsOpen(true);
        setActiveIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : options.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        {
          const opt = options[activeIndex];
          if (activeIndex >= 0 && opt) {
            selectOption(opt);
          }
        }
        break;
      case "Escape":
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (options.length > 0 && inputText.length >= 2 && !value) {
              setIsOpen(true);
            }
          }}
          placeholder="Buscar municipio..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `mun-option-${activeIndex}` : undefined
          }
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
        {!loading && (inputText || value) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="h-3.5 w-3.5 text-gray-400" />
          </button>
        )}
      </div>

      {isOpen && options.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {options.map((option, idx) => (
            <li
              key={option.id}
              id={`mun-option-${idx}`}
              role="option"
              aria-selected={idx === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault();
                selectOption(option);
              }}
              onMouseEnter={() => setActiveIndex(idx)}
              className={cn(
                "px-3 py-2 text-sm cursor-pointer transition-colors",
                idx === activeIndex
                  ? "bg-primary-light text-primary"
                  : "text-gray-700 hover:bg-gray-50",
              )}
            >
              {option.nome}
              {!uf && (
                <span className="text-gray-400 ml-1">({option.uf})</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
