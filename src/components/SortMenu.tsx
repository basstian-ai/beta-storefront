import { useRouter } from 'next/router';

const SortMenu = () => {
  const router = useRouter();
  const sort = Array.isArray(router.query.sort)
    ? router.query.sort[0]
    : (router.query.sort as string | undefined);

  const updateSort = (value: string) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, sort: value || undefined },
    }, undefined, { shallow: true });
  };

  return (
    <select
      aria-label="Sort products"
      value={sort || ''}
      onChange={(e) => updateSort(e.target.value)}
    >
      <option value="">Sort by</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="newest">Newest First</option>
    </select>
  );
};

export default SortMenu;
