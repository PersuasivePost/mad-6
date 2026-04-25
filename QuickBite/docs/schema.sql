-- ============================================
-- QuickBite — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('student', 'employee', 'manager')) DEFAULT 'student',
  name TEXT,
  college_id TEXT,
  department TEXT,
  year TEXT,
  dietary_prefs TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  wallet_balance NUMERIC DEFAULT 0,
  phone TEXT,
  vendor_id UUID REFERENCES vendors(id),
  campus TEXT DEFAULT 'kjsce',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Public read for basic profile info (for order display)
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- 2. VENDORS (canteen stalls)
-- ============================================
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_open BOOLEAN DEFAULT true,
  rating NUMERIC DEFAULT 0,
  location TEXT,
  cuisine_type TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view vendors
CREATE POLICY "Vendors are viewable by authenticated users"
  ON vendors FOR SELECT
  TO authenticated
  USING (true);

-- Only managers can insert/update vendors
CREATE POLICY "Managers can insert vendors"
  ON vendors FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'manager')
  );

CREATE POLICY "Managers can update their vendors"
  ON vendors FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- ============================================
-- 3. MENU ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  category TEXT, -- breakfast, lunch, snacks, drinks, etc.
  food_type TEXT CHECK (food_type IN ('veg', 'non-veg')),
  dietary_tags TEXT[] DEFAULT '{}', -- gluten-free, halal, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view menu items
CREATE POLICY "Menu items are viewable by authenticated users"
  ON menu_items FOR SELECT
  TO authenticated
  USING (true);

-- Managers/employees can manage menu items
CREATE POLICY "Staff can insert menu items"
  ON menu_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('manager', 'employee')
    )
  );

CREATE POLICY "Staff can update menu items"
  ON menu_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('manager', 'employee')
    )
  );

CREATE POLICY "Managers can delete menu items"
  ON menu_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

-- ============================================
-- 4. ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'cancelled')),
  total NUMERIC NOT NULL CHECK (total >= 0),
  pickup_token TEXT,
  special_instructions TEXT,
  payment_method TEXT DEFAULT 'wallet',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Students can view their own orders
CREATE POLICY "Students can view their orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('employee', 'manager')
    )
  );

-- Students can create orders
CREATE POLICY "Students can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- Staff can update order status
CREATE POLICY "Staff can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('employee', 'manager')
    )
  );

-- ============================================
-- 5. ORDER ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC NOT NULL CHECK (price >= 0),
  customizations JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Same access as orders
CREATE POLICY "Order items viewable by order owner or staff"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.student_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('employee', 'manager')
          ))
    )
  );

CREATE POLICY "Students can insert order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.student_id = auth.uid()
    )
  );

-- ============================================
-- 6. COUPONS
-- ============================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('flat', 'percent')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  min_order NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Everyone can view active coupons
CREATE POLICY "Active coupons viewable by authenticated users"
  ON coupons FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Only managers can manage coupons
CREATE POLICY "Managers can manage coupons"
  ON coupons FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

-- ============================================
-- 7. TRANSACTIONS (wallet history)
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own transactions
CREATE POLICY "Users can insert their own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- 8. FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Generate unique pickup token
CREATE OR REPLACE FUNCTION generate_pickup_token()
RETURNS TRIGGER AS $$
DECLARE
  token_num INTEGER;
BEGIN
  -- Get the next token number for today
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(pickup_token FROM '#(\d+)') AS INTEGER)
  ), 0) + 1
  INTO token_num
  FROM orders
  WHERE DATE(created_at) = CURRENT_DATE;

  NEW.pickup_token := '#' || token_num;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_pickup_token ON orders;
CREATE TRIGGER set_pickup_token
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_pickup_token();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. SEED DATA — KJSCE Engineering Canteen
-- ============================================

-- If vendor already exists, update it:
-- UPDATE vendors SET 
--   name = 'KJSCE Engineering Canteen',
--   location = 'AryaBhat Building, Ground Floor (A Building), KJSCE, Mumbai',
--   description = 'Pure Veg & Jain friendly canteen at KJSCE, Mumbai'
-- WHERE id = 'aaaaaaaa-0000-0000-0000-000000000001';

-- Or insert fresh:
-- INSERT INTO vendors (id, name, description, cuisine_type, is_open, rating, location, image_url)
-- VALUES (
--   'aaaaaaaa-0000-0000-0000-000000000001',
--   'KJSCE Engineering Canteen',
--   'Pure Veg & Jain friendly canteen at KJSCE, Mumbai',
--   'Indian Vegetarian',
--   true,
--   4.3,
--   'AryaBhat Building, Ground Floor (A Building), KJSCE, Mumbai',
--   'https://picsum.photos/seed/kjscecanteen/400/200'
-- );

-- See docs/seed.sql for complete menu items (96 items across 6 categories)
