import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "./useDebounce";

interface UseDebouncedSearchOptions {
  delay?: number;
  minLength?: number;
  onSearch?: (searchTerm: string) => void;
}

interface UseDebouncedSearchReturn {
  searchTerm: string;
  debouncedSearchTerm: string;
  isSearching: boolean;
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
}

/**
 * Custom hook for debounced search with loading states
 * @param options Configuration options for the search
 * @returns Search state and controls
 */
export const useDebouncedSearch = (
  options: UseDebouncedSearchOptions = {}
): UseDebouncedSearchReturn => {
  const { delay = 300, minLength = 0, onSearch } = options;

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the search term
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  // Handle search loading state
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchTerm, debouncedSearchTerm]);

  // Trigger search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm.length >= minLength && onSearch) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, minLength, onSearch]);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  return {
    searchTerm,
    debouncedSearchTerm,
    isSearching,
    setSearchTerm,
    clearSearch,
  };
};
