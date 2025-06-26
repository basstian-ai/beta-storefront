interface OrderSummary {
  id: number;
  date: string;
  total: number;
  items: number;
}

export async function getOrderHistory(): Promise<OrderSummary[]> {
  return [
    { id: 1234, date: '2025-06-20', total: 199.99, items: 3 },
    { id: 1233, date: '2025-05-11', total: 89.5, items: 1 },
  ];
}
