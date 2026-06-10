import React, { useState } from 'react';
import { Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { createInventory, Inventory } from '../lib/inventory';

interface InventoryCreateProps {
  onSuccess?: () => void;
}

/**
 * InventoryCreate Component
 * Form for users to create a new inventory
 */
export function InventoryCreate({ onSuccess }: InventoryCreateProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdInventory, setCreatedInventory] = useState<Inventory | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setCreatedInventory(null);

    if (!name.trim()) {
      setError('Inventory name is required');
      return;
    }

    setLoading(true);
    try {
      const inventory = await createInventory(name.trim());
      setSuccess(true);
      setCreatedInventory(inventory);
      setName('');
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create inventory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-slate-950/95 p-6 shadow-[0_30px_80px_-40px_rgba(56,189,248,0.35)] backdrop-blur-xl">
      <div className="pointer-events-none absolute -right-10 top-6 h-28 w-28 rounded-full bg-cyan-500/10 blur-3xl"></div>
      <div className="flex items-center gap-3 mb-4">
        <Plus className="h-5 w-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-slate-100">Create New Inventory</h3>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-950/50 p-3 text-red-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && createdInventory && (
        <div className="mb-4 rounded-2xl border border-green-400/20 bg-green-950/50 p-4 text-green-300">
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <p>Inventory created successfully!</p>
          </div>
          <p className="text-sm text-slate-300">Share this invite code so collaborators can join instantly:</p>
          <code className="mt-2 block rounded-lg bg-slate-950 px-3 py-2 text-cyan-300 font-mono break-all text-sm">
            {createdInventory.invite_code}
          </code>
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="inventory-name" className="block text-sm font-medium text-slate-300 mb-2">
          Inventory Name
        </label>
        <input
          id="inventory-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Home Medicine Cabinet"
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating...' : 'Create Inventory'}
      </button>
    </form>
  );
}
