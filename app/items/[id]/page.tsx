import { ProductDetail as ProductDetailType } from '@/types/product';
import { ProductDetailPageTemplate } from '@/components/templates/ProductDetailPageTemplate';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

async function getProductDetail(id: string): Promise<ProductDetailType | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/items/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductDetail(id);

  if (!product) {
    notFound();
  }

  return <ProductDetailPageTemplate product={product} />;
}
