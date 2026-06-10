import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Trash2, ChevronLeft } from 'lucide-react';
import { getPendingRequests, approveMember, rejectMember, removeMember, getInventoryDetails, InventoryDetails, InventoryMember } from '../lib/inventory';

interface ApprovalDashboardProps {
  inventoryId: string;
  onBack?: () => void;
}

/**
 * ApprovalDashboard Component
 * Owner interface to manage join requests and members
 */
export function ApprovalDashboard({ inventoryId, onBack }: ApprovalDashboardProps) {
  const [details, setDetails] = useState<InventoryDetails | null>(null);
  const [pendingRequests, setPendingRequests] = useState<InventoryMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const [detailsData, pendingData] = await Promise.all([
          getInventoryDetails(inventoryId),
          getPendingRequests(inventoryId),
        ]);
        setDetails(detailsData);
        setPendingRequests(pendingData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [inventoryId]);

  const handleApprove = async (userId: string) => {
    setActionLoading(`approve-${userId}`);
    try {
      await approveMember(inventoryId, userId);
      // Refresh data
      setPendingRequests(pendingRequests.filter(r => r.user_id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve member');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    setActionLoading(`reject-${userId}`);
    try {
      await rejectMember(inventoryId, userId);
      // Refresh data
      setPendingRequests(pendingRequests.filter(r => r.user_id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject member');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Remove this member from the inventory?')) return;
    
    setActionLoading(`remove-${userId}`);
    try {
      await removeMember(inventoryId, userId);
      // Refresh data
      if (details) {
        const updated = await getInventoryDetails(inventoryId);
        setDetails(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-[1.75rem] border border-slate-700/50 bg-slate-900/80 p-8 text-center shadow-2xl shadow-slate-950/20">
        <p className="text-slate-400">Loading approval dashboard...</p>
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
        <div className="flex items-center gap-3 rounded-[1.75rem] border border-rose-500/30 bg-rose-950/80 p-6 text-red-300 shadow-lg shadow-rose-950/20">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!details) return null;

  const approvedMembers = details.members.filter(m => m.status === 'approved');

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
      >
        <ChevronLeft className="h-5 w-5" />
        Back
      </button>

      <div>
        <h2 className="text-3xl font-bold text-slate-100">{details.inventory.name}</h2>
        <p className="mt-1 text-slate-400">Approval Dashboard</p>
      </div>

      {/* Pending Requests */}
      <div className="relative overflow-hidden rounded-[1.75rem] border border-cyan-500/20 bg-slate-950/95 p-6 shadow-[0_24px_80px_-44px_rgba(56,189,248,0.35)]">
        <div className="pointer-events-none absolute -right-10 top-6 h-28 w-28 rounded-full bg-cyan-400/15 blur-3xl"></div>
        <h3 className="text-xl font-semibold text-slate-100 mb-4">
          Pending Requests {pendingRequests.length > 0 && <span className="text-cyan-400">({pendingRequests.length})</span>}
        </h3>

        {pendingRequests.length === 0 ? (
          <p className="text-slate-400">No pending join requests</p>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-700/40 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/10 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-100">{request.email || 'Unknown User'}</p>
                  <p className="text-xs text-slate-500">
                    Requested {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(request.user_id)}
                    disabled={actionLoading !== null}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/10 transition hover:brightness-105 disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(request.user_id)}
                    disabled={actionLoading !== null}
                    className="inline-flex items-center gap-2 rounded-2xl bg-rose-600/90 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/10 transition hover:bg-rose-500 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved Members */}
      <div className="relative overflow-hidden rounded-[1.75rem] border border-sky-500/15 bg-slate-950/95 p-6 shadow-[0_24px_80px_-44px_rgba(59,130,246,0.3)]">
        <div className="pointer-events-none absolute left-6 bottom-6 h-24 w-24 rounded-full bg-sky-400/10 blur-3xl"></div>
        <h3 className="text-xl font-semibold text-slate-100 mb-4">
          Approved Members {approvedMembers.length > 0 && <span className="text-cyan-400">({approvedMembers.length})</span>}
        </h3>

        {approvedMembers.length === 0 ? (
          <p className="text-slate-400">No approved members yet</p>
        ) : (
          <div className="space-y-3">
            {approvedMembers.map((member) => (
              <div
                key={member.id}
                className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-700/40 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/10 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-100">{member.email || 'Unknown User'}</p>
                  <p className="text-xs text-slate-500">
                    Joined {new Date(member.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(member.user_id)}
                  disabled={actionLoading !== null}
                  className="flex items-center gap-1 rounded-lg bg-red-600/50 px-3 py-2 text-sm font-medium text-red-200 hover:bg-red-600 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
