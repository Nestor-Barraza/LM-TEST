import { Product } from './product';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface SearchState {
  query: string;
  results: Product[];
  loading: LoadingState;
  error: string | null;
  setQuery: (query: string) => void;
  setResults: (results: Product[]) => void;
  setLoading: (loading: LoadingState) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
