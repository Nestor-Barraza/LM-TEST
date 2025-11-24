'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { Header } from '@/components/organisms/Header';
import { Breadcrumb } from '@/components/molecules/Breadcrumb';
import { useRouter } from 'next/navigation';

export function CartClient() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();
  const total = getTotalPrice();

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  if (items.length === 0) {
    return (
      <>
        <Header onSearch={handleSearch} />
        <main className="bg-gray-50 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <Breadcrumb
              items={[
                { label: 'Inicio', href: '/' },
                { label: 'Carrito' },
              ]}
            />
            <div className="bg-white rounded-lg p-16 text-center">
              <ShoppingBag size={80} className="mx-auto mb-6 text-gray-400" />
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Tu carrito está vacío
              </h1>
              <p className="text-gray-600 mb-8 text-lg">
                Explora nuestros productos y comienza a hacer compras
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-medium hover:shadow-lg transition-shadow text-lg"
              >
                <ArrowLeft size={24} />
                Continuar comprando
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header onSearch={handleSearch} />
      <main className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Breadcrumb
            items={[
              { label: 'Inicio', href: '/' },
              { label: 'Carrito' },
            ]}
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-8 mt-4">
            Mi carrito de compras
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-white rounded-lg p-4 flex gap-4 hover:shadow-md transition-shadow"
                  >
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={item.product.thumbnail || '/placeholder.png'}
                        alt={item.product.title}
                        fill
                        sizes="96px"
                        className="object-cover rounded-lg"
                      />
                    </div>

                    <div className="flex-1">
                      <Link
                        href={`/product/${item.product.id}`}
                        className="text-lg font-medium text-gray-900 hover:text-primary transition-colors"
                      >
                        {item.product.title}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        ${item.product.price.toLocaleString('es-AR')} c/u
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="px-3 py-1 hover:bg-gray-100 transition-colors"
                          aria-label="Disminuir cantidad"
                          type="button"
                        >
                          −
                        </button>
                        <span className="px-4 font-medium">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="px-3 py-1 hover:bg-gray-100 transition-colors"
                          aria-label="Aumentar cantidad"
                          type="button"
                        >
                          +
                        </button>
                      </div>

                      <p className="text-lg font-bold text-gray-900">
                        $
                        {(item.product.price * item.quantity).toLocaleString(
                          'es-AR'
                        )}
                      </p>

                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                        aria-label="Eliminar del carrito"
                        type="button"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={clearCart}
                className="mt-6 text-red-600 hover:text-red-700 font-medium"
                type="button"
              >
                Vaciar carrito
              </button>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Resumen de compra
                </h2>

                <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span>${total.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Envío:</span>
                    <span className="text-green-600 font-medium">Gratis</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6 text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">
                    ${total.toLocaleString('es-AR')}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold text-lg hover:shadow-lg transition-shadow mb-3 text-center"
                >
                  Proceder al pago
                </Link>

                <Link
                  href="/"
                  className="block text-center bg-ml-yellow text-gray-900 hover:bg-yellow-400 font-bold py-2 rounded-lg transition-colors"
                >
                  Continuar comprando
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
