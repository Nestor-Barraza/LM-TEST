import type { Metadata } from 'next';
import { HomeClient } from './HomeClient';

export const metadata: Metadata = {
  title: 'Inicio',
  description: 'Encuentra miles de productos en Mercado Libre. Compra y vende artículos nuevos y usados con envío gratis. La mejor experiencia de compra online.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Mercado Libre - Compra y vende productos online',
    description: 'Encuentra miles de productos en Mercado Libre. Compra y vende artículos nuevos y usados con envío gratis.',
    url: '/',
    type: 'website',
  },
};

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Mercado Libre',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
