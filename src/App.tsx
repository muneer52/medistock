import React, { useState } from 'react';
import { Cloud, LogOut, Settings } from 'lucide-react';
import { AuthProvider, useAuth } from './lib/auth';
import { SignIn } from './components/SignIn';
import { InventoryCreate } from './components/InventoryCreate';
import { InventoryList } from './components/InventoryList';
import { InventoryDetailsView } from './components/InventoryDetails';
import { JoinInventory } from './components/JoinInventory';
import { ApprovalDashboard } from './components/ApprovalDashboard';
import { AccountSettings } from './components/AccountSettings';

type PageView = 'dashboard' | 'inventory-details' | 'approval-dashboard' | 'settings';

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<PageView>('dashboard');
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSelectInventory = (id: string) => {
    setSelectedInventoryId(id);
    setCurrentView('inventory-details');
  };

  const handleViewApprovalDashboard = (id: string) => {
    setSelectedInventoryId(id);
    setCurrentView('approval-dashboard');
  };

  const handleBack = () => {
    setSelectedInventoryId(null);
    setCurrentView('dashboard');
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6 py-12">
        <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-10 text-center">
          <p className="text-xl font-semibold text-slate-100">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show SignIn component if user is not authenticated
  if (!user) {
    return <SignIn />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-700/60 bg-slate-950/95 backdrop-blur-xl shadow-lg shadow-slate-950/20">
        <div className="mx-auto max-w-6xl px-6 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Cloud className="h-8 w-8 text-cyan-400" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">MediStock</h1>
              <p className="text-sm text-slate-400">Smart medical inventory for teams</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-cyan-500/15 bg-slate-900/80 px-4 py-3 text-sm text-slate-300 shadow-sm shadow-cyan-500/10">
              <p className="font-medium text-slate-100">{user?.email ?? 'Guest User'}</p>
              <p>Signed in</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('settings')}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/80 text-cyan-300 transition hover:border-cyan-400 hover:text-cyan-200"
                title="Open account settings"
                aria-label="Open account settings"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
                title="Sign out from this device"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-12">
        {currentView === 'dashboard' && (
          <div className="space-y-10">
            <section className="relative overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95 p-8 shadow-[0_45px_120px_-50px_rgba(14,165,233,0.65)]">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-10 top-8 h-44 w-44 rounded-full bg-cyan-400/15 blur-3xl"></div>
                <div className="absolute right-6 top-16 h-52 w-52 rounded-full bg-indigo-500/15 blur-3xl"></div>
                <div className="absolute left-1/2 top-24 h-56 w-56 -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl"></div>
              </div>
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-4 lg:max-w-2xl">
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">Inventory made beautiful</p>
                  <h2 className="text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl">Manage medicines, teams, and approvals with vibrant clarity.</h2>
                  <p className="max-w-2xl text-slate-300">A polished workspace for healthcare teams to create inventories, invite collaborators, and keep supplies under control with premium motion and glow.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:w-[420px]">
                  <div className="rounded-3xl border border-slate-700/40 bg-slate-950/90 p-5 shadow-[0_20px_60px_-30px_rgba(56,189,248,0.4)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300">
                    <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Quick actions</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-100">Create or join inventory</p>
                  </div>
                  <div className="rounded-3xl border border-slate-700/40 bg-slate-950/90 p-5 shadow-[0_20px_60px_-30px_rgba(59,130,246,0.35)] transition duration-300 hover:-translate-y-0.5 hover:border-sky-300">
                    <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Realtime insights</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-100">Track medicines instantly</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-8 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
              <div className="space-y-6">
                <InventoryCreate onSuccess={handleRefresh} />
                <JoinInventory onSuccess={handleRefresh} />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-3xl border border-slate-700/60 bg-slate-900/70 px-6 py-4 shadow-lg shadow-slate-950/10">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-100">Your Inventories</h3>
                    <p className="text-sm text-slate-400">Tap any inventory to view details and approvals.</p>
                  </div>
                  <button
                    onClick={handleRefresh}
                    className="rounded-full bg-slate-800 px-4 py-2 text-sm text-cyan-300 transition hover:bg-slate-700"
                  >
                    Refresh
                  </button>
                </div>
                <InventoryList
                  onSelectInventory={handleSelectInventory}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            </div>
          </div>
        )}

        {currentView === 'inventory-details' && selectedInventoryId && (
          <InventoryDetailsView
            inventoryId={selectedInventoryId}
            onBack={handleBack}
            onInventoryChanged={handleRefresh}
            onViewApprovalDashboard={handleViewApprovalDashboard}
          />
        )}

        {currentView === 'approval-dashboard' && selectedInventoryId && (
          <ApprovalDashboard
            inventoryId={selectedInventoryId}
            onBack={handleBack}
          />
        )}

        {currentView === 'settings' && (
          <AccountSettings
            currentEmail={user?.email}
            onBack={() => setCurrentView('dashboard')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-950/90 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-slate-500">
          <p>MediStock Phase 2 — Inventory & Collaboration Management</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
