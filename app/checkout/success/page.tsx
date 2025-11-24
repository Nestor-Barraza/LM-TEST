'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/organisms/Header';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <Header onSearch={handleSearch} />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg p-12 text-center">
            <CheckCircle size={80} className="mx-auto mb-6 text-green-500" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              ¡Compra exitosa!
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              Tu pedido ha sido procesado correctamente
            </p>
            <p className="text-gray-600 mb-8">
              Recibirás un correo electrónico con los detalles de tu compra y el seguimiento de tu envío.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Qué sigue?
              </h2>
              <ul className="text-left text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Prepararemos tu pedido en las próximas 24 horas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Recibirás un email cuando tu pedido sea enviado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Tu pedido llegará en 2-5 días hábiles</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-ml-yellow text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-yellow-400 hover:shadow-lg transition-all"
              >
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
