import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head'; // Import Head
import Layout from '@/components/Layout';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import ImageGallery from '@/components/ImageGallery';
import { fetchCategories, fetchProductById } from '@/lib/api';
import { generateProductJsonLd } from '@/lib/jsonLd'; // Import JSON-LD generator
import type { Category, Product, Variant } from '@/types';

interface ProductPageProps {
  categories: Category[];
  product: Product;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.params ?? {};
  let categories: Category[] = [];
  let product: Product | null = null;

  try {
    categories = await fetchCategories();
    if (typeof id === 'string') {
      product = await fetchProductById(id);
    }
  } catch (error) {
    console.error('Error loading product page:', error);
  }

  if (!product) {
    return { notFound: true };
  }

  return { props: { categories, product } };
}

export default function ProductPage({ categories, product }: ProductPageProps) {
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  const isB2BUser = true; // Simulate B2B user session
  const showContractPrice = isB2BUser && typeof product.contractPrice === 'number';

  // Effect to initialize selected variant from URL or default
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const { variantId } = router.query;
      if (variantId) {
        const foundVariant = product.variants.find(v => v.id === variantId);
        setSelectedVariant(foundVariant || product.variants[0]); // Fallback to first if ID is invalid
      } else {
        setSelectedVariant(product.variants[0]); // Default to the first variant
      }
    }
  }, [router.query, product.variants]);

  const handleVariantSelect = (variant: Variant) => {
    setSelectedVariant(variant);
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, variantId: variant.id },
      },
      undefined,
      { shallow: true }
    );
  };

  // Determine images for the gallery
  let imagesForGallery = product.images || [];
  let galleryKey = product.id; // Key for ImageGallery to force re-render if main image source changes fundamentally

  if (selectedVariant?.imageUrl) {
    imagesForGallery = [{ src: selectedVariant.imageUrl, alt: selectedVariant.name }, ...imagesForGallery];
    galleryKey = selectedVariant.id; // Change key when variant image is overriding
  } else if (selectedVariant) {
    // If variant exists but has no image, keep product images.
  }

  // Determine the display price for JSON-LD and UI
  const displayPrice = showContractPrice && product.contractPrice !== undefined
    ? product.contractPrice
    : product.price;

  // Generate JSON-LD
  const productJsonLd = generateProductJsonLd({
    product,
    selectedVariant,
    displayPrice,
    // currency: 'USD', // Already default in function
    // brandName: 'YourBrandName' // Already default in function
  });

  return (
    <Layout categories={categories}>
      <Head>
        <title>{selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name}</title>
        <meta name="description" content={selectedVariant ? `Details for ${product.name} - ${selectedVariant.name}` : `Details for ${product.name}`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      </Head>
      <BreadcrumbNav />
      {/* Basic product details container */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '1rem' }}>
        {/* Image Gallery Section */}
        <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
          {imagesForGallery.length > 0 ? (
            <ImageGallery key={galleryKey} images={imagesForGallery} defaultMainImageAlt={selectedVariant?.name || product.name} />
          ) : (
            <div style={{ width: '100%', height: '300px', background: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '8px' }}>
              No image available
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
          <h1>{product.name}</h1>
          {selectedVariant && <p style={{ fontSize: '1.1rem', color: '#555' }}>{selectedVariant.name}</p>}

          {/* Price Display Logic */}
          <div style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>
            {showContractPrice && product.contractPrice !== undefined ? (
              <>
                <p style={{ color: 'green', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>
                  Your Contract Price: ${product.contractPrice.toFixed(2)}
                </p>
                <p style={{ textDecoration: 'line-through', color: '#777', margin: 0 }}>
                  List Price: ${product.price.toFixed(2)}
                </p>
              </>
            ) : (
              <p style={{ fontWeight: 'bold', margin: 0 }}>
                Price: ${product.price ? product.price.toFixed(2) : 'N/A'}
              </p>
            )}
          </div>

          <p>ID: {product.id} {selectedVariant && `(SKU: ${selectedVariant.sku})`}</p>

          {/* Variant Selection UI */}
          {product.variants && product.variants.length > 0 && (
            <div style={{ margin: '1rem 0' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Select Variant:</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {product.variants.map(variant => (
                  <button
                    key={variant.id}
                    onClick={() => handleVariantSelect(variant)}
                    style={{
                      padding: '0.5rem 1rem',
                      border: selectedVariant?.id === variant.id ? '2px solid #007bff' : '2px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: selectedVariant?.id === variant.id ? '#e7f3ff' : '#fff',
                      fontWeight: selectedVariant?.id === variant.id ? 'bold' : 'normal',
                    }}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Specifications Section */}
          {product.specifications && product.specifications.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', borderBottom: '1px solid #eee', paddingBottom: '0.25rem' }}>Specifications</h2>
              <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
                {product.specifications.map((spec, index) => (
                  <li key={index} style={{ marginBottom: '0.5rem', display: 'flex' }}>
                    <strong style={{ marginRight: '0.5rem', width: '120px', flexShrink: 0 }}>{spec.name}:</strong>
                    <span>{spec.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Price Tiers Section - Conditionally Rendered */}
          {!showContractPrice && product.priceTiers && product.priceTiers.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', borderBottom: '1px solid #eee', paddingBottom: '0.25rem' }}>Volume Pricing</h2>
              <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
                {product.priceTiers.map((tier, index) => (
                  <li key={index} style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px solid #f9f9f9' }}>
                    <span>Quantity: {tier.quantity}+</span>
                    <strong>${tier.price.toFixed(2)} per unit</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
