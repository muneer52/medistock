import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Inventory } from './inventory';

const adminEmail = import.meta.env.VITE_ADMIN_EMAIL ?? '';
const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD ?? '';

interface User {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isInventoryOwner: (inventory: Inventory) => boolean;
  isApprovedMember: (inventory: Inventory) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 * Manages user authentication state for both OAuth (Google) and email/password methods.
 * 
 * Supported authentication methods:
 * - Google OAuth via Supabase
 * - Email/password registration and login via Supabase
 * 
 * The auth context transparently handles both methods - the user object
 * structure is identical regardless of login method, and signOut() works
 * for both OAuth and email/password sessions.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session and auto-login with admin credentials if configured
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUser({
          id: data.session.user.id,
          email: data.session.user.email,
          user_metadata: data.session.user.user_metadata,
        });
      } else if (adminEmail && adminPassword) {
        const { data: signInData, error } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword,
        });

        if (!error && signInData.session?.user) {
          setUser({
            id: signInData.session.user.id,
            email: signInData.session.user.email,
            user_metadata: signInData.session.user.user_metadata,
          });
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const isInventoryOwner = (inventory: Inventory): boolean => {
    return inventory.owner_id === user?.id;
  };

  const isApprovedMember = (inventory: Inventory): boolean => {
    return inventory.role === 'member' && !isInventoryOwner(inventory);
  };

  const value: AuthContextType = {
    user,
    loading,
    signOut,
    isInventoryOwner,
    isApprovedMember,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 * Access auth context in components
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
