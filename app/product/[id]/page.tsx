import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import sql from '@/lib/db';
import { Header } from '@/components/organisms/Header';
import { ImageWithPlaceholder } from '@/components/atoms/ImageWithPlaceholder';

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

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-6"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {product.images.length > 0 && product.images[0] ? (
                <ImageWithPlaceholder
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((image, idx) => (
                  <div key={idx} className="relative aspect-square bg-gray-100 rounded overflow-hidden">
                    <ImageWithPlaceholder
                      src={image}
                      alt={`${product.title} - imagen ${idx + 2}`}
                      fill
                      sizes="150px"
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="text-sm text-gray-500 mb-2">
                {product.condition === 'new' ? 'Nuevo' : 'Usado'} | {product.sold_quantity} vendidos
              </div>
              <h1 className="text-2xl font-normal text-gray-900 mb-4">
                {product.title}
              </h1>

              {Number(product.average_rating) > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < Math.round(Number(product.average_rating))
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {Number(product.average_rating).toFixed(1)} ({product.review_count} {product.review_count === 1 ? 'opinión' : 'opiniones'})
                  </span>
                </div>
              )}

              <div className="text-4xl font-light text-gray-900 mb-6">
                ${Number(product.price).toLocaleString('es-AR')}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-medium text-gray-900 mb-2">Stock disponible</h2>
                  <p className="text-sm text-gray-600">
                    {product.available_quantity} {product.available_quantity === 1 ? 'unidad' : 'unidades'}
                  </p>
                </div>

                {product.category_name && (
                  <div>
                    <h2 className="text-sm font-medium text-gray-900 mb-2">Categoría</h2>
                    <p className="text-sm text-blue-600">{product.category_name}</p>
                  </div>
                )}

                <button className="w-full bg-blue-600 text-white py-3 px-6 rounded hover:bg-blue-700 transition-colors font-medium">
                  Comprar ahora
                </button>

                <button className="w-full bg-blue-100 text-blue-600 py-3 px-6 rounded hover:bg-blue-200 transition-colors font-medium">
                  Agregar al carrito
                </button>
              </div>
            </div>

            {product.description && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-3">Descripción</h2>
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
