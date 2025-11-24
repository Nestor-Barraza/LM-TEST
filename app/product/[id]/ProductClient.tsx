'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { Product } from '@/types/product';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProductClientProps {
  product: {
    id: string;
    title: string;
    price: number;
    currency: string;
    condition: string;
    available_quantity: number;
    images: string[];
  };
}

export function ProductClient({ product }: ProductClientProps) {
  const router = useRouter();
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);

  const cartItem = items.find((item) => item.product.id === product.id);
  const isInCart = !!cartItem;

  const cartProduct: Product = {
    id: product.id,
    title: product.title,
    price: product.price,
    currency_id: product.currency,
    condition: product.condition as 'new' | 'used',
    available_quantity: product.available_quantity,
    ...(product.images.length > 0 && { thumbnail: product.images[0] }),
  };

  const handleAddToCart = () => {
    addItem(cartProduct, quantity);
    toast.success(`${quantity} ${quantity === 1 ? 'producto agregado' : 'productos agregados'} al carrito`);
  };

  const handleIncreaseCart = () => {
    if (cartItem) {
      updateQuantity(product.id, Math.min(product.available_quantity, cartItem.quantity + 1));
    }
  };

  const handleDecreaseCart = () => {
    if (cartItem) {
      if (cartItem.quantity === 1) {
        toast('¿Estás seguro de que quieres eliminar este producto del carrito?', {
          action: {
            label: 'Sí, eliminar',
            onClick: () => {
              removeItem(product.id);
              toast.success('Producto eliminado del carrito');
            },
          },
          cancel: {
            label: 'Cancelar',
            onClick: () => {},
          },
        });
      } else {
        updateQuantity(product.id, cartItem.quantity - 1);
      }
    }
  };

  const handleBuyNow = () => {
    if (cartItem) {
      updateQuantity(product.id, cartItem.quantity + quantity);
    } else {
      addItem(cartProduct, quantity);
    }
    router.push('/checkout');
  };

  const inStock = product.available_quantity > 0;

  return (
    <div className="space-y-4">
      {!isInCart ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Cantidad:
            </label>
            <div className="flex items-center bg-white border border-gray-300 rounded-lg w-32">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-gray-50 transition-colors flex items-center justify-center"
                aria-label="Disminuir cantidad"
                type="button"
              >
                <Minus size={16} className="text-gray-600" />
              </button>
              <span className="flex-1 text-center font-medium text-gray-900">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.available_quantity, quantity + 1))}
                className="px-3 py-2 hover:bg-gray-50 transition-colors flex items-center justify-center"
                aria-label="Aumentar cantidad"
                type="button"
                disabled={quantity >= product.available_quantity}
              >
                <Plus size={16} className="text-gray-600" />
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full py-3.5 px-4 rounded-lg font-semibold text-base transition-all duration-200 bg-ml-yellow text-gray-900 hover:bg-yellow-400 shadow-sm"
            disabled={!inStock}
            type="button"
          >
            {inStock ? 'Añadir al carrito' : 'No disponible'}
          </button>
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Cantidad en el carrito:
            </label>
            <div className="flex items-center bg-white border border-gray-300 rounded-lg w-32">
              <button
                onClick={handleDecreaseCart}
                className={cn(
                  "px-3 py-2 transition-colors flex items-center justify-center",
                  cartItem.quantity === 1 ? "hover:bg-red-50" : "hover:bg-gray-50"
                )}
                aria-label={cartItem.quantity === 1 ? "Eliminar del carrito" : "Disminuir cantidad"}
                type="button"
              >
                {cartItem.quantity === 1 ? (
                  <Trash2 size={16} className="text-red-600" />
                ) : (
                  <Minus size={16} className="text-gray-600" />
                )}
              </button>
              <span className="flex-1 text-center font-medium text-gray-900">{cartItem.quantity}</span>
              <button
                onClick={handleIncreaseCart}
                className="px-3 py-2 hover:bg-gray-50 transition-colors flex items-center justify-center"
                aria-label="Aumentar cantidad"
                type="button"
                disabled={cartItem.quantity >= product.available_quantity}
              >
                <Plus size={16} className="text-gray-600" />
              </button>
            </div>
          </div>

          <button
            className="w-full py-3.5 px-4 rounded-lg font-semibold text-base transition-all duration-200 bg-green-600 text-white hover:bg-green-700 shadow-sm"
            disabled
            type="button"
          >
            ✓ En el carrito
          </button>
        </>
      )}

      <button
        onClick={handleBuyNow}
        className="w-full py-3.5 px-4 rounded-lg font-semibold text-base transition-all duration-200 bg-ml-blue text-white hover:bg-blue-700 shadow-sm"
        disabled={!inStock}
        type="button"
      >
        Comprar ahora
      </button>
    </div>
  );
}
