import { generateProductJsonLd } from '@/lib/jsonLd';
import type { Product, Variant } from '@/types';

const mockProduct: Product = {
  id: 'prod123',
  name: 'Awesome Gadget',
  slug: 'awesome-gadget',
  price: 99.99,
  imageUrl: '/images/gadget.jpg',
  createdAt: '2023-01-01T00:00:00Z',
  images: [{ src: '/images/gadget-main.jpg', alt: 'Main view' }, { src: '/images/gadget-angle.jpg', alt: 'Angle view' }],
  specifications: [{ name: 'Color', value: 'Black' }],
};

const mockVariant1: Variant = {
  id: 'var1',
  name: 'Red Edition',
  sku: 'AG-RED-ED',
  attributes: { color: 'Red' },
  imageUrl: '/images/gadget-red.jpg',
};

const mockVariant2: Variant = {
  id: 'var2',
  name: 'Blue Edition, Large',
  sku: 'AG-BLU-LG',
  attributes: { color: 'Blue', size: 'Large' },
  // No imageUrl, should fallback to product's
};


describe('generateProductJsonLd', () => {
  const defaultDisplayPrice = 99.99;

  test('generates correct basic structure with a product only', () => {
    const jsonLd = generateProductJsonLd({ product: mockProduct, displayPrice: defaultDisplayPrice });
    expect(jsonLd).toMatchObject({
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: mockProduct.name,
      sku: mockProduct.id, // Fallback SKU
      mpn: mockProduct.id,
      description: mockProduct.name, // Default description
      brand: { '@type': 'Brand', name: 'OurBrand' },
      image: [mockProduct.images![0].src], // First image from product.images
      offers: {
        '@type': 'Offer',
        price: defaultDisplayPrice.toFixed(2),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
    });
  });

  test('prioritizes variant name, sku, and image when selectedVariant is provided', () => {
    const jsonLd = generateProductJsonLd({ product: mockProduct, selectedVariant: mockVariant1, displayPrice: defaultDisplayPrice });
    expect(jsonLd).toMatchObject({
      name: `${mockProduct.name} - ${mockVariant1.name}`,
      sku: mockVariant1.sku,
      mpn: mockVariant1.sku,
      image: [mockVariant1.imageUrl!],
      description: `${mockProduct.name} - ${mockVariant1.name}`,
    });
  });

  test('falls back to product image if variant imageUrl is missing', () => {
    const jsonLd = generateProductJsonLd({ product: mockProduct, selectedVariant: mockVariant2, displayPrice: defaultDisplayPrice });
    expect(jsonLd).toMatchObject({
      name: `${mockProduct.name} - ${mockVariant2.name}`,
      sku: mockVariant2.sku,
      image: [mockProduct.images![0].src], // Fallback to product image
    });
  });

  test('uses product imageUrl if product.images is empty or undefined', () => {
    const productWithoutImagesArray = { ...mockProduct, images: [] };
    const jsonLd = generateProductJsonLd({ product: productWithoutImagesArray, displayPrice: defaultDisplayPrice });
    expect(jsonLd).toMatchObject({
      image: [mockProduct.imageUrl],
    });

    const productWithUndefinedImagesArray = { ...mockProduct, images: undefined };
    const jsonLd2 = generateProductJsonLd({ product: productWithUndefinedImagesArray, displayPrice: defaultDisplayPrice });
    expect(jsonLd2).toMatchObject({
      image: [mockProduct.imageUrl],
    });
  });


  test('correctly includes brand and description', () => {
    const customBrand = 'TestBrand';
    const jsonLd = generateProductJsonLd({ product: mockProduct, displayPrice: defaultDisplayPrice, brandName: customBrand });
    expect(jsonLd).toMatchObject({
      brand: { '@type': 'Brand', name: customBrand },
      description: mockProduct.name, // As per current getDescription logic
    });
  });

  test('correctly formats the offers object with passed displayPrice and currency', () => {
    const specificPrice = 123.45;
    const specificCurrency = 'EUR';
    const jsonLd = generateProductJsonLd({ product: mockProduct, displayPrice: specificPrice, currency: specificCurrency });
    expect(jsonLd).toMatchObject({
      offers: {
        '@type': 'Offer',
        price: specificPrice.toFixed(2),
        priceCurrency: specificCurrency,
        availability: 'https://schema.org/InStock',
      },
    });
  });

  test('handles selectedVariant being null or undefined correctly (falls back to product)', () => {
    const jsonLdNull = generateProductJsonLd({ product: mockProduct, selectedVariant: null, displayPrice: defaultDisplayPrice });
    expect(jsonLdNull).toMatchObject({
      name: mockProduct.name,
      sku: mockProduct.id,
      image: [mockProduct.images![0].src],
    });

    const jsonLdUndefined = generateProductJsonLd({ product: mockProduct, selectedVariant: undefined, displayPrice: defaultDisplayPrice });
    expect(jsonLdUndefined).toMatchObject({
      name: mockProduct.name,
      sku: mockProduct.id,
      image: [mockProduct.images![0].src],
    });
  });

  test('does not include image field in JSON-LD if no image is available', () => {
    const productWithoutAnyImage = {
        ...mockProduct,
        imageUrl: undefined as any, // Type hack for testing
        images: []
    };
    const jsonLd = generateProductJsonLd({ product: productWithoutAnyImage, displayPrice: defaultDisplayPrice });
    expect(jsonLd.hasOwnProperty('image')).toBe(false);
  });

  test('includes product URL in offers if window is defined', () => {
    // Mock window object for this test
    global.window = { location: { href: 'http://localhost/test-product' } } as any;
    const jsonLd = generateProductJsonLd({ product: mockProduct, displayPrice: defaultDisplayPrice });
    expect(jsonLd).toMatchObject({
      offers: {
        url: 'http://localhost/test-product',
      },
    });
    // Clean up mock
    // @ts-ignore
    delete global.window;
  });

  test('does not include product URL in offers if window is undefined', () => {
    // Ensure window is undefined (it should be by default in Node test env unless mocked)
    const jsonLd = generateProductJsonLd({ product: mockProduct, displayPrice: defaultDisplayPrice });
     // Check if offers.url is undefined or not present
    const offers = (jsonLd as any).offers;
    expect(offers.url).toBeUndefined();
  });
});
