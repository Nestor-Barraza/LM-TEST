import Link from 'next/link';
import { Product } from '@/types/product';
import { Price } from '@/components/atoms/Price';
import { Rating } from '@/components/atoms/Rating';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link href={`/items/${product.id}`}>
      <article className="border border-gray-300 rounded p-4 hover:shadow-md hover:border-ml-blue transition-all cursor-pointer bg-white">
        <div className="flex gap-4">
          <div className="w-44 h-44 flex-shrink-0 bg-white rounded flex items-center justify-center">
            {product.thumbnail ? (
              <img
                src={product.thumbnail}
                alt={product.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-gray-400 text-sm">Sin imagen</span>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-baseline gap-2 mt-4">
              <Price amount={product.price} currency={product.currency_id} className="text-2xl font-light" />
              {product.shipping?.free_shipping && (
                <img
                  src="/assets/ic_shipping.png"
                  alt="Envío gratis"
                  className="w-5 h-5"
                />
              )}
            </div>

            {product.installments && (
              <p className="text-sm text-green-700">
                en {product.installments.quantity}x ${Math.round(product.installments.amount).toLocaleString('es-AR')}
              </p>
            )}

            <h3 className="text-base text-gray-800 line-clamp-2">
              {product.title}
            </h3>

            {product.reviews && (
              <Rating
                rating={product.reviews.rating_average}
                total={product.reviews.total}
              />
            )}
          </div>
        </div>
      </article>
    </Link>
  );
};
