export function applyB2BPrice(price: number, role?: string): number {
  if (role === 'b2b') {
    return parseFloat((price * 0.9).toFixed(2));
  }
  return price;
}
