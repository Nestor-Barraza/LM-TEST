'use client';

import { useRouter } from 'next/navigation';
import { useHits, useSearchBox, Configure, Stats, useInstantSearch } from 'react-instantsearch';
import { InstantSearchNext } from 'react-instantsearch-nextjs';
import { searchClient } from '@/lib/algolia';
import { Header } from '@/components/organisms/Header';
import Link from 'next/link';
import { useEffect } from 'react';
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
  sold_quantity: number;
}

function ProductGrid() {
  const { hits } = useHits<Hit>();
  const { status } = useInstantSearch();

  if (status === 'loading' || status === 'stalled') {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-gray-600">Buscando productos...</p>
        </div>
      </div>
    );
  }

  if (hits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No se encontraron productos</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {hits.map((hit) => (
        <Link
          key={hit.objectID}
          href={`/product/${hit.objectID}`}
          className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="relative w-full h-48 bg-gray-100">
            {hit.thumbnail ? (
              <ImageWithPlaceholder
                src={hit.thumbnail}
                alt={`${hit.title} - ${hit.condition === 'new' ? 'Nuevo' : 'Usado'} - $${hit.price.toLocaleString('es-AR')}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="text-sm text-gray-900 line-clamp-2 mb-2 min-h-[40px]">
              {hit.title}
            </h3>

            <div className="space-y-1">
              <div className="text-2xl font-light text-gray-900">
                ${hit.price.toLocaleString('es-AR')}
              </div>

              {hit.average_rating > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-green-600">★</span>
                  <span className="text-sm text-gray-600">{hit.average_rating.toFixed(1)}</span>
                </div>
              )}

              {hit.sold_quantity > 0 && (
                <p className="text-xs text-gray-500">
                  {hit.sold_quantity} vendidos
                </p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function SearchContent({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const { refine } = useSearchBox();

  useEffect(() => {
    refine(initialQuery);
  }, [initialQuery, refine]);

  const handleSearch = (newQuery: string) => {
    router.push(`/search?q=${encodeURIComponent(newQuery)}`);
  };

  return (
    <>
      <Header onSearch={handleSearch} initialQuery={initialQuery} />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Stats
            translations={{
              rootElementText({ nbHits }) {
                return `${nbHits.toLocaleString('es-AR')} resultados para "${initialQuery}"`;
              },
            }}
            classNames={{
              root: 'text-gray-600',
            }}
          />
        </div>

        <ProductGrid />
      </div>
    </>
  );
}

interface SearchPageClientProps {
  initialQuery: string;
}

export function SearchPageClient({ initialQuery }: SearchPageClientProps) {
  return (
    <InstantSearchNext
      searchClient={searchClient}
      indexName="products"
      future={{ preserveSharedStateOnUnmount: true }}
    >
      <Configure hitsPerPage={20} />
      <SearchContent initialQuery={initialQuery} />
    </InstantSearchNext>
  );
}
