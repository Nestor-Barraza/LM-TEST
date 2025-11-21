import { algoliasearch } from 'algoliasearch';
import type { SearchClient, SearchMethodParams, SearchResponses } from 'algoliasearch';

if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID) {
  throw new Error('NEXT_PUBLIC_ALGOLIA_APP_ID is not defined');
}

if (!process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY) {
  throw new Error('NEXT_PUBLIC_ALGOLIA_SEARCH_KEY is not defined');
}

const baseClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
);

export const searchClient: SearchClient = {
  ...baseClient,
  search<TObject>(requests: SearchMethodParams): Promise<SearchResponses<TObject>> {
    const requestsArray = Array.isArray(requests) ? requests : [requests];

    const allEmpty = requestsArray.every((request) => {
      if ('params' in request && request.params) {
        const query = request.params.query;
        return !query || (typeof query === 'string' && query.trim() === '');
      }
      return true;
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
      }) as Promise<SearchResponses<TObject>>;
    }

    
    return baseClient.search<TObject>(requests).catch((error: Error) => {
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
        } as SearchResponses<TObject>;
      }
      throw error;
    });
  },
};

export const PRODUCTS_INDEX = 'products';
