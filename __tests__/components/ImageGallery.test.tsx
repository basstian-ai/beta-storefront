// __tests__/components/ImageGallery.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import ImageGallery from '@/components/ImageGallery';
import '@testing-library/jest-dom';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

describe('ImageGallery', () => {
  const mockImages = [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg',
  ];
  const productName = 'Test Product';

  it('renders images correctly', () => {
    render(<ImageGallery images={mockImages} productName={productName} />);

    // Check if the main image is rendered with the first image by default
    const mainImage = screen.getByAltText(`${productName} - Main view`) as HTMLImageElement;
    expect(mainImage).toBeInTheDocument();
    expect(mainImage.src).toBe(mockImages[0]);

    // Check if all thumbnails are rendered
    mockImages.forEach((src, index) => {
      expect(screen.getByAltText(`${productName} - Thumbnail ${index + 1}`)).toBeInTheDocument();
    });
  });

  it('updates the main image when a thumbnail is clicked', () => {
    render(<ImageGallery images={mockImages} productName={productName} />);

    const mainImage = screen.getByAltText(`${productName} - Main view`) as HTMLImageElement;
    const secondThumbnail = screen.getByAltText(`${productName} - Thumbnail 2`);

    fireEvent.click(secondThumbnail);

    expect(mainImage.src).toBe(mockImages[1]);
  });

  it('renders the zoom placeholder text', () => {
    render(<ImageGallery images={mockImages} productName={productName} />);
    expect(screen.getByText(/🔍 Zoom \(Hover\/Click - Placeholder\)/i)).toBeInTheDocument();
  });

  it('renders a placeholder if no images are provided', () => {
    render(<ImageGallery images={[]} productName={productName} />);
    const placeholderImage = screen.getByAltText('No image available') as HTMLImageElement;
    expect(placeholderImage).toBeInTheDocument();
    expect(placeholderImage.src).toContain('/placeholder.png'); // Assuming next/image mock handles this
    expect(screen.getByText('Zoom (placeholder)')).toBeInTheDocument(); // Simpler text for this case
  });

  it('selects the first image by default', () => {
    render(<ImageGallery images={mockImages} productName={productName} />);
    const mainImage = screen.getByAltText(`${productName} - Main view`) as HTMLImageElement;
    expect(mainImage.src).toBe(mockImages[0]);
  });
});
