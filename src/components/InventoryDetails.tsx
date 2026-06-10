import React, { useState, useEffect } from 'react';
import { Users, AlertCircle, ChevronLeft, Lock, Trash2, LogOut } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { deleteInventory, getInventoryDetails, InventoryDetails, leaveInventory } from '../lib/inventory';
import MedicineList from './MedicineList';
import ShoppingList from './ShoppingList';

interface InventoryDetailsViewProps {
  inventoryId: string;
  onBack?: () => void;
  onInventoryChanged?: () => void;
  onViewApprovalDashboard?: (inventoryId: string) => void;
}

/**
 * InventoryDetails Component
 * Displays inventory information and member list
 */
export function InventoryDetailsView({ inventoryId, onBack, onInventoryChanged, onViewApprovalDashboard }: InventoryDetailsViewProps) {
  const [details, setDetails] = useState<InventoryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const loadDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInventoryDetails(inventoryId);
      setDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [inventoryId]);

  if (loading) {
    return (
      <div className="rounded-[1.75rem] border border-slate-700/50 bg-slate-900/80 p-6 text-center shadow-xl shadow-slate-950/10">
        <p className="text-slate-400">Loading inventory details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </button>
        <div className="flex items-center gap-3 rounded-[1.75rem] border border-slate-700/50 bg-rose-950/80 p-6 text-red-300 shadow-lg shadow-rose-950/20">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!details) return null;

  const { inventory, members, is_owner } = details;

  const currentMember = members.find(
    (member) => member.user_id === user?.id && member.status === 'approved'
  );
  const canLeave = Boolean(currentMember && !is_owner);

  const handleLeaveInventory = async () => {
    if (!confirm('Leave this inventory? You will lose access immediately.')) return;
    setLocalError(null);
    setActionLoading('leave');
    try {
      await leaveInventory(inventory.id);
      onInventoryChanged?.();
      onBack?.();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to leave inventory');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteInventory = async () => {
    if (!confirm('Delete this inventory and all its data? This cannot be undone.')) return;
    setLocalError(null);
    setActionLoading('delete');
    try {
      await deleteInventory(inventory.id);
      onInventoryChanged?.();
      onBack?.();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to delete inventory');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
      >
        <ChevronLeft className="h-5 w-5" />
        Back to Inventories
      </button>

      <div className="relative overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-slate-950/95 p-6 shadow-[0_40px_120px_-50px_rgba(56,189,248,0.35)]">
        <div className="pointer-events-none absolute -right-10 top-6 h-28 w-28 rounded-full bg-cyan-500/10 blur-3xl"></div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-100">{inventory.name}</h2>
            <p className="mt-2 text-sm text-slate-400">
              Created {new Date(inventory.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={loadDetails}
            disabled={loading}
            className="inline-flex items-center rounded-2xl border border-slate-700/60 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-200 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {is_owner && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-block rounded-lg bg-cyan-950/50 px-3 py-1 text-sm text-cyan-300">
              You are the owner of this inventory
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => onViewApprovalDashboard?.(inventory.id)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700/60 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-200"
              >
                <Users className="h-4 w-4" />
                Manage members
              </button>
              <button
                onClick={handleDeleteInventory}
                disabled={actionLoading !== null}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/10 transition hover:bg-rose-500 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete inventory
              </button>
            </div>
          </div>
        )}

        {!is_owner && canLeave && (
          <div className="mt-4">
            <button
              onClick={handleLeaveInventory}
              disabled={actionLoading !== null}
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-400/20 transition hover:bg-amber-400 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              Leave inventory
            </button>
          </div>
        )}

        {localError && (
          <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            {localError}
          </div>
        )}

        <div className="mt-5 rounded-[1.75rem] border border-slate-700/40 bg-slate-900/90 p-5 shadow-[0_20px_60px_-40px_rgba(56,189,248,0.18)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-300">Invite Code</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <code className="rounded-2xl bg-slate-900 px-4 py-3 text-cyan-300 font-mono text-sm">
                  {inventory.invite_code}
                </code>
                <span className="text-sm text-slate-400">
                  Share this code with collaborators. Joining by code grants instant access.
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-700/40 bg-slate-950/90 p-4 text-sm text-slate-300">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Inventory ID</p>
              <p className="mt-2 font-mono text-xs text-slate-200 break-all">{inventory.id}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-700/40 bg-slate-950/95 p-6 shadow-[0_24px_80px_-44px_rgba(56,189,248,0.18)]">
        <div className="pointer-events-none absolute -left-10 bottom-6 h-24 w-24 rounded-full bg-sky-400/10 blur-3xl"></div>
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-slate-100">Members</h3>
        </div>

        {members.length === 0 ? (
          <p className="text-slate-400">No members yet</p>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-700/40 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/10 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-100">{member.email || 'Unknown'}</p>
                  <p className="text-xs text-slate-500">
                    Joined {new Date(member.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-sm text-slate-400">
                  {member.status === 'approved' && (
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-300">Approved</span>
                  )}
                  {member.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-3 py-1 text-yellow-300">
                      <Lock className="h-3 w-3" />
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <MedicineList inventoryId={inventory.id} isOwner={is_owner} />
        <ShoppingList inventoryId={inventory.id} />
      </div>
    </div>
  );
}
