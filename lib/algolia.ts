import { algoliasearch } from 'algoliasearch';

if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID) {
  throw new Error('NEXT_PUBLIC_ALGOLIA_APP_ID is not defined');
}

if (!process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY) {
  throw new Error('NEXT_PUBLIC_ALGOLIA_SEARCH_KEY is not defined');
}

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
);

interface SearchRequest {
  params?: {
    query?: string;
  };
}

interface SearchResult {
  hits: unknown[];
  nbHits: number;
  nbPages: number;
  page: number;
  processingTimeMS: number;
  hitsPerPage: number;
  exhaustiveNbHits: boolean;
  query: string;
  params: string;
}

interface SearchResponse {
  results: SearchResult[];
}

export const searchClient = {
  ...client,
  search(requests: Parameters<typeof client.search>[0]): ReturnType<typeof client.search> {
    const requestsArray = Array.isArray(requests) ? requests : [requests];

    const allEmpty = requestsArray.every((request: SearchRequest) => {
      const params = request.params;
      return !params?.query || params.query.trim() === '';
    });

    if (allEmpty) {
      return Promise.resolve({
        results: requestsArray.map(() => ({
          hits: [],
          nbHits: 0,
          nbPages: 0,
          page: 0,
          processingTimeMS: 0,
          hitsPerPage: 0,
          exhaustiveNbHits: false,
          query: '',
          params: '',
        })),
      } as SearchResponse) as ReturnType<typeof client.search>;
    }

    return client.search(requests).catch((error: Error) => {
      if (error.message?.includes('does not exist')) {
        return {
          results: requestsArray.map(() => ({
            hits: [],
            nbHits: 0,
            nbPages: 0,
            page: 0,
            processingTimeMS: 0,
            hitsPerPage: 0,
            exhaustiveNbHits: false,
            query: '',
            params: '',
          })),
        } as SearchResponse as ReturnType<typeof client.search>;
      }
      throw error;
    });
  },
};

export const PRODUCTS_INDEX = 'products';
