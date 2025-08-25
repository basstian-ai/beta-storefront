'use client';

import { useState, FormEvent } from 'react';
import { getProductByIdOrSlug } from '@/bff/services';
import { useCartStore } from '@/stores/useCartStore';

interface Row {
  sku: string;
  quantity: number;
  error?: string;
}

export default function QuickOrderForm() {
  const addItem = useCartStore((state) => state.addItem);
  const setFulfillment = useCartStore((state) => state.setFulfillment);
  const [rows, setRows] = useState<Row[]>([
    { sku: '', quantity: 1 },
    { sku: '', quantity: 1 },
    { sku: '', quantity: 1 },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const handleAddRow = () => {
    setRows((prev) => [...prev, { sku: '', quantity: 1 }]);
  };

  const handleChange = (
    index: number,
    field: 'sku' | 'quantity',
    value: string
  ) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: field === 'quantity' ? Number(value) : value,
        error: undefined,
      };
      return updated;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const updatedRows = rows.map((r) => ({ ...r, error: undefined }));

    for (let i = 0; i < rows.length; i++) {
      const { sku, quantity } = rows[i];
      if (!sku) {
        updatedRows[i].error = 'SKU required';
        continue;
      }
      if (quantity <= 0) {
        updatedRows[i].error = 'Quantity must be > 0';
        continue;
      }
      try {
        const product = await getProductByIdOrSlug(sku);
        setFulfillment({ type: 'delivery' });
        addItem(product, quantity);
      } catch {
        updatedRows[i].error = 'Invalid SKU';
      }
    }

    setRows(updatedRows);
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="py-2 text-left">SKU</th>
            <th className="py-2 text-left">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b">
              <td className="py-2">
                <input
                  aria-label="SKU"
                  placeholder="SKU"
                  type="text"
                  value={row.sku}
                  onChange={(e) => handleChange(index, 'sku', e.target.value)}
                  className="border p-2 w-full"
                />
                {row.error && (
                  <p className="text-red-500 text-sm">{row.error}</p>
                )}
              </td>
              <td className="py-2">
                <input
                  aria-label="Quantity"
                  type="number"
                  min={1}
                  value={row.quantity}
                  onChange={(e) => handleChange(index, 'quantity', e.target.value)}
                  className="border p-2 w-24"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleAddRow}
          className="px-3 py-2 bg-gray-200 rounded"
        >
          Add Row
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-3 py-2 bg-blue-600 text-white rounded"
        >
          {submitting ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </form>
  );
}

