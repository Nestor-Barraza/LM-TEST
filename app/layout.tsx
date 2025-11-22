import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'Mercado Libre - Compra y vende productos online',
    template: '%s | Mercado Libre',
  },
  description: 'Encuentra miles de productos en Mercado Libre. Compra y vende artículos nuevos y usados con envío gratis. La mejor experiencia de compra online.',
  keywords: ['mercado libre', 'comprar online', 'vender productos', 'e-commerce', 'tienda online', 'productos', 'ofertas'],
  authors: [{ name: 'Mercado Libre' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: '/',
    siteName: 'Mercado Libre',
    title: 'Mercado Libre - Compra y vende productos online',
    description: 'Encuentra miles de productos en Mercado Libre. Compra y vende artículos nuevos y usados con envío gratis.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Mercado Libre',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mercado Libre - Compra y vende productos online',
    description: 'Encuentra miles de productos en Mercado Libre. Compra y vende artículos nuevos y usados con envío gratis.',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#FFE600',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="canonical" href={process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased bg-[#ededed]" suppressHydrationWarning>
        <main>{children}</main>
      </body>
    </html>
  );
}
