'use client';

import Link from 'next/link';
import { SearchBar } from '@/components/molecules/SearchBar';

interface HeaderProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  showSearch?: boolean;
}

export const Header = ({ onSearch, initialQuery = '', showSearch = true }: HeaderProps) => {
  return (
    <header className="bg-ml-yellow py-3 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img
              src="/assets/Logo_ML.png"
              alt="Mercado Libre"
              className="h-9"
            />
          </Link>

          {/* Search Bar */}
          {showSearch && (
            <div className="flex-1 max-w-xl">
              <SearchBar onSearch={onSearch} initialValue={initialQuery} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
