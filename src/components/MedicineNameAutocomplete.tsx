import React, { useEffect, useId, useState } from 'react';
import { Search } from 'lucide-react';

interface MedicineNameAutocompleteProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  fetchSuggestions: (query: string) => Promise<string[]>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const MedicineNameAutocomplete: React.FC<MedicineNameAutocompleteProps> = ({
  id,
  name,
  value,
  onChange,
  onSelect,
  fetchSuggestions,
  label,
  placeholder,
  required = false,
  className,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  useEffect(() => {
    if (!value.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      let isActive = true;
      setIsLoading(true);

      fetchSuggestions(value)
        .then((nextSuggestions) => {
          if (!isActive) return;
          setSuggestions(nextSuggestions);
          setIsOpen(nextSuggestions.length > 0);
          setHighlightedIndex(-1);
        })
        .catch(() => {
          if (!isActive) return;
          setSuggestions([]);
          setIsOpen(false);
        })
        .finally(() => {
          if (isActive) {
            setIsLoading(false);
          }
        });

      return () => {
        isActive = false;
      };
    }, 180);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value, fetchSuggestions]);

  const handleSelect = (nextValue: string) => {
    onSelect(nextValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((current) => (current + 1) % suggestions.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((current) => (current - 1 + suggestions.length) % suggestions.length);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (highlightedIndex >= 0) {
        handleSelect(suggestions[highlightedIndex]);
      }
      return;
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className={`relative ${className ?? ''}`}>
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-slate-200">
          {label}
        </label>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          id={inputId}
          name={name}
          type="text"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          onFocus={() => {
            if (value.trim() && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            window.setTimeout(() => setIsOpen(false), 150);
          }}
          onKeyDown={handleKeyDown}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-slate-700/60 bg-slate-900 py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {isOpen && (
        <ul className="absolute z-20 mt-2 max-h-56 w-full overflow-auto rounded-2xl border border-slate-700/60 bg-slate-950/95 p-2 shadow-xl shadow-slate-950/30">
          {isLoading ? (
            <li className="rounded-xl px-3 py-2 text-sm text-slate-400">Loading suggestions...</li>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <li key={`${suggestion}-${index}`}>
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleSelect(suggestion);
                  }}
                  onClick={() => handleSelect(suggestion)}
                  className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-slate-200 transition ${index === highlightedIndex ? 'bg-slate-800 text-slate-50' : 'hover:bg-slate-800/70'}`}
                >
                  {suggestion}
                </button>
              </li>
            ))
          ) : (
            <li className="rounded-xl px-3 py-2 text-sm text-slate-400">No common matches found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default MedicineNameAutocomplete;
