import { ProductDetail as ProductDetailType } from '@/types/product';
import { Price } from '@/components/atoms/Price';
import { Badge } from '@/components/atoms/Badge';
import { Rating } from '@/components/atoms/Rating';
import { Button } from '@/components/atoms/Button';

interface ProductDetailProps {
  product: ProductDetailType;
}

export const ProductDetail = ({ product }: ProductDetailProps) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        <div className="space-y-3 sm:space-y-4">
          {product.pictures && product.pictures.length > 0 ? (
            <div className="bg-gray-100 rounded-lg p-4 sm:p-6 md:p-8 flex items-center justify-center">
              <img
                src={product.pictures[0]?.url}
                alt={product.title}
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-4 sm:p-6 md:p-8 h-64 sm:h-80 md:h-96 flex items-center justify-center">
              <span className="text-gray-400">Sin imagen</span>
            </div>
          )}

          {product.pictures && product.pictures.length > 1 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {product.pictures.slice(1, 5).map((picture) => (
                <div
                  key={picture.id}
                  className="bg-gray-100 rounded-md p-1.5 sm:p-2 cursor-pointer hover:ring-2 hover:ring-ml-blue"
                >
                  <img
                    src={picture.url}
                    alt={`${product.title} ${picture.id}`}
                    className="w-full h-auto object-contain"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          <div className="space-y-2">
            {product.condition === 'new' ? (
              <Badge variant="info">Nuevo</Badge>
            ) : (
              <Badge variant="warning">Usado</Badge>
            )}

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold">
              {product.title}
            </h1>

            {product.reviews && (
              <Rating
                rating={product.reviews.rating_average}
                total={product.reviews.total}
                size="lg"
              />
            )}
          </div>

          <div className="space-y-2">
            {product.original_price && (
              <Price
                amount={product.original_price}
                currency={product.currency_id}
                className="text-base sm:text-lg line-through text-gray-500"
              />
            )}
            <Price
              amount={product.price}
              currency={product.currency_id}
              className="text-2xl sm:text-3xl md:text-4xl"
            />

            {product.installments && (
              <p className="text-green-600">
                En {product.installments.quantity}x ${Math.round(product.installments.amount).toLocaleString('es-AR')}
                {product.installments.rate === 0 && ' sin interés'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            {product.shipping?.free_shipping && (
              <div className="flex items-center gap-2 text-green-600">
                <Badge variant="success">Envío gratis</Badge>
              </div>
            )}

            {product.available_quantity !== undefined && (
              <p className="text-sm text-gray-600">
                Stock disponible: {product.available_quantity} unidades
              </p>
            )}

            {product.sold_quantity !== undefined && (
              <p className="text-sm text-gray-600">
                Vendidos: {product.sold_quantity}
              </p>
            )}
          </div>

          <Button className="w-full">
            Comprar ahora
          </Button>

          <Button variant="ghost" className="w-full">
            Agregar al carrito
          </Button>

          {product.warranty && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600">{product.warranty}</p>
            </div>
          )}

          {product.attributes && product.attributes.length > 0 && (
            <div className="border-t pt-4">
              <h2 className="font-semibold mb-2">Características</h2>
              <dl className="grid grid-cols-2 gap-2">
                {product.attributes.map((attr) => (
                  <div key={attr.id} className="text-sm">
                    <dt className="text-gray-600">{attr.name}:</dt>
                    <dd className="font-medium">{attr.value_name}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {product.description && (
        <div className="mt-8 border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">Descripción</h2>
          <p className="text-gray-700 whitespace-pre-line">
            {product.description.plain_text}
          </p>
        </div>
      )}
    </div>
  );
};
