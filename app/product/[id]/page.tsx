import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import sql from '@/lib/db';
import { Header } from '@/components/organisms/Header';
import { Breadcrumb } from '@/components/molecules/Breadcrumb';
import { ImageWithPlaceholder } from '@/components/atoms/ImageWithPlaceholder';
import { ProductClient } from './ProductClient';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  original_price?: number;
  currency: string;
  condition: string;
  available_quantity: number;
  sold_quantity: number;
  is_active: boolean;
  featured: boolean;
  category_name: string | null;
  category_slug: string | null;
  average_rating: number;
  review_count: number;
  images: string[];
}

async function getProduct(id: string): Promise<Product | null> {
  const products = await sql`
    SELECT
      p.id,
      p.title,
      p.description,
      p.price,
      p.currency,
      p.condition,
      p.available_quantity,
      p.sold_quantity,
      p.is_active,
      p.featured,
      c.name as category_name,
      c.slug as category_slug,
      COALESCE(AVG(r.rating), 0) as average_rating,
      COUNT(r.id) as review_count
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN reviews r ON p.id = r.product_id
    WHERE p.id = ${id}
    GROUP BY p.id, c.name, c.slug
  `;

  if (products.length === 0) {
    return null;
  }

  const images = await sql`
    SELECT url, is_primary
    FROM product_images
    WHERE product_id = ${id}
    ORDER BY is_primary DESC, id ASC
  `;

  return {
    ...products[0],
    images: images.map(img => img.url),
  } as Product;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Producto no encontrado',
    };
  }

  const productUrl = `/product/${id}`;
  const imageUrl = product.images[0] || '/og-image.jpg';

  return {
    title: product.title,
    description: product.description || `${product.title} - ${product.condition === 'new' ? 'Nuevo' : 'Usado'} - $${Number(product.price).toLocaleString('es-AR')} en Mercado Libre. ${product.sold_quantity} vendidos. Stock disponible: ${product.available_quantity} unidades.`,
    keywords: [
      product.title,
      product.category_name || '',
      product.condition === 'new' ? 'nuevo' : 'usado',
      'mercado libre',
      'comprar',
      'online',
    ].filter(Boolean),
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: `${product.title} | Mercado Libre`,
      description: product.description || `${product.title} - ${product.condition === 'new' ? 'Nuevo' : 'Usado'}`,
      url: productUrl,
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} | Mercado Libre`,
      description: product.description || `${product.title} - ${product.condition === 'new' ? 'Nuevo' : 'Usado'}`,
      images: [imageUrl],
    },
    robots: {
      index: product.is_active,
      follow: product.is_active,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  async function handleSearch(query: string) {
    'use server';
    redirect(`/search?q=${encodeURIComponent(query)}`);
  }

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || product.title,
    image: product.images,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/product/${id}`,
      priceCurrency: product.currency,
      price: Number(product.price),
      itemCondition: product.condition === 'new'
        ? 'https://schema.org/NewCondition'
        : 'https://schema.org/UsedCondition',
      availability: product.available_quantity > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Mercado Libre',
      },
    },
    ...(Number(product.average_rating) > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Number(product.average_rating),
        reviewCount: product.review_count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(product.category_name && {
      category: product.category_name,
    }),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      },
      ...(product.category_name ? [{
        '@type': 'ListItem',
        position: 2,
        name: product.category_name,
        item: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/category/${product.category_slug}`,
      }] : []),
      {
        '@type': 'ListItem',
        position: product.category_name ? 3 : 2,
        name: product.title,
        item: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/product/${id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header onSearch={handleSearch} />

      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Breadcrumb
            items={[
              { label: 'Inicio', href: '/' },
              ...(product.category_name ? [{
                label: product.category_name,
                href: `/search?q=${encodeURIComponent(product.category_name.toLowerCase())}`,
              }] : []),
              { label: product.title },
            ]}
          />

          <div className="bg-white rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              {/* Images Section */}
              <div>
                <div className="relative bg-white rounded-lg overflow-hidden mb-4 aspect-square border border-gray-200">
                  {product.images.length > 0 && product.images[0] ? (
                    <ImageWithPlaceholder
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-contain p-4"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {Number(product.original_price) > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-md text-sm font-bold shadow-lg">
                      -{Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100)}%
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info Section */}
              <div>
                {product.category_name && (
                  <div className="mb-3">
                    <span className="text-xs text-gray-600 uppercase tracking-wide">
                      {product.category_name}
                    </span>
                  </div>
                )}

                <h1 className="text-xl md:text-2xl font-normal text-gray-900 mb-4">
                  {product.title}
                </h1>

                {Number(product.average_rating) > 0 && (
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-base ${
                            i < Math.floor(Number(product.average_rating))
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {Number(product.average_rating).toFixed(1)} de 5 ({product.review_count.toLocaleString()} {product.review_count === 1 ? 'opinión' : 'opiniones'})
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className="text-4xl font-normal text-gray-900 mb-1">
                    ${Number(product.price).toLocaleString('es-AR')} COP
                  </div>
                  {Number(product.original_price) > 0 && (
                    <>
                      <div className="text-base text-gray-500 line-through mb-2">
                        ${Number(product.original_price).toLocaleString('es-AR')} COP
                      </div>
                      <div className="text-base text-green-600 font-medium">
                        Ahorras ${(Number(product.original_price) - Number(product.price)).toLocaleString('es-AR')} COP
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <div>
                      <p className="text-base font-medium text-gray-900">Envío gratis</p>
                      <p className="text-sm text-gray-600">Llega en 2 días hábiles</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div>
                      <p className="text-base font-medium text-gray-900">Compra protegida</p>
                      <p className="text-sm text-gray-600">Dinero de vuelta si no lo recibes</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-1">Vendedor:</p>
                  <p className="text-base font-semibold text-gray-900 mb-3">Mercado Oficial</p>
                  <Link
                    href={product.category_name ? `/search?q=${encodeURIComponent(product.category_name.toLowerCase())}` : '/'}
                    className="block w-full py-2.5 border border-ml-blue text-ml-blue rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors text-center"
                  >
                    Ver otros productos
                  </Link>
                </div>

                <ProductClient product={product} />
              </div>
            </div>

            {product.description && (
              <div className="border-t p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Descripción del producto
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
