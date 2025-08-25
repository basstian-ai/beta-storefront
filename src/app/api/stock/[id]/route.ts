import { NextResponse } from 'next/server';
import mockData from '@root/data/mockStoreStock.json';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const stockApi = process.env.STOCK_API_URL;
  if (stockApi) {
    try {
      const res = await fetch(`${stockApi}/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch (err) {
      console.error('Failed to fetch stock data', err);
    }
  }
  // Fallback to mock data
  return NextResponse.json(mockData);
}
