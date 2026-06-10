-- Phase 2 Backend API Functions
-- Postgres functions for inventory management, join requests, and member approval

-- Drop existing functions first to allow updating return types and signatures
DROP FUNCTION IF EXISTS create_inventory(TEXT);
DROP FUNCTION IF EXISTS list_user_inventories();
DROP FUNCTION IF EXISTS get_inventory_details(UUID);
DROP FUNCTION IF EXISTS join_inventory(UUID);
DROP FUNCTION IF EXISTS join_inventory_by_code(TEXT);
DROP FUNCTION IF EXISTS approve_member(UUID, UUID);
DROP FUNCTION IF EXISTS reject_member(UUID, UUID);
DROP FUNCTION IF EXISTS remove_member(UUID, UUID);
DROP FUNCTION IF EXISTS get_pending_requests(UUID);
DROP FUNCTION IF EXISTS cancel_join_request(UUID);
DROP FUNCTION IF EXISTS create_medicine(UUID, TEXT, TEXT, INT, INT, DATE);
DROP FUNCTION IF EXISTS update_medicine(UUID, TEXT, TEXT, INT, INT, DATE);
DROP FUNCTION IF EXISTS delete_medicine(UUID);
DROP FUNCTION IF EXISTS list_medicines(UUID);
DROP FUNCTION IF EXISTS get_low_stock_medicines(UUID);

