-- Phase 2 Database Schema and RLS Setup
-- This migration creates the inventories and inventory_members tables with RLS policies

-- Create inventories table
CREATE TABLE IF NOT EXISTS inventories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory_members table
CREATE TABLE IF NOT EXISTS inventory_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inv_id UUID NOT NULL REFERENCES inventories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(inv_id, user_id)
);

-- Create medicines table
CREATE TABLE IF NOT EXISTS public.medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inv_id UUID NOT NULL REFERENCES public.inventories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  threshold INT NOT NULL DEFAULT 0 CHECK (threshold >= 0),
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS inventories_owner_id_idx ON public.inventories(owner_id);
CREATE INDEX IF NOT EXISTS inventories_invite_code_idx ON public.inventories(invite_code);
CREATE INDEX IF NOT EXISTS inventory_members_inv_id_idx ON public.inventory_members(inv_id);
CREATE INDEX IF NOT EXISTS inventory_members_user_id_idx ON public.inventory_members(user_id);
CREATE INDEX IF NOT EXISTS inventory_members_inv_id_status_idx ON public.inventory_members(inv_id, status);
CREATE INDEX IF NOT EXISTS medicines_inv_id_idx ON public.medicines(inv_id);
CREATE INDEX IF NOT EXISTS medicines_inv_id_quantity_idx ON public.medicines(inv_id, quantity);

-- RLS Policies for inventories table
DROP POLICY IF EXISTS "Owners can read their own inventories" ON public.inventories;
CREATE POLICY "Owners can read their own inventories"
  ON public.inventories FOR SELECT
  USING (auth.uid() = owner_id);

-- 2. Approved members can read inventories they belong to
DROP POLICY IF EXISTS "Approved members can read their inventories" ON public.inventories;
CREATE POLICY "Approved members can read their inventories"
  ON public.inventories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.inventory_members
      WHERE public.inventories.id = public.inventory_members.inv_id
      AND public.inventory_members.user_id = auth.uid()
      AND public.inventory_members.status = 'approved'
    )
  );

-- 3. Owners can update their inventories
DROP POLICY IF EXISTS "Owners can update their inventories" ON public.inventories;
CREATE POLICY "Owners can update their inventories"
  ON public.inventories FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 4. Owners can insert inventories
DROP POLICY IF EXISTS "Users can create inventories" ON public.inventories;
CREATE POLICY "Users can create inventories"
  ON public.inventories FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- RLS Policies for inventory_members table
-- 1. Owners can read all member records for their inventory
DROP POLICY IF EXISTS "Owners can read all members in their inventory" ON public.inventory_members;
CREATE POLICY "Owners can read all members in their inventory"
  ON public.inventory_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.inventories
      WHERE public.inventories.id = public.inventory_members.inv_id
      AND public.inventories.owner_id = auth.uid()
    )
  );

-- 2. Approved members can read other approved members in their inventory
DROP POLICY IF EXISTS "Approved members can read approved members in their inventory" ON public.inventory_members;
CREATE POLICY "Approved members can read approved members in their inventory"
  ON public.inventory_members FOR SELECT
  USING (
    public.inventory_members.status = 'approved'
    AND EXISTS (
      SELECT 1 FROM public.inventory_members im2
      WHERE im2.inv_id = public.inventory_members.inv_id
      AND im2.user_id = auth.uid()
      AND im2.status = 'approved'
    )
  );

-- 3. Users can see their own membership record
DROP POLICY IF EXISTS "Users can read their own membership" ON public.inventory_members;
CREATE POLICY "Users can read their own membership"
  ON public.inventory_members FOR SELECT
  USING (auth.uid() = public.inventory_members.user_id);

-- 4. Only owners can insert membership records (via join function)
DROP POLICY IF EXISTS "Only owners can insert member records" ON public.inventory_members;
CREATE POLICY "Only owners can insert member records"
  ON public.inventory_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inventories
      WHERE public.inventories.id = public.inventory_members.inv_id
      AND public.inventories.owner_id = auth.uid()
    )
  );

-- 5. Only owners can update membership status
DROP POLICY IF EXISTS "Only owners can update membership status" ON public.inventory_members;
CREATE POLICY "Only owners can update membership status"
  ON public.inventory_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.inventories
      WHERE public.inventories.id = public.inventory_members.inv_id
      AND public.inventories.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inventories
      WHERE public.inventories.id = public.inventory_members.inv_id
      AND public.inventories.owner_id = auth.uid()
    )
  );

