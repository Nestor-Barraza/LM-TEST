import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { Product } from '@/types/product';

export async function GET() {
  try {
    const products = await sql`
      SELECT
        p.id,
        p.title,
        p.price,
        p.currency,
        p.condition,
        p.available_quantity,
        COALESCE(
          (SELECT url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1),
          NULL
        ) as thumbnail
      FROM products p
      WHERE p.is_active = true AND p.featured = true
      ORDER BY p.sold_quantity DESC
      LIMIT 12
    `;

    const formattedProducts: Product[] = products.map((p) => ({
      id: p.id,
      title: p.title,
      price: Number(p.price),
      currency_id: p.currency,
      condition: p.condition as 'new' | 'used',
      available_quantity: p.available_quantity,
      thumbnail: p.thumbnail,
    }));

    return NextResponse.json({ products: formattedProducts });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error al cargar productos' },
      { status: 500 }
    );
  }
}
