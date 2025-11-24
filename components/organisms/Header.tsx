'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { SearchBar } from '@/components/molecules/SearchBar';
import { useCartStore } from '@/store/useCartStore';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  showSearch?: boolean;
}

export const Header = ({ onSearch, initialQuery = '', showSearch = true }: HeaderProps) => {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="bg-ml-yellow sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 md:gap-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img
              src="/assets/Logo_ML.png"
              alt="Mercado Libre"
              className="h-9 sm:h-10 md:h-12 w-auto object-contain"
              style={{ maxWidth: '160px' }}
            />
          </Link>

          {/* Search Bar */}
          {showSearch && (
            <div className="flex-1 max-w-xl">
              <SearchBar onSearch={onSearch} initialValue={initialQuery} />
            </div>
          )}

          {/* Ad Banner - Desktop only */}
          <div className="hidden lg:block flex-shrink-0 ml-auto">
            <Image
              src="https://f005.backblazeb2.com/file/Mercado-libre/ads.webp"
              alt="Publicidad"
              width={320}
              height={50}
              className="h-[40px] w-auto"
              priority
            />
          </div>

          {/* Cart Icon */}
          <Link href="/cart" className="relative flex-shrink-0 ml-2 sm:ml-4 md:ml-6">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 hover:text-gray-900 transition-colors" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
