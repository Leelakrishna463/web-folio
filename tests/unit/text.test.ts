import { describe, it, expect } from 'vitest';
import { fit } from '../../src/lib/text';

describe('fit', () => {
  it('keeps the design size when the text fits', () => {
    expect(fit('[Company]', 178, 19, 0.6)).toBe(19);
  });

  it('shrinks long text so it never runs past its box', () => {
    const t = 'a-very-long-company-name-that-goes-on-and-on';
    const size = fit(t, 178, 19, 0.6);
    expect(size).toBeLessThan(19);
    expect(size * 0.6 * t.length).toBeLessThanOrEqual(178);
  });
});
