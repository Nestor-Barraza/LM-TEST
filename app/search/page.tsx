import type { Metadata } from 'next';
import { SearchPageClient } from './SearchPageClient';
import { redirect } from 'next/navigation';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q || '';

  return {
    title: `${query} - Resultados de búsqueda`,
    description: `Encuentra ${query} en Mercado Libre. Descubre las mejores ofertas y productos relacionados con ${query}. Envío gratis disponible.`,
    alternates: {
      canonical: `/search?q=${encodeURIComponent(query)}`,
    },
    openGraph: {
      title: `${query} - Resultados de búsqueda | Mercado Libre`,
      description: `Encuentra ${query} en Mercado Libre. Descubre las mejores ofertas y productos relacionados con ${query}.`,
      url: `/search?q=${encodeURIComponent(query)}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${query} - Resultados de búsqueda | Mercado Libre`,
      description: `Encuentra ${query} en Mercado Libre. Descubre las mejores ofertas y productos relacionados con ${query}.`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q;

  if (!query) {
    redirect('/');
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: `Resultados de búsqueda para ${query}`,
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/search?q=${encodeURIComponent(query)}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SearchPageClient initialQuery={query} />
    </>
  );
}
