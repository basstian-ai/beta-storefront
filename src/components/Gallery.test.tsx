import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Gallery from './Gallery';

vi.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: any) => <img {...props} alt={props.alt || ''} />,
}));

describe('Gallery component', () => {
  it('renders images using next/image', () => {
    const { container } = render(
      <Gallery title="Test" images={["/img1.jpg", "/img2.jpg"]} />
    );
    expect(container.querySelector('img')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
