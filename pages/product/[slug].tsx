// pages/product/[slug].tsx
import Head from 'next/head'; // Import Head
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Product, ProductVariant } from '@/types'; // Import ProductVariant
import { useEffect, useState } from 'react';
import styles from '@/styles/ProductPage.module.css';
// NOTE: We will need to implement a way to fetch a single product.
// For now, we'll fetch all products and find the one that matches the slug.
// This is not efficient and should be replaced with a proper API endpoint.
import { getProducts } from '@/bff/products'; // Assuming this function can be called client-side
import ImageGallery from '@/components/ImageGallery'; // Import the ImageGallery component
import PriceDisplay from '@/components/PriceDisplay'; // Import the PriceDisplay component
import ProductSpecifications from '@/components/ProductSpecifications'; // Import the ProductSpecifications component

const ProductPage = () => {
  const router = useRouter();
  const { slug, variant: variantIdFromQuery } = router.query; // Get variantId from query

  const [baseProduct, setBaseProduct] = useState<Product | null>(null);
  // This state will hold the actual data to display (base product or selected variant)
  const [displayData, setDisplayData] = useState<Partial<Product> & { name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductAndProcessVariant = async () => {
      if (!slug) return;
      if (!router.isReady) return; // Wait for router to be ready to access query params reliably

      setIsLoading(true);
      setError(null);
      try {
        const allProductsData = await getProducts();
        const currentProduct = allProductsData.products.find((p: Product) => p.slug === slug);

        if (currentProduct) {
          setBaseProduct(currentProduct); // Store the base product

          const variantQuery = Array.isArray(variantIdFromQuery) ? variantIdFromQuery[0] : variantIdFromQuery;

          if (variantQuery && currentProduct.variants && currentProduct.variants.length > 0) {
            const selectedVariant = currentProduct.variants.find(v => v.id === variantQuery);
            if (selectedVariant) {
              // Merge variant data with base product data, variant fields take precedence
              setDisplayData({
                ...currentProduct, // Base product data as fallback
                ...selectedVariant, // Variant-specific data
                name: `${currentProduct.name} - ${selectedVariant.name}`, // Combine names
                // Ensure essential fields are present, falling back to base product if not in variant
                images: selectedVariant.images || currentProduct.images,
                price: selectedVariant.price !== undefined ? selectedVariant.price : currentProduct.price,
                specifications: selectedVariant.specifications || currentProduct.specifications,
                priceTiers: selectedVariant.priceTiers || currentProduct.priceTiers, // Prioritize variant priceTiers
                contractPrice: selectedVariant.contractPrice !== undefined ? selectedVariant.contractPrice : currentProduct.contractPrice, // Prioritize variant contractPrice
              });
            } else {
              // Variant ID in query but not found, display base product and maybe a message
              setDisplayData(currentProduct);
              // Optionally, set an error/warning that the variant was not found
              console.warn(`Variant with ID "${variantQuery}" not found for product "${currentProduct.name}". Displaying base product.`);
            }
          } else {
            // No variant in query or product has no variants, display base product
            setDisplayData(currentProduct);
          }
        } else {
          setError('Product not found.');
          setBaseProduct(null);
          setDisplayData(null);
        }
      } catch (e) {
        console.error('Failed to fetch product:', e);
        setError('Failed to load product details.');
        setBaseProduct(null);
        setDisplayData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductAndProcessVariant();
  }, [slug, variantIdFromQuery, router.isReady]); // Add variantIdFromQuery and router.isReady to dependencies

  if (isLoading) {
    return (
      <Layout categories={[]}>
        <div className={styles.container}>
          <p>Loading product details...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout categories={[]}>
        <div className={styles.container}>
          <p className={styles.error}>{error}</p>
        </div>
      </Layout>
    );
  }

  // Use displayData for rendering
  if (!displayData) {
    return (
      <Layout categories={[]}>
        <div className={styles.container}>
          {/* This message covers both product not found or displayData not being set yet after loading */}
          <p>Product details are unavailable.</p>
        </div>
      </Layout>
    );
  }

  // Ensure all necessary fields for components have fallbacks if displayData is partial
  const images = displayData.images || baseProduct?.images || [];
  const price = displayData.price !== undefined ? displayData.price : baseProduct?.price || 0;
  const priceTiers = displayData.priceTiers || baseProduct?.priceTiers || [];
  const contractPrice = displayData.contractPrice !== undefined ? displayData.contractPrice : baseProduct?.contractPrice; // Get contract price from displayData
  const specifications = displayData.specifications || baseProduct?.specifications || {};
  const productName = displayData.name; // Already combined or base name
  const productDescription = displayData.description || baseProduct?.description || '';
  const productSku = displayData.id || baseProduct?.id || ''; // Use displayData.id if available (variant id), else baseProduct.id

  // B2B User simulation
  const [isB2BUser, setIsB2BUser] = useState(false);
  const customerToken = isB2BUser ? "B2B_USER_TOKEN" : null;

  // Construct product URL for JSON-LD
  const productUrl = typeof window !== 'undefined' ? window.location.href : '';


  // Prepare JSON-LD data
  const jsonLdData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": productName,
    "description": productDescription,
    "image": images, // Already an array of strings
    "sku": productSku,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD", // Assuming USD for now
      "price": price.toFixed(2),
      "availability": "https://schema.org/InStock", // Assuming InStock for now
      "url": productUrl, // Full URL of the current page
    },
    // Potentially add more fields like brand, reviews, aggregateRating if available
  };


  return (
    <Layout categories={[]}> {/* TODO: Fetch and pass actual main navigation categories */}
      <Head>
        <title>{productName} | My E-commerce Site</title>
        <meta name="description" content={productDescription} />
        {/* Other head elements */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </Head>
      <div className={styles.container}>
        <h1 className={styles.productName}>{productName}</h1>

        <ImageGallery images={images} productName={productName} />

        {/* B2B User Simulation Checkbox */}
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
          priceTiers={priceTiers}
          contractPrice={contractPrice}
          customerToken={customerToken}
        />

        <ProductSpecifications specifications={specifications} />

        {/* Add a simple variant selector for testing (optional) */}
        {baseProduct && baseProduct.variants && baseProduct.variants.length > 0 && (
          <div className={styles.variantSelector}>
            <h4>Select Variant:</h4>
            <select
              value={Array.isArray(variantIdFromQuery) ? variantIdFromQuery[0] : variantIdFromQuery || ''}
              onChange={(e) => router.push(`/product/${slug}?variant=${e.target.value}`, undefined, { shallow: true })}
            >
              <option value="">Select a variant</option>
              {baseProduct.variants.map(v => (
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

export default ProductPage;
