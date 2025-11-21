import { create } from 'zustand';
import { SearchState } from '@/types/store';

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  results: [],
  loading: 'idle',
  error: null,
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({ query: '', results: [], loading: 'idle', error: null }),
}));
