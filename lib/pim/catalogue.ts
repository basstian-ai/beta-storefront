import { crystallize } from './crystallizeClient';

type ProductDTO = {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
};

export async function getProduct(slug: string): Promise<ProductDTO | null> {
  const query = `query GetProduct($path: String!) {
    catalogue(path: $path, language: "en") {
      ... on Product {
        id
        name
        path
        defaultVariant {
          price
          priceVariants {
            identifier
            price
            currency
          }
          firstImage {
            url
          }
        }
      }
    }
  }`;
  const variables = { path: `/${slug}` };
  const data = await crystallize.catalogueApi(query, variables);
  const item = data.catalogue;
  if (!item) return null;
  const variant = item.defaultVariant || {};
  const priceVariant = Array.isArray(variant.priceVariants) ? variant.priceVariants[0] : undefined;
  return {
    id: item.id,
    name: item.name,
    slug: item.path.replace(/^\//, ''),
    price: priceVariant?.price ?? variant.price ?? 0,
    imageUrl: variant.firstImage?.url ?? '',
  };
}

export async function getProductsByCategory(slug: string, first = 24, after: string | null = null): Promise<ProductDTO[]> {
  const query = `query GetProductsByCategory($topic: String!, $first: Int!, $after: String) {
    search(language: "en", filter: { topics: { include: [$topic] } }, first: $first, after: $after) {
      edges {
        node {
          ... on Product {
            id
            name
            path
            defaultVariant {
              price
              firstImage {
                url
              }
            }
          }
        }
      }
    }
  }`;
  const variables: any = { topic: `/categories/${slug}`, first };
  if (after) variables.after = after;
  const data = await crystallize.catalogueApi(query, variables);
  const edges = data.search?.edges || [];
  return edges.map((e: any) => {
    const p = e.node;
    const variant = p.defaultVariant || {};
    return {
      id: p.id,
      name: p.name,
      slug: p.path.replace(/^\//, ''),
      price: variant.price ?? 0,
      imageUrl: variant.firstImage?.url ?? '',
    };
  });
}