-- Function 1: Create inventory
CREATE OR REPLACE FUNCTION create_inventory(p_name TEXT)
RETURNS jsonb AS $$
DECLARE
  v_inventory_id UUID;
  v_user_id UUID := auth.uid();
  v_invite_code TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User is not authenticated';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) THEN
    RAISE EXCEPTION 'Authenticated user is not present in auth.users';
  END IF;

  -- Generate unique invite code (6-character alphanumeric)
  LOOP
    v_invite_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT), 1, 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM inventories WHERE invite_code = v_invite_code);
  END LOOP;

  INSERT INTO inventories (owner_id, name, invite_code)
  VALUES (v_user_id, p_name, v_invite_code)
  RETURNING id INTO v_inventory_id;
  
  RETURN jsonb_build_object(
    'id', v_inventory_id,
    'name', p_name,
    'owner_id', v_user_id,
    'invite_code', v_invite_code,
    'created_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: List user inventories (owned or approved membership)
CREATE OR REPLACE FUNCTION list_user_inventories()
RETURNS TABLE(id UUID, name TEXT, owner_id UUID, created_at TIMESTAMP WITH TIME ZONE, role TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT combined.inventory_id,
         combined.inventory_name,
         combined.inventory_owner_id AS owner_id,
         combined.created_at,
         combined.role
  FROM (
    SELECT i.id AS inventory_id,
           i.name AS inventory_name,
           i.owner_id AS inventory_owner_id,
           i.created_at,
           'owner'::TEXT AS role
    FROM inventories i
    WHERE i.owner_id = auth.uid()

    UNION ALL

    SELECT i.id AS inventory_id,
           i.name AS inventory_name,
           i.owner_id AS inventory_owner_id,
           i.created_at,
           'member'::TEXT AS role
    FROM inventories i
    JOIN inventory_members im ON i.id = im.inv_id
    WHERE im.user_id = auth.uid()
      AND im.status = 'approved'
  ) combined
  ORDER BY combined.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: Get inventory details with members
CREATE OR REPLACE FUNCTION get_inventory_details(p_inv_id UUID)
RETURNS jsonb AS $$
DECLARE
  v_inventory jsonb;
  v_members jsonb;
  v_is_owner BOOLEAN;
BEGIN
  -- Check if user has access to this inventory
  IF NOT (
    EXISTS (SELECT 1 FROM inventories WHERE id = p_inv_id AND owner_id = auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM inventory_members
      WHERE inv_id = p_inv_id AND user_id = auth.uid() AND status = 'approved'
    )
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  v_is_owner := EXISTS (SELECT 1 FROM inventories WHERE id = p_inv_id AND owner_id = auth.uid());
  
  -- Get inventory details
  SELECT jsonb_build_object(
    'id', i.id,
    'name', i.name,
    'owner_id', i.owner_id,
    'invite_code', i.invite_code,
    'created_at', i.created_at
  ) INTO v_inventory
  FROM inventories i
  WHERE i.id = p_inv_id;
  
  -- Get members list based on user role
  IF v_is_owner THEN
    -- Owner sees all members with status
    SELECT jsonb_agg(jsonb_build_object(
      'id', im.id,
      'user_id', im.user_id,
      'status', im.status,
      'created_at', im.created_at,
      'email', u.email
    )) INTO v_members
    FROM inventory_members im
    LEFT JOIN auth.users u ON im.user_id = u.id
    WHERE im.inv_id = p_inv_id;
  ELSE
    -- Regular member sees only approved members
    SELECT jsonb_agg(jsonb_build_object(
      'id', im.id,
      'user_id', im.user_id,
      'status', im.status,
      'created_at', im.created_at,
      'email', u.email
    )) INTO v_members
    FROM inventory_members im
    LEFT JOIN auth.users u ON im.user_id = u.id
    WHERE im.inv_id = p_inv_id AND im.status = 'approved';
  END IF;
  
  RETURN jsonb_build_object(
    'inventory', v_inventory,
    'members', COALESCE(v_members, '[]'::jsonb),
    'is_owner', v_is_owner
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 4: Join inventory (create pending membership)
CREATE OR REPLACE FUNCTION join_inventory(p_inv_id UUID)
RETURNS jsonb AS $$
DECLARE
  v_inventory_name TEXT;
BEGIN
  -- Check if inventory exists
  SELECT name INTO v_inventory_name FROM inventories WHERE id = p_inv_id;
  IF v_inventory_name IS NULL THEN
    RAISE EXCEPTION 'Inventory not found';
  END IF;
  
  -- Check if user is not already a member
  IF EXISTS (SELECT 1 FROM inventory_members WHERE inv_id = p_inv_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Already a member of this inventory';
  END IF;
  
  -- Create pending membership
  INSERT INTO inventory_members (inv_id, user_id, status)
  VALUES (p_inv_id, auth.uid(), 'pending');
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Join request submitted. Awaiting owner approval.',
    'inventory_name', v_inventory_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 4a: Join inventory by invite code (pending approval)
CREATE OR REPLACE FUNCTION join_inventory_by_code(p_invite_code TEXT)
RETURNS jsonb AS $$
DECLARE
  v_inv_id UUID;
  v_inventory_name TEXT;
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User is not authenticated';
  END IF;

  SELECT id, name INTO v_inv_id, v_inventory_name
  FROM inventories
  WHERE invite_code = UPPER(p_invite_code)
  LIMIT 1;

  IF v_inv_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;

  IF EXISTS (SELECT 1 FROM inventory_members WHERE inv_id = v_inv_id AND user_id = v_user_id) THEN
    RAISE EXCEPTION 'Already a member of this inventory';
  END IF;

  INSERT INTO inventory_members (inv_id, user_id, status)
  VALUES (v_inv_id, v_user_id, 'pending');
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Join request submitted. Awaiting owner approval.',
    'inventory_name', v_inventory_name,
    'inv_id', v_inv_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 5: Approve member
CREATE OR REPLACE FUNCTION approve_member(p_inv_id UUID, p_user_id UUID)
RETURNS jsonb AS $$
BEGIN
  -- Check if user is owner of this inventory
  IF NOT EXISTS (SELECT 1 FROM inventories WHERE id = p_inv_id AND owner_id = auth.uid()) THEN
    RAISE EXCEPTION 'Only the inventory owner can approve members';
  END IF;
  
  -- Update membership status
  UPDATE inventory_members
  SET status = 'approved', updated_at = NOW()
  WHERE inv_id = p_inv_id AND user_id = p_user_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pending membership not found';
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Member approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 6: Reject member
CREATE OR REPLACE FUNCTION reject_member(p_inv_id UUID, p_user_id UUID)
RETURNS jsonb AS $$
BEGIN
  -- Check if user is owner of this inventory
  IF NOT EXISTS (SELECT 1 FROM inventories WHERE id = p_inv_id AND owner_id = auth.uid()) THEN
    RAISE EXCEPTION 'Only the inventory owner can reject members';
  END IF;
  
  -- Delete membership record
  DELETE FROM inventory_members
  WHERE inv_id = p_inv_id AND user_id = p_user_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pending membership not found';
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Member rejected'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 7: Remove member
CREATE OR REPLACE FUNCTION remove_member(p_inv_id UUID, p_user_id UUID)
RETURNS jsonb AS $$
BEGIN
  -- Check if user is owner of this inventory
  IF NOT EXISTS (SELECT 1 FROM inventories WHERE id = p_inv_id AND owner_id = auth.uid()) THEN
    RAISE EXCEPTION 'Only the inventory owner can remove members';
  END IF;
  
  -- Delete membership record
  DELETE FROM inventory_members
  WHERE inv_id = p_inv_id AND user_id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Membership not found';
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Member removed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 8: Leave approved member (member only)
CREATE OR REPLACE FUNCTION public.leave_inventory(p_inv_id UUID)
RETURNS jsonb AS $$
BEGIN
  -- Delete the user's approved membership for this inventory
  DELETE FROM inventory_members
  WHERE inv_id = p_inv_id AND user_id = auth.uid() AND status = 'approved';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No approved membership found for this inventory';
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Left inventory successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 9: Delete inventory (owner only)
CREATE OR REPLACE FUNCTION public.delete_inventory(p_inv_id UUID)
RETURNS jsonb AS $$
BEGIN
  -- Check if user is owner of this inventory
  IF NOT EXISTS (SELECT 1 FROM inventories WHERE id = p_inv_id AND owner_id = auth.uid()) THEN
    RAISE EXCEPTION 'Only the inventory owner can delete this inventory';
  END IF;

  -- Delete related inventory medicines and memberships
  DELETE FROM public.medicines WHERE inv_id = p_inv_id;
  DELETE FROM inventory_members WHERE inv_id = p_inv_id;
  DELETE FROM inventories WHERE id = p_inv_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inventory not found';
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Inventory deleted successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 10: Get pending requests (owner only)
CREATE OR REPLACE FUNCTION get_pending_requests(p_inv_id UUID)
RETURNS jsonb AS $$
DECLARE
  v_requests jsonb;
BEGIN
  -- Check if user is owner of this inventory
  IF NOT EXISTS (SELECT 1 FROM inventories WHERE id = p_inv_id AND owner_id = auth.uid()) THEN
    RAISE EXCEPTION 'Only the inventory owner can view pending requests';
  END IF;
  
  -- Get pending membership requests
  SELECT jsonb_agg(jsonb_build_object(
    'id', pending.id,
    'user_id', pending.user_id,
    'email', pending.email,
    'created_at', pending.created_at
  )) INTO v_requests
  FROM (
    SELECT im.id,
           im.user_id,
           im.created_at,
           u.email
    FROM inventory_members im
    LEFT JOIN auth.users u ON im.user_id = u.id
    WHERE im.inv_id = p_inv_id AND im.status = 'pending'
    ORDER BY im.created_at ASC
  ) AS pending;
  
  RETURN COALESCE(v_requests, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 9: Cancel join request
CREATE OR REPLACE FUNCTION cancel_join_request(p_inv_id UUID)
RETURNS jsonb AS $$
BEGIN
  -- Delete user's pending membership
  DELETE FROM inventory_members
  WHERE inv_id = p_inv_id AND user_id = auth.uid() AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No pending request found for this inventory';
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Join request cancelled'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 10: Create medicine
CREATE OR REPLACE FUNCTION create_medicine(
  p_inv_id UUID,
  p_name TEXT,
  p_category TEXT,
  p_quantity INT DEFAULT 0,
  p_threshold INT DEFAULT 0,
  p_expiry_date DATE DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_medicine_id UUID;
BEGIN
  -- Check if user has access to this inventory
  IF NOT (
    EXISTS (SELECT 1 FROM inventories WHERE id = p_inv_id AND owner_id = auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM inventory_members
      WHERE inv_id = p_inv_id AND user_id = auth.uid() AND status = 'approved'
    )
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  INSERT INTO public.medicines (inv_id, name, category, quantity, threshold, expiry_date)
  VALUES (p_inv_id, p_name, p_category, p_quantity, p_threshold, p_expiry_date)
  RETURNING id INTO v_medicine_id;

  RETURN jsonb_build_object(
    'id', v_medicine_id,
    'inv_id', p_inv_id,
    'name', p_name,
    'category', p_category,
    'quantity', p_quantity,
    'threshold', p_threshold,
    'expiry_date', p_expiry_date,
    'created_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 11: Update medicine
CREATE OR REPLACE FUNCTION update_medicine(
  p_medicine_id UUID,
  p_name TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_quantity INT DEFAULT NULL,
  p_threshold INT DEFAULT NULL,
  p_expiry_date DATE DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_inv_id UUID;
  v_medicine jsonb;
BEGIN
  -- Get inventory ID and check access
  SELECT m.inv_id INTO v_inv_id
  FROM public.medicines AS m
  WHERE m.id = p_medicine_id;
  
  IF v_inv_id IS NULL THEN
    RAISE EXCEPTION 'Medicine not found';
  END IF;

  IF NOT (
    EXISTS (SELECT 1 FROM inventories WHERE id = v_inv_id AND owner_id = auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM inventory_members
      WHERE inv_id = v_inv_id AND user_id = auth.uid() AND status = 'approved'
    )
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  UPDATE public.medicines AS m
  SET
    name = COALESCE(p_name, m.name),
    category = COALESCE(p_category, m.category),
    quantity = COALESCE(p_quantity, m.quantity),
    threshold = COALESCE(p_threshold, m.threshold),
    expiry_date = COALESCE(p_expiry_date, m.expiry_date),
    updated_at = NOW()
  WHERE m.id = p_medicine_id
  RETURNING jsonb_build_object(
    'id', m.id,
    'inv_id', m.inv_id,
    'name', m.name,
    'category', m.category,
    'quantity', m.quantity,
    'threshold', m.threshold,
    'expiry_date', m.expiry_date,
    'created_at', m.created_at,
    'updated_at', m.updated_at
  ) INTO v_medicine;

  RETURN v_medicine;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 12: Delete medicine
CREATE OR REPLACE FUNCTION delete_medicine(p_medicine_id UUID)
RETURNS jsonb AS $$
DECLARE
  v_inv_id UUID;
BEGIN
  -- Get inventory ID and check access
  SELECT m.inv_id INTO v_inv_id
  FROM public.medicines AS m
  WHERE m.id = p_medicine_id;
  
  IF v_inv_id IS NULL THEN
    RAISE EXCEPTION 'Medicine not found';
  END IF;

  IF NOT (
    EXISTS (SELECT 1 FROM inventories WHERE id = v_inv_id AND owner_id = auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM inventory_members
      WHERE inv_id = v_inv_id AND user_id = auth.uid() AND status = 'approved'
    )
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  DELETE FROM public.medicines AS m WHERE m.id = p_medicine_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Medicine deleted'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 13: List medicines in inventory
CREATE OR REPLACE FUNCTION list_medicines(p_inv_id UUID)
RETURNS TABLE(id UUID, inv_id UUID, name TEXT, category TEXT, quantity INT, threshold INT, expiry_date DATE, created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
  -- Check if user has access to this inventory
  IF NOT (
    EXISTS (SELECT 1 FROM inventories WHERE inventories.id = p_inv_id AND inventories.owner_id = auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM inventory_members
      WHERE inventory_members.inv_id = p_inv_id AND inventory_members.user_id = auth.uid() AND inventory_members.status = 'approved'
    )
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    medicine.id AS id,
    medicine.inv_id AS inv_id,
    medicine.name AS name,
    medicine.category AS category,
    medicine.quantity AS quantity,
    medicine.threshold AS threshold,
    medicine.expiry_date AS expiry_date,
    medicine.created_at AS created_at,
    medicine.updated_at AS updated_at
  FROM public.medicines AS medicine
  WHERE medicine.inv_id = p_inv_id
  ORDER BY medicine.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 14: Get low stock medicines (for shopping list)
CREATE OR REPLACE FUNCTION get_low_stock_medicines(p_inv_id UUID)
RETURNS TABLE(id UUID, inv_id UUID, name TEXT, category TEXT, quantity INT, threshold INT, expiry_date DATE, status TEXT) AS $$
BEGIN
  -- Check if user has access to this inventory
  IF NOT (
    EXISTS (SELECT 1 FROM inventories WHERE inventories.id = p_inv_id AND inventories.owner_id = auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM inventory_members
      WHERE inventory_members.inv_id = p_inv_id AND inventory_members.user_id = auth.uid() AND inventory_members.status = 'approved'
    )
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    medicine.id AS id,
    medicine.inv_id AS inv_id,
    medicine.name AS name,
    medicine.category AS category,
    medicine.quantity AS quantity,
    medicine.threshold AS threshold,
    medicine.expiry_date AS expiry_date,
    CASE
      WHEN medicine.quantity = 0 THEN 'CRITICAL'::TEXT
      WHEN medicine.quantity <= medicine.threshold THEN 'LOW'::TEXT
      ELSE 'OK'::TEXT
    END AS status
  FROM public.medicines AS medicine
  WHERE medicine.inv_id = p_inv_id AND medicine.quantity <= medicine.threshold
  ORDER BY medicine.quantity ASC, medicine.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
