import Link from 'next/link';
import { Star, Truck } from 'lucide-react';
import { Product } from '@/types/product';
import { cn } from '@/lib/utils';
import { ImageWithPlaceholder } from '@/components/atoms/ImageWithPlaceholder';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const discount = product.original_price
    ? Math.round(
        ((product.original_price - product.price) / product.original_price) * 100
      )
    : 0;

  const rating = product.reviews?.rating_average || 0;
  const reviewsCount = product.reviews?.total || 0;

  return (
    <Link
      href={`/product/${product.id}`}
      className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col h-full border border-gray-200"
    >
      <div className="relative overflow-hidden bg-gray-100 aspect-square">
        {product.thumbnail ? (
          <ImageWithPlaceholder
            src={product.thumbnail}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-sm">Sin imagen</span>
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-red-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-bold">
            -{discount}%
          </div>
        )}
        {product.condition === 'new' && (
          <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-blue-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-bold">
            Nuevo
          </div>
        )}
      </div>

      <div className="p-2.5 sm:p-3 md:p-4 flex-1 flex flex-col">
        <h3 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 mb-2">
          {product.title}
        </h3>

        {reviewsCount > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-3 h-3 sm:w-3.5 sm:h-3.5 transition-colors',
                    i < Math.floor(rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] sm:text-xs text-gray-600">({reviewsCount})</span>
          </div>
        )}

        <div className="mb-2">
          <div className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
            ${product.price.toLocaleString('es-AR')}
          </div>
          {product.original_price && (
            <div className="text-[10px] sm:text-xs text-gray-500 line-through">
              ${product.original_price.toLocaleString('es-AR')}
            </div>
          )}
        </div>

        {product.shipping?.free_shipping && (
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-green-700 font-medium">
            <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            Envío gratis
          </div>
        )}
      </div>
    </Link>
  );
};
