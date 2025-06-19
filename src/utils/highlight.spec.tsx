import { highlight } from './highlight';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('highlight', () => {
  it('wraps term in mark element', () => {
    const { container } = render(<div>{highlight('Hello world', 'world')}</div>);
    const mark = container.querySelector('mark');
    expect(mark).not.toBeNull();
    expect(mark?.textContent).toBe('world');
  });
});
