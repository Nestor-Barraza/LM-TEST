'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/organisms/Header';
import { ProductList } from '@/components/organisms/ProductList';
import { Product } from '@/types/product';
import {
  PercentTagIcon,
  ShoppingBagIcon,
  ReceiptIcon,
  CouponIcon,
  CreditCardIcon,
  DeliveryIcon,
  StoreIcon,
  HouseIcon,
  ClockIcon,
} from '@/components/atoms/CategoryIcons';

export function HomeClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 38, seconds: 29 });
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          return { hours: 2, minutes: 38, seconds: 29 };
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/products/search');
      if (!response.ok) throw new Error('Error al cargar productos');
      const data = await response.json();
      setProducts(data.products);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar productos'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <Header onSearch={handleSearch} />
      <main className="bg-gray-50 min-h-screen">
        <div className="bg-white border-b">
          <img
            src="https://f005.backblazeb2.com/file/Mercado-libre/ads-2.webp"
            alt="Banner principal"
            className="w-full h-auto"
          />

          {/* Categories Row */}
          <div className="bg-gradient-to-b from-black to-gray-900 py-6">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center gap-6 overflow-x-auto">
                {/* Ofertas */}
                <div className="flex flex-col items-center min-w-[140px] text-center cursor-pointer hover:opacity-80 transition group">
                  <div className="bg-white rounded-xl p-4 mb-3 w-20 h-20 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all relative overflow-visible">
                    <PercentTagIcon />
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                      HASTA
                    </span>
                  </div>
                  <p className="text-yellow-400 font-bold text-xl mb-1">60% OFF</p>
                  <p className="text-white text-xs font-bold uppercase">OFERTAS</p>
                </div>

                {/* Liquidación */}
                <div className="flex flex-col items-center min-w-[140px] text-center cursor-pointer hover:opacity-80 transition group">
                  <div className="bg-white rounded-xl p-4 mb-3 w-20 h-20 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                    <ShoppingBagIcon />
                  </div>
                  <p className="text-yellow-400 font-bold text-xl mb-1">50% OFF</p>
                  <p className="text-white text-xs font-bold uppercase">LIQUIDACIÓN</p>
                </div>

                {/* Remates de Bodega */}
                <div className="flex flex-col items-center min-w-[140px] text-center cursor-pointer hover:opacity-80 transition group">
                  <div className="bg-white rounded-xl p-4 mb-3 w-20 h-20 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all relative overflow-visible">
                    <ReceiptIcon />
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                      HASTA
                    </span>
                  </div>
                  <p className="text-yellow-400 font-bold text-xl mb-1">50% OFF</p>
                  <p className="text-white text-xs font-bold uppercase leading-tight">
                    REMATES DE<br />BODEGA
                  </p>
                </div>

                {/* Cupones */}
                <div className="flex flex-col items-center min-w-[140px] text-center cursor-pointer hover:opacity-80 transition group">
                  <div className="bg-white rounded-xl p-4 mb-3 w-20 h-20 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                    <CouponIcon />
                  </div>
                  <p className="text-yellow-400 font-bold text-xl mb-1">CUPONES</p>
                  <p className="text-white text-xs font-bold uppercase leading-tight">
                    EXTRA<br />DESCUENTOS
                  </p>
                </div>

                {/* Cuotas */}
                <div className="flex flex-col items-center min-w-[140px] text-center cursor-pointer hover:opacity-80 transition group">
                  <div className="bg-white rounded-xl p-4 mb-3 w-20 h-20 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                    <CreditCardIcon />
                  </div>
                  <p className="text-yellow-400 font-bold text-xl mb-1">CUOTAS</p>
                  <p className="text-white text-xs font-bold uppercase leading-tight">
                    PAGA A 0%<br />INTERÉS
                  </p>
                </div>

                {/* Te llegan mañana */}
                <div className="flex flex-col items-center min-w-[140px] text-center cursor-pointer hover:opacity-80 transition group">
                  <div className="bg-white rounded-xl p-4 mb-3 w-20 h-20 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all relative overflow-visible">
                    <DeliveryIcon />
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                      HASTA
                    </span>
                  </div>
                  <p className="text-yellow-400 font-bold text-xl mb-1">50% OFF</p>
                  <p className="text-white text-xs font-bold uppercase leading-tight">
                    TE LLEGAN<br />MAÑANA
                  </p>
                </div>

                {/* Nuevas Marcas */}
                <div className="flex flex-col items-center min-w-[140px] text-center cursor-pointer hover:opacity-80 transition group">
                  <div className="bg-white rounded-xl p-4 mb-3 w-20 h-20 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                    <StoreIcon />
                  </div>
                  <p className="text-yellow-400 font-bold text-xl mb-1">20% OFF</p>
                  <p className="text-white text-xs font-bold uppercase">NUEVAS MARCAS</p>
                </div>

                {/* Inmuebles */}
                <div className="flex flex-col items-center min-w-[140px] text-center cursor-pointer hover:opacity-80 transition group">
                  <div className="bg-white rounded-xl p-4 mb-3 w-20 h-20 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                    <HouseIcon />
                  </div>
                  <p className="text-yellow-400 font-bold text-xl mb-1">INMUEBLES</p>
                  <p className="text-white text-xs font-bold uppercase leading-tight">
                    COMPRA, VENDE<br />O ARRIENDA
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timer Section */}
          <div style={{ background: 'linear-gradient(90deg, #2a2a2a 0%, #404040 100%)' }} className="py-4">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center gap-4">
                <span className="text-white font-black text-2xl tracking-wider">APROVECHA</span>
                <div className="flex gap-2 items-center">
                  <div className="bg-black text-white font-black text-2xl px-4 py-2 rounded-lg min-w-[60px] text-center shadow-xl">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <span className="text-white font-black text-2xl">:</span>
                  <div className="bg-black text-white font-black text-2xl px-4 py-2 rounded-lg min-w-[60px] text-center shadow-xl">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <span className="text-white font-black text-2xl">:</span>
                  <div className="bg-black text-white font-black text-2xl px-4 py-2 rounded-lg min-w-[60px] text-center shadow-xl">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Banner - Ofertón de fin de semana */}
          <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }} className="py-12">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                {/* Left side - Ofertón text */}
                <div className="flex-1 text-center md:text-left">
                  <div className="mb-2">
                    <span className="text-white font-black text-3xl tracking-wide">BLACK </span>
                    <span className="text-yellow-400 font-black text-3xl tracking-wide">FRIDAY</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start mb-2">
                    <span className="text-white font-black text-5xl md:text-6xl tracking-tight">OFERT</span>
                    <ClockIcon />
                    <span className="text-white font-black text-5xl md:text-6xl tracking-tight">N DE</span>
                  </div>
                  <h3 className="text-white font-black text-5xl md:text-6xl tracking-tight">FIN DE SEMANA</h3>
                </div>

                {/* Right side - Discount code */}
                <div className="flex-shrink-0">
                  <div className="bg-white rounded-xl p-8 text-center shadow-2xl relative">
                    <div className="mb-3">
                      <span className="text-6xl font-black">10%</span>
                      <span className="text-3xl font-black ml-2">OFF</span>
                    </div>
                    <p className="text-lg font-bold mb-4">ADICIONAL</p>
                    <div className="bg-yellow-400 text-black font-bold py-3 px-6 rounded-full mb-4 inline-block">
                      Compra mínima <span className="font-black">$200.000</span>
                    </div>
                    <div className="bg-gray-100 py-3 px-6 rounded-lg inline-block">
                      <span className="text-base font-bold">Código: </span>
                      <span className="font-black text-xl">FINDE10</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Productos destacados
              </h2>
            </div>

            <ProductList products={products} loading={loading} error={error} />
          </div>
        </div>

        <section className="bg-blue-50 py-12 text-center">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              ¿Qué estás buscando?
            </h3>
            <p className="text-gray-600 mb-6">
              Usa la barra de búsqueda para encontrar exactamente lo que
              necesitas
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-medium text-primary">
              <button onClick={() => router.push('/search?q=electrónica')} className="hover:underline cursor-pointer">
                Electrónica
              </button>
              <button onClick={() => router.push('/search?q=hogar')} className="hover:underline cursor-pointer">
                Hogar
              </button>
              <button onClick={() => router.push('/search?q=audio')} className="hover:underline cursor-pointer">
                Audio
              </button>
              <button onClick={() => router.push('/search?q=gaming')} className="hover:underline cursor-pointer">
                Gaming
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
