'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/organisms/Header';

export default function HomePage() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <Header onSearch={handleSearch} />
      <div className="max-w-2xl mx-auto mt-16 px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">
            Encuentra lo que necesitas
          </h2>
          <p className="text-gray-600">
            Busca entre miles de productos
          </p>
        </div>
      </div>
    </>
  );
}
