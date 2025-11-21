import { SearchPageClient } from './SearchPageClient';
import { redirect } from 'next/navigation';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q;

  if (!query) {
    redirect('/');
  }

  return <SearchPageClient initialQuery={query} />;
}
