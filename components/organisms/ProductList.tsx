import { Product } from '@/types/product';
import { ProductCard } from '@/components/molecules/ProductCard';
import { EmptyState } from '@/components/molecules/EmptyState';

interface ProductListProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
}

const SkeletonCard = () => (
  <div className="bg-white rounded-lg overflow-hidden border border-gray-200 animate-pulse flex flex-col">
    {/* Image skeleton - match ProductCard aspect-square */}
    <div className="relative overflow-hidden bg-gray-200 aspect-square"></div>

    {/* Content skeleton - match ProductCard padding */}
    <div className="p-3 space-y-3">
      {/* Title lines */}
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>

      {/* Price */}
      <div className="h-6 bg-gray-300 rounded w-2/5 mt-2"></div>

      {/* Original price */}
      <div className="h-3 bg-gray-200 rounded w-1/3"></div>

      {/* Shipping */}
      <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
    </div>
  </div>
);

export const ProductList = ({
  products,
  loading = false,
  error,
}: ProductListProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error"
        message={error}
      />
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="No se encontraron resultados"
        message="Intenta buscar con otros términos"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
