import { notFound } from 'next/navigation';
import CategoryGrid from '../_components/CategoryGrid';
import { getCategories } from '@/bff/services';

export default async function CategoryPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  if (!slug) notFound();
  return <CategoryGrid slug={slug} />;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}
