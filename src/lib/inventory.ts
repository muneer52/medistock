import { supabase } from './supabase';

// Types
export interface Inventory {
  id: string;
  name: string;
  owner_id: string;
  invite_code: string;
  created_at: string;
  role?: 'owner' | 'member';
}

export interface InventoryMember {
  id: string;
  user_id: string;
  email?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface InventoryDetails {
  inventory: Inventory;
  members: InventoryMember[];
  is_owner: boolean;
}

// API Functions

/**
 * Create a new inventory
 */
export async function createInventory(name: string): Promise<Inventory> {
  const { data, error } = await supabase.rpc('create_inventory', {
    p_name: name,
  });

  if (error) throw new Error(`Failed to create inventory: ${error.message}`);
  return data;
}

/**
 * List user's inventories (owned or approved)
 */
export async function listUserInventories(): Promise<Inventory[]> {
  const { data, error } = await supabase.rpc('list_user_inventories');

  if (error) throw new Error(`Failed to list inventories: ${error.message}`);
  return data || [];
}

/**
 * Get inventory details with members
 */
export async function getInventoryDetails(inv_id: string): Promise<InventoryDetails> {
  const { data, error } = await supabase.rpc('get_inventory_details', {
    p_inv_id: inv_id,
  });

  if (error) throw new Error(`Failed to get inventory details: ${error.message}`);
  return data;
}

/**
 * Join an inventory (submit pending request)
 */
export async function joinInventory(inv_id: string): Promise<{ success: boolean; message: string; inventory_name: string }> {
  const { data, error } = await supabase.rpc('join_inventory', {
    p_inv_id: inv_id,
  });

  if (error) throw new Error(`Failed to join inventory: ${error.message}`);
  return data;
}

/**
 * Join an inventory by invite code (pending approval)
 */
export async function joinInventoryByCode(invite_code: string): Promise<{ success: boolean; message: string; inventory_name: string; inv_id: string }> {
  const { data, error } = await supabase.rpc('join_inventory_by_code', {
    p_invite_code: invite_code.toUpperCase(),
  });

  if (error) throw new Error(`Failed to join inventory: ${error.message}`);
  return data;
}

/**
 * Approve a pending member (owner only)
 */
export async function approveMember(inv_id: string, user_id: string): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase.rpc('approve_member', {
    p_inv_id: inv_id,
    p_user_id: user_id,
  });

  if (error) throw new Error(`Failed to approve member: ${error.message}`);
  return data;
}

/**
 * Reject a pending member (owner only)
 */
export async function rejectMember(inv_id: string, user_id: string): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase.rpc('reject_member', {
    p_inv_id: inv_id,
    p_user_id: user_id,
  });

  if (error) throw new Error(`Failed to reject member: ${error.message}`);
  return data;
}

/**
 * Remove an approved member (owner only)
 */
export async function removeMember(inv_id: string, user_id: string): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase.rpc('remove_member', {
    p_inv_id: inv_id,
    p_user_id: user_id,
  });

  if (error) throw new Error(`Failed to remove member: ${error.message}`);
  return data;
}

/**
 * Delete an inventory and all related membership and medicine data (owner only)
 */
export async function deleteInventory(inv_id: string): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase.rpc('delete_inventory', {
    p_inv_id: inv_id,
  });

  if (error) throw new Error(`Failed to delete inventory: ${error.message}`);
  return data;
}

/**
 * Leave an approved inventory membership (member only)
 */
export async function leaveInventory(inv_id: string): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase.rpc('leave_inventory', {
    p_inv_id: inv_id,
  });

  if (error) throw new Error(`Failed to leave inventory: ${error.message}`);
  return data;
}

/**
 * Get pending requests for an inventory (owner only)
 */
export async function getPendingRequests(inv_id: string): Promise<InventoryMember[]> {
  const { data, error } = await supabase.rpc('get_pending_requests', {
    p_inv_id: inv_id,
  });

  if (error) throw new Error(`Failed to get pending requests: ${error.message}`);
  return data || [];
}

/**
 * Cancel a join request (user only)
 */
export async function cancelJoinRequest(inv_id: string): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase.rpc('cancel_join_request', {
    p_inv_id: inv_id,
  });

  if (error) throw new Error(`Failed to cancel join request: ${error.message}`);
  return data;
}

// Medicine Types
export interface Medicine {
  id: string;
  inv_id: string;
  name: string;
  category: string;
  quantity: number;
  threshold: number;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
  status?: 'CRITICAL' | 'LOW' | 'OK';
}

// Medicine API Functions

/**
 * Create a new medicine in an inventory
 */
export async function createMedicine(
  inv_id: string,
  name: string,
  category: string,
  quantity: number = 0,
  threshold: number = 0,
  expiry_date?: string
): Promise<Medicine> {
  const { data, error } = await supabase.rpc('create_medicine', {
    p_inv_id: inv_id,
    p_name: name,
    p_category: category,
    p_quantity: quantity,
    p_threshold: threshold,
    p_expiry_date: expiry_date || null,
  });

  if (error) throw new Error(`Failed to create medicine: ${error.message}`);
  return data;
}

/**
 * Update an existing medicine
 */
export async function updateMedicine(
  medicine_id: string,
  updates: Partial<Omit<Medicine, 'id' | 'inv_id' | 'created_at' | 'updated_at'>>
): Promise<Medicine> {
  const { data, error } = await supabase.rpc('update_medicine', {
    p_medicine_id: medicine_id,
    p_name: updates.name || null,
    p_category: updates.category || null,
    p_quantity: updates.quantity !== undefined ? updates.quantity : null,
    p_threshold: updates.threshold !== undefined ? updates.threshold : null,
    p_expiry_date: updates.expiry_date || null,
  });

  if (error) throw new Error(`Failed to update medicine: ${error.message}`);
  return data;
}

/**
 * Delete a medicine
 */
export async function deleteMedicine(medicine_id: string): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase.rpc('delete_medicine', {
    p_medicine_id: medicine_id,
  });

  if (error) throw new Error(`Failed to delete medicine: ${error.message}`);
  return data;
}

/**
 * List all medicines in an inventory
 */
export async function listMedicines(inv_id: string): Promise<Medicine[]> {
  const { data, error } = await supabase.rpc('list_medicines', {
    p_inv_id: inv_id,
  });

  if (error) throw new Error(`Failed to list medicines: ${error.message}`);
  
  // Add status calculation
  return (data || []).map((medicine: Medicine) => ({
    ...medicine,
    status: calculateMedicineStatus(medicine.quantity, medicine.threshold),
  }));
}

/**
 * Get low-stock medicines (for shopping list)
 */
export async function getLowStockMedicines(inv_id: string): Promise<Medicine[]> {
  const { data, error } = await supabase.rpc('get_low_stock_medicines', {
    p_inv_id: inv_id,
  });

  if (error) throw new Error(`Failed to get low stock medicines: ${error.message}`);
  return data || [];
}

/**
 * Calculate medicine status based on quantity and threshold
 */
export function calculateMedicineStatus(quantity: number, threshold: number): 'CRITICAL' | 'LOW' | 'OK' {
  if (quantity === 0) return 'CRITICAL';
  if (quantity <= threshold) return 'LOW';
  return 'OK';
}
