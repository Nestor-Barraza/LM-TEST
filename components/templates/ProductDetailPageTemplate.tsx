'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProductDetail as ProductDetailType } from '@/types/product';
import { Header } from '@/components/organisms/Header';
import { ProductDetail } from '@/components/organisms/ProductDetail';

interface ProductDetailPageTemplateProps {
  product: ProductDetailType;
}

export const ProductDetailPageTemplate = ({ product }: ProductDetailPageTemplateProps) => {
  const router = useRouter();

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <Header onSearch={handleSearch} />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4">
          <Link
            href="/"
            className="text-ml-blue hover:underline inline-flex items-center gap-1"
          >
            ← Volver a la búsqueda
          </Link>
        </div>
        <ProductDetail product={product} />
      </div>
    </>
  );
};
