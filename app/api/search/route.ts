import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/db-queries';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  const results = await searchProducts(query);

  return NextResponse.json(results);
}
