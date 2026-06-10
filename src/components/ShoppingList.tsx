import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { getLowStockMedicines, Medicine } from '../lib/inventory';

interface ShoppingListProps {
  inventoryId: string;
}

const statusColors = {
  CRITICAL: 'border-red-500 text-rose-300',
  LOW: 'border-amber-500 text-amber-300',
  OK: 'border-emerald-500 text-emerald-300',
};

const ShoppingList: React.FC<ShoppingListProps> = ({ inventoryId }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLowStockMedicines();
  }, [inventoryId]);

  const loadLowStockMedicines = async () => {
    try {
      setLoading(true);
      const data = await getLowStockMedicines(inventoryId);
      setMedicines(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shopping list');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="rounded-[1.75rem] border border-slate-700/50 bg-slate-900/80 p-6 text-center text-slate-400 shadow-xl shadow-slate-950/10">Loading shopping list...</div>;
  }

  return (
<div className="space-y-4 rounded-[2rem] border border-slate-700/50 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/10">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="text-cyan-400" size={24} />
          <h2 className="text-2xl font-bold text-slate-100">Shopping List</h2>
        </div>
        <p className="text-sm text-slate-400">Stock alerts for items that need replenishing.</p>
      </div>

      {error && (
        <div className="bg-rose-950 border border-rose-600 text-rose-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {medicines.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <p className="text-lg font-medium">All medicines are in stock! ✓</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {medicines.map(medicine => (
            <div
              key={medicine.id}
              className={`relative overflow-hidden rounded-[1.5rem] border border-slate-700/40 bg-slate-950/90 p-4 shadow-[0_24px_60px_-40px_rgba(14,165,233,0.35)] ${statusColors[medicine.status || 'LOW']}`}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 opacity-30"></div>
              <div className="flex justify-between items-start relative">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">{medicine.name}</h3>
                  <p className="text-sm mt-1 text-slate-300">
                    Category: {medicine.category} | Current: {medicine.quantity} | Needed: {medicine.threshold}
                  </p>
                  {medicine.status === 'CRITICAL' && (
                    <p className="text-sm font-bold text-red-400 mt-1 animate-pulse">
                      ⚠️ Out of stock - needs immediate replenishment
                    </p>
                  )}
                </div>
                <span className="bg-slate-950 px-3 py-1 rounded font-semibold text-slate-100">
                  {medicine.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-[1.75rem] border border-slate-700/50 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/10">
        <p className="text-sm text-slate-300">
          <strong>Legend:</strong> Items on this list have quantity below or equal to their threshold.
          <br />
          <strong className="text-rose-300">CRITICAL</strong> = Quantity is 0
          <br />
          <strong className="text-amber-300">LOW</strong> = Quantity ≤ Threshold
        </p>
      </div>
    </div>
  );
};

export default ShoppingList;
