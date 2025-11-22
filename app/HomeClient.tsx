'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/organisms/Header';

export function HomeClient() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <Header onSearch={handleSearch} />
      <div className="max-w-2xl mx-auto mt-16 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Encuentra lo que necesitas
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Busca entre miles de productos nuevos y usados
          </p>
        </div>
      </div>
    </>
  );
}
