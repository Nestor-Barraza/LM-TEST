'use client';

import { useRouter } from 'next/navigation';
import { SearchResponse } from '@/types/product';
import { Header } from '@/components/organisms/Header';
import { ProductList } from '@/components/organisms/ProductList';

interface SearchPageTemplateProps {
  data: SearchResponse;
  query: string;
}

export const SearchPageTemplate = ({ data, query }: SearchPageTemplateProps) => {
  const router = useRouter();

  const handleSearch = (newQuery: string) => {
    router.push(`/search?q=${encodeURIComponent(newQuery)}`);
  };

  return (
    <>
      <Header onSearch={handleSearch} initialQuery={query} />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <p className="text-gray-600">
            {data.paging.total} resultados para &quot;{query}&quot;
          </p>
        </div>

        <ProductList products={data.results} />
      </div>
    </>
  );
};
