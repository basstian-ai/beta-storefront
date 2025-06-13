// pages/product/[slug].tsx
import Head from 'next/head'; // Import Head
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Product, ProductVariant, ProductApiResponse, PriceTier } from '@/types'; // Add ProductApiResponse, PriceTier
import { useEffect, useState } from 'react';
import styles from '@/styles/ProductPage.module.css';
// getProducts will be used in getServerSideProps, so no longer imported directly for client-side use here.
// import { getProducts } from '@/bff/products';
import ImageGallery from '@/components/ImageGallery';
import PriceDisplay from '@/components/PriceDisplay';
import ProductSpecifications from '@/components/ProductSpecifications';
import { GetServerSideProps } from 'next';

// Define ProductPageProps
interface ProductPageProps {
  product: Product | null; // Product can be null if not found or error
  error?: string; // Optional error message from server-side
}

const ProductPage: React.FC<ProductPageProps> = ({ product: initialProduct, error: serverError }) => {
  const router = useRouter();
  // slug from router.query might be undefined initially on client if page is statically optimized or fallback.
  // however, for getServerSideProps, slug is guaranteed via context.params
  const { slug: querySlug, variant: variantIdFromQuery } = router.query;

  // Initialize baseProduct from props. This is the product fetched server-side.
  const [baseProduct, setBaseProduct] = useState<Product | null>(initialProduct);
  // displayData will hold the data for the currently displayed product/variant
  const [displayData, setDisplayData] = useState<Partial<Product> & { name: string } | null>(null);
  // Client-side error state for issues after initial load (e.g., variant not found)
  const [clientError, setClientError] = useState<string | null>(serverError || null);

  // B2B User simulation
  const [isB2BUser, setIsB2BUser] = useState(false);
  const customerToken = isB2BUser ? "B2B_USER_TOKEN" : null;

  useEffect(() => {
    // This effect now primarily handles variant selection based on query params
    // or setting initial displayData from baseProduct.
    // It also handles the case where initialProduct itself might change (e.g. due to router.replace with new props)
    if (!initialProduct && serverError) { // If initialProduct was null due to server error
        setDisplayData(null);
        setBaseProduct(null); // Ensure baseProduct is also null
        setClientError(serverError); // clientError is already set from serverError initially
        return;
    }

    if (!initialProduct && !serverError) { // Product genuinely not found by getServerSideProps without an error
        setDisplayData(null);
        setBaseProduct(null);
        setClientError("Product not found."); // This case should be handled by notFound: true in getServerSideProps
        return;
    }

    // If initialProduct has changed, update baseProduct state
    if (initialProduct && initialProduct.id !== baseProduct?.id) {
        setBaseProduct(initialProduct);
    }


    if (baseProduct) {
      // router.isReady ensures that router.query is fully populated client-side
      if (!router.isReady && querySlug) {
        // If router not ready but we have a slug (from initial props), we can proceed
        // or wait. For now, let's proceed if baseProduct is available.
      }

      const variantQuery = Array.isArray(variantIdFromQuery) ? variantIdFromQuery[0] : variantIdFromQuery;

      if (variantQuery && baseProduct.variants && baseProduct.variants.length > 0) {
        const selectedVariant = baseProduct.variants.find(v => v.id === variantQuery);
        if (selectedVariant) {
          setDisplayData({
            ...baseProduct,
            ...selectedVariant,
            name: `${baseProduct.name} - ${selectedVariant.name}`,
            images: selectedVariant.images || baseProduct.images,
            price: selectedVariant.price !== undefined ? selectedVariant.price : baseProduct.price,
            description: selectedVariant.description || baseProduct.description,
            specifications: selectedVariant.specifications || baseProduct.specifications,
            priceTiers: selectedVariant.priceTiers || baseProduct.priceTiers,
            contractPrice: (selectedVariant.contractPrice !== undefined && selectedVariant.contractPrice !== null) ? selectedVariant.contractPrice : baseProduct.contractPrice,
            id: selectedVariant.id, // Ensure variant ID is used for SKU etc.
          });
          setClientError(null); // Clear previous client errors if variant is found
        } else {
          // Variant ID in query but not found
          setDisplayData(baseProduct); // Fallback to base product
          console.warn(`Variant with ID "${variantQuery}" not found for product "${baseProduct.name}". Displaying base product.`);
          // setClientError(`Variant "${variantQuery}" not found. Displaying base product.`); // Optional: inform user
        }
      } else {
        // No variant in query, or product has no variants, display base product
        setDisplayData(baseProduct);
        setClientError(null); // Clear previous client errors
      }
    }
  }, [baseProduct, variantIdFromQuery, router.isReady, serverError, initialProduct, querySlug]);


  // Handle global loading/error states based on props from getServerSideProps first
  if (serverError && !initialProduct) { // If getServerSideProps returned an error
    return (
      <Layout categories={[]}>
        <div className={styles.container}>
          <p className={styles.error}>{serverError}</p>
        </div>
      </Layout>
    );
  }

  // This case should ideally be caught by `notFound: true` in getServerSideProps,
  // leading to a 404 page by Next.js.
  if (!initialProduct && !serverError && !clientError) { // If product is null, no server error, and no client error yet
     return (
        <Layout categories={[]}>
            <div className={styles.container}>
                <p>Product not found.</p>
            </div>
        </Layout>
    );
  }

  // If there's a client-side error to show (e.g. variant not found, or if initial error wasn't caught above)
  if (clientError && !displayData) { // Check !displayData to avoid showing error if data is already being shown
      return (
          <Layout categories={[]}>
              <div className={styles.container}>
                  <p className={styles.error}>{clientError}</p>
              </div>
          </Layout>
      );
  }

  // If, after all checks, displayData is still null (e.g. product was found, but then variant logic failed silently)
  // This is a fallback. Should ideally not be reached if initialProduct is valid.
  if (!displayData) {
    return (
        <Layout categories={[]}>
            <div className={styles.container}>
                {/* This could be a brief "Loading variant..." or similar if initialProduct exists */}
                <p>Product details are currently processing or unavailable.</p>
            </div>
        </Layout>
    );
  }

  // Ensure all necessary fields for components have fallbacks if displayData is partial
  // These should now reliably come from displayData which has merged baseProduct fields
  const images = displayData.images || []; // Default to empty array if somehow still undefined
  const price = displayData.price || 0;
  const priceTiers = displayData.priceTiers || [];
  const contractPrice = displayData.contractPrice; // Can be null or undefined
  const specifications = displayData.specifications || {};
  const productName = displayData.name;
  const productDescription = displayData.description || '';
  const productSku = displayData.id || ''; // displayData should have an id (either base or variant)

  // Construct product URL for JSON-LD
  // For SSR, router.asPath might be more reliable if window is not available, but this runs client-side for JSON-LD too.
  const productUrl = typeof window !== 'undefined' ? window.location.href : (initialProduct ? `/product/${initialProduct.slug}` : '');


  // Prepare JSON-LD data
  const jsonLdData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": productName,
    "description": productDescription,
    "image": images,
    "sku": productSku,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": price.toFixed(2),
      "availability": "https://schema.org/InStock",
      "url": productUrl,
    },
  };

  return (
    <Layout categories={[]}>
      <Head>
        <title>{productName} | My E-commerce Site</title>
        <meta name="description" content={productDescription} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </Head>
      <div className={styles.container}>
        <h1 className={styles.productName}>{productName}</h1>

        <ImageGallery images={images} productName={productName} />

        <div className={styles.b2bToggle}>
          <label>
            <input
              type="checkbox"
              checked={isB2BUser}
              onChange={(e) => setIsB2BUser(e.target.checked)}
            />
            Simulate B2B User Session (View Contract Price)
          </label>
        </div>

        <PriceDisplay
          price={price}
          priceTiers={priceTiers as PriceTier[]} // Cast as PriceTier[] as displayData.priceTiers might be generic
          contractPrice={contractPrice}
          customerToken={customerToken}
        />

        <ProductSpecifications specifications={specifications} />

        {initialProduct && initialProduct.variants && initialProduct.variants.length > 0 && (
          <div className={styles.variantSelector}>
            <h4>Select Variant:</h4>
            <select
              value={Array.isArray(variantIdFromQuery) ? variantIdFromQuery[0] : variantIdFromQuery || ''}
              onChange={(e) => router.push(`/product/${initialProduct.slug}?variant=${e.target.value}`, undefined, { shallow: true })}
            >
              <option value="">Select a variant</option>
              {initialProduct.variants.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
        )}

        <button className={styles.addToCartButton}>Add to Cart</button>
      </div>
    </Layout>
  );
};

// Import getProducts for getServerSideProps
// This ensures it's tree-shaken from client bundle if only used here.
import { getProducts } from '@/bff/products';

export const getServerSideProps: GetServerSideProps<ProductPageProps> = async (context) => {
  const { slug } = context.params || {};
  // const { variant: variantIdFromQuery } = context.query; // Can also get variant here

  if (typeof slug !== 'string') {
    return { notFound: true }; // Or handle as an error
  }

  try {
    // The getProducts call is now server-side only
    const allProductsData: ProductApiResponse = await getProducts();
    const product = allProductsData.products.find((p: Product) => p.slug === slug);

    if (!product) {
      return { notFound: true };
    }

    // Optionally, resolve initial variant here if variantIdFromQuery is used
    // For simplicity, current plan keeps variant resolution client-side for now

    return { props: { product, error: null } }; // Ensure error is explicitly null if no error
  } catch (e) {
    const error = e as Error;
    console.error('Failed to fetch product in getServerSideProps:', error.message);
    // Pass an error message to the page component
    return { props: { product: null, error: 'Failed to load product details from server.' } };
  }
};

export default ProductPage;