-- 6. Only owners can delete membership records
DROP POLICY IF EXISTS "Only owners can delete member records" ON public.inventory_members;
CREATE POLICY "Only owners can delete member records"
  ON public.inventory_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.inventories
      WHERE public.inventories.id = public.inventory_members.inv_id
      AND public.inventories.owner_id = auth.uid()
    )
  );

-- Enable RLS on both tables
ALTER TABLE public.inventories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medicines table
-- 1. Owners can read medicines in their inventories
DROP POLICY IF EXISTS "Owners can read medicines in their inventories" ON public.medicines;
CREATE POLICY "Owners can read medicines in their inventories"
  ON public.medicines FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.inventories
      WHERE public.inventories.id = public.medicines.inv_id
      AND public.inventories.owner_id = auth.uid()
    )
  );

-- 2. Approved members can read medicines in their inventories
DROP POLICY IF EXISTS "Approved members can read medicines in their inventories" ON public.medicines;
CREATE POLICY "Approved members can read medicines in their inventories"
  ON public.medicines FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.inventory_members
      WHERE public.inventory_members.inv_id = public.medicines.inv_id
      AND public.inventory_members.user_id = auth.uid()
      AND public.inventory_members.status = 'approved'
    )
  );

-- 3. Owners can insert medicines in their inventories
DROP POLICY IF EXISTS "Owners can insert medicines in their inventories" ON public.medicines;
CREATE POLICY "Owners can insert medicines in their inventories"
  ON public.medicines FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inventories
      WHERE public.inventories.id = public.medicines.inv_id
      AND public.inventories.owner_id = auth.uid()
    )
  );

-- 4. Approved members can insert medicines in their inventories
DROP POLICY IF EXISTS "Approved members can insert medicines in their inventories" ON public.medicines;
CREATE POLICY "Approved members can insert medicines in their inventories"
  ON public.medicines FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inventory_members
      WHERE public.inventory_members.inv_id = public.medicines.inv_id
      AND public.inventory_members.user_id = auth.uid()
      AND public.inventory_members.status = 'approved'
    )
  );

-- 5. Owners can update medicines in their inventories
DROP POLICY IF EXISTS "Owners can update medicines in their inventories" ON public.medicines;
CREATE POLICY "Owners can update medicines in their inventories"
  ON public.medicines FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.inventories
      WHERE public.inventories.id = public.medicines.inv_id
      AND public.inventories.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inventories
      WHERE public.inventories.id = public.medicines.inv_id
      AND public.inventories.owner_id = auth.uid()
    )
  );

-- 6. Approved members can update medicines in their inventories
DROP POLICY IF EXISTS "Approved members can update medicines in their inventories" ON public.medicines;
CREATE POLICY "Approved members can update medicines in their inventories"
  ON public.medicines FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.inventory_members
      WHERE public.inventory_members.inv_id = public.medicines.inv_id
      AND public.inventory_members.user_id = auth.uid()
      AND public.inventory_members.status = 'approved'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inventory_members
      WHERE public.inventory_members.inv_id = public.medicines.inv_id
      AND public.inventory_members.user_id = auth.uid()
      AND public.inventory_members.status = 'approved'
    )
  );

-- 7. Owners can delete medicines in their inventories
DROP POLICY IF EXISTS "Owners can delete medicines in their inventories" ON public.medicines;
CREATE POLICY "Owners can delete medicines in their inventories"
  ON public.medicines FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.inventories
      WHERE public.inventories.id = public.medicines.inv_id
      AND public.inventories.owner_id = auth.uid()
    )
  );

-- 8. Approved members can delete medicines in their inventories
DROP POLICY IF EXISTS "Approved members can delete medicines in their inventories" ON public.medicines;
CREATE POLICY "Approved members can delete medicines in their inventories"
  ON public.medicines FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.inventory_members
      WHERE public.inventory_members.inv_id = public.medicines.inv_id
      AND public.inventory_members.user_id = auth.uid()
      AND public.inventory_members.status = 'approved'
    )
  );

-- Enable RLS on medicines table
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
