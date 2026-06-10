import React, { useState } from 'react';
import { LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import { joinInventory, joinInventoryByCode } from '../lib/inventory';

interface JoinInventoryProps {
  onSuccess?: () => void;
}

type JoinMethod = 'id' | 'code';

/**
 * JoinInventory Component
 * Form for users to join an existing inventory by ID or invite code
 */
export function JoinInventory({ onSuccess }: JoinInventoryProps) {
  const [joinMethod, setJoinMethod] = useState<JoinMethod>('code');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ message: string; inventoryName: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedInput = input.trim();
    if (!trimmedInput) {
      setError(`Inventory ${joinMethod === 'id' ? 'ID' : 'code'} is required`);
      return;
    }

    // Validation based on join method
    if (joinMethod === 'id') {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(trimmedInput)) {
        setError('Inventory ID must be a valid UUID.');
        return;
      }
    } else {
      // Invite code validation - should be 6 chars, alphanumeric
      if (!/^[A-Z0-9]{6}$/.test(trimmedInput.toUpperCase())) {
        setError('Invite code must be 6 characters (letters and numbers).');
        return;
      }
    }

    setLoading(true);
    try {
      let result;
      if (joinMethod === 'id') {
        result = await joinInventory(trimmedInput);
      } else {
        result = await joinInventoryByCode(trimmedInput.toUpperCase());
      }

      setSuccess({
        message: result.message,
        inventoryName: result.inventory_name,
      });
      setInput('');
      setTimeout(() => {
        setSuccess(null);
        onSuccess?.();
      }, 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to join inventory`;
      // Parse specific error messages
      if (message.includes('Already a member')) {
        setError('You are already a member of this inventory');
      } else if (message.includes('not found')) {
        setError(joinMethod === 'id' ? 'Inventory not found. Please check the ID.' : 'Invalid invite code.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-slate-950/95 p-6 shadow-[0_30px_80px_-40px_rgba(56,189,248,0.35)] backdrop-blur-xl">
      <div className="pointer-events-none absolute -left-10 top-6 h-24 w-24 rounded-full bg-cyan-500/10 blur-3xl"></div>
      <div className="flex items-center gap-3 mb-4">
        <LogIn className="h-5 w-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-slate-100">Join Inventory</h3>
      </div>

      <p className="text-sm text-slate-400 mb-4">
        {joinMethod === 'code'
          ? 'Enter the invite code to request access. The owner will need to approve your request.'
          : 'Enter the inventory ID to request membership. The owner will need to approve your request.'}
      </p>

      {/* Tab selector */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => {
            setJoinMethod('code');
            setInput('');
            setError(null);
          }}
          className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            joinMethod === 'code'
              ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          Join by Code
        </button>
        <button
          type="button"
          onClick={() => {
            setJoinMethod('id');
            setInput('');
            setError(null);
          }}
          className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            joinMethod === 'id'
              ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          Join by ID
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-950/50 p-3 text-red-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4">
          <div className="flex items-center gap-2 rounded-lg bg-green-950/50 p-3 text-green-300 mb-2">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <p>{success.message}</p>
          </div>
          <p className="text-sm text-slate-400">
            {`Waiting for owner to approve: ${success.inventoryName}`}
          </p>
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="join-input" className="block text-sm font-medium text-slate-300 mb-2">
          {joinMethod === 'code' ? 'Invite Code' : 'Inventory ID'}
        </label>
        <input
          id="join-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={joinMethod === 'code' ? 'e.g., ABC123' : 'Paste the inventory ID here'}
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none font-mono text-sm uppercase"
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Joining...' : `Join by ${joinMethod === 'code' ? 'Code' : 'ID'}`}
      </button>
    </form>
  );
}
