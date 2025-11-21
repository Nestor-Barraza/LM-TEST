import { Product } from '@/types/product';
import { ProductCard } from '@/components/molecules/ProductCard';
import { EmptyState } from '@/components/molecules/EmptyState';
import { Spinner } from '@/components/atoms/Spinner';

interface ProductListProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
}

export const ProductList = ({
  products,
  loading = false,
  error,
}: ProductListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Spinner size="lg" />
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
    <div className="grid grid-cols-1 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
