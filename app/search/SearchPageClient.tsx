'use client';

import { useRouter } from 'next/navigation';
import { useHits, useSearchBox, Configure, Stats, useInstantSearch, usePagination } from 'react-instantsearch';
import { InstantSearchNext } from 'react-instantsearch-nextjs';
import { searchClient } from '@/lib/algolia';
import { Header } from '@/components/organisms/Header';
import { Breadcrumb } from '@/components/molecules/Breadcrumb';
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
    <div className="space-y-4">
      {hits.map((hit) => (
        <Link
          key={hit.objectID}
          href={`/product/${hit.objectID}`}
          className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow block"
        >
          <div className="flex gap-4 p-4">
            {/* Image - Left side */}
            <div className="relative w-40 h-40 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
              {hit.thumbnail ? (
                <ImageWithPlaceholder
                  src={hit.thumbnail}
                  alt={`${hit.title} - ${hit.condition === 'new' ? 'Nuevo' : 'Usado'} - $${hit.price.toLocaleString('es-AR')}`}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Content - Right side */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                {/* Category/Brand */}
                <p className="text-xs text-gray-500 uppercase mb-1">
                  {hit.category_name || 'PRODUCTO'}
                </p>

                {/* Title */}
                <h3 className="text-sm text-gray-900 line-clamp-2 mb-2">
                  {hit.title}
                </h3>

                {/* Price */}
                <div className="mb-2">
                  <div className="text-2xl font-light text-gray-900">
                    ${hit.price.toLocaleString('es-AR')} <span className="text-sm">COP</span>
                  </div>

                  {/* Free shipping badge */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-green-600 font-semibold">Envío gratis</span>
                  </div>
                </div>
              </div>

              {/* Rating and sold quantity */}
              <div className="flex items-center gap-4 text-sm">
                {hit.average_rating > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={i < Math.floor(hit.average_rating) ? 'text-blue-500' : 'text-gray-300'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-gray-600">({hit.average_rating.toFixed(1)})</span>
                  </div>
                )}

                {hit.sold_quantity > 0 && (
                  <span className="text-gray-500">
                    {hit.sold_quantity} vendidos
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function Pagination() {
  const {
    currentRefinement,
    nbPages,
    refine,
    canRefine,
  } = usePagination();

  if (!canRefine || nbPages <= 1) {
    return null;
  }

  const pages = [];
  const maxPagesToShow = 10;
  let startPage = Math.max(0, currentRefinement - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(nbPages - 1, startPage + maxPagesToShow - 1);

  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(0, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-8 py-4">
      {/* Previous button */}
      <button
        onClick={() => refine(currentRefinement - 1)}
        disabled={currentRefinement === 0}
        className="px-3 py-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Página anterior"
      >
        ‹
      </button>

      {/* Page numbers */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => refine(page)}
          className={`w-9 h-9 rounded ${
            currentRefinement === page
              ? 'bg-ml-blue text-white font-bold'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          {page + 1}
        </button>
      ))}

      {/* Next button */}
      <button
        onClick={() => refine(currentRefinement + 1)}
        disabled={currentRefinement >= nbPages - 1}
        className="px-3 py-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Siguiente página"
      >
        ›
      </button>
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
        <Breadcrumb
          items={[
            { label: 'Inicio', href: '/' },
            { label: initialQuery },
          ]}
        />

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
        <Pagination />
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
