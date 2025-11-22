'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchBox, useHits, Configure, useInstantSearch } from 'react-instantsearch';
import { InstantSearchNext } from 'react-instantsearch-nextjs';
import { searchClient } from '@/lib/algolia';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/atoms/Spinner';
import { ImageWithPlaceholder } from '@/components/atoms/ImageWithPlaceholder';

interface Hit {
  objectID: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  thumbnail: string;
  category_name: string;
  condition: string;
  average_rating: number;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

function SearchInput({ onSearch }: SearchBarProps) {
  const { query, refine } = useSearchBox();
  const { hits, results } = useHits<Hit>();
  const { status } = useInstantSearch();
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isLoading = status === 'loading' || status === 'stalled';

  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isFocused || !hits.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < hits.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < hits.length) {
          const selectedHit = hits[selectedIndex];
          if (selectedHit) {
            router.push(`/product/${selectedHit.objectID}`);
            setIsFocused(false);
            inputRef.current?.blur();
          }
        } else if (query.trim()) {
          onSearch(query.trim());
          setIsFocused(false);
        }
        break;
      case 'Escape':
        setIsFocused(false);
        inputRef.current?.blur();
        break;
    }
  };

  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[0]?.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const showResults = isFocused && query && !results?.__isArtificial;

  return (
    <div className="relative w-full">
      <form onSubmit={(e) => e.preventDefault()} className="flex w-full">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => refine(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar productos, marcas y más..."
          className="flex-1 px-4 py-2.5 rounded-l-sm bg-white border-none focus:outline-none shadow-sm text-sm"
        />
        <button
          type="button"
          onClick={() => {
            if (selectedIndex >= 0 && selectedIndex < hits.length) {
              const selectedHit = hits[selectedIndex];
              if (selectedHit) {
                router.push(`/product/${selectedHit.objectID}`);
                setIsFocused(false);
              }
            } else if (query.trim()) {
              onSearch(query.trim());
              setIsFocused(false);
            }
          }}
          disabled={!query.trim()}
          className="bg-white hover:bg-gray-50 px-4 py-2.5 rounded-r-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border-l border-gray-200"
        >
          <img
            src="/assets/ic_Search.png"
            alt="Buscar"
            className="w-5 h-5"
          />
        </button>
      </form>

      {showResults && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded shadow-xl border border-gray-200 max-h-[500px] overflow-y-auto z-50"
        >
          {isLoading ? (
            <div className="p-6 flex justify-center items-center">
              <div className="flex flex-col items-center gap-2">
                <Spinner size="sm" />
                <p className="text-gray-500 text-xs">Buscando...</p>
              </div>
            </div>
          ) : hits.length === 0 ? (
            <div className="p-6">
              <p className="text-gray-500 text-center text-sm">No se encontraron productos</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {hits.map((hit, index) => (
                <div
                  key={hit.objectID}
                  onClick={() => {
                    router.push(`/product/${hit.objectID}`);
                    setIsFocused(false);
                  }}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                    selectedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                    {hit.thumbnail ? (
                      <ImageWithPlaceholder
                        src={hit.thumbnail}
                        alt={`${hit.title} - $${hit.price.toLocaleString('es-AR')}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`font-normal text-sm truncate ${
                      selectedIndex === index ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {hit.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-light text-gray-900">
                        ${hit.price.toLocaleString('es-AR')}
                      </span>
                      {hit.average_rating > 0 && (
                        <div className="flex items-center gap-0.5">
                          <span className="text-green-600 text-sm">★</span>
                          <span className="text-xs text-gray-600">{hit.average_rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    {hit.category_name && (
                      <span className="text-xs text-gray-500 mt-0.5 inline-block">
                        {hit.category_name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const SearchBar = ({ onSearch, initialValue = '' }: SearchBarProps) => {
  return (
    <InstantSearchNext
      searchClient={searchClient}
      indexName="products"
      future={{ preserveSharedStateOnUnmount: true }}
    >
      <Configure hitsPerPage={6} />
      <SearchInput onSearch={onSearch} initialValue={initialValue} />
    </InstantSearchNext>
  );
};
