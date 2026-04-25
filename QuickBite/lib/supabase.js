/**
 * Supabase Client Configuration
 * Replace placeholder values with your actual Supabase project credentials.
 * @see docs/SETUP.md for instructions
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tzpborzwmpozuqvteiou.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ltLD8NGW1k8YJFNnLPdd3Q_bYGZWrub';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Fetch the user's profile from the profiles table
 * @param {string} userId - The user's UUID
 * @returns {Promise<object|null>} Profile data or null
 */
export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error.message);
    return null;
  }
  return data;
}

/**
 * Update the user's profile
 * @param {string} userId - The user's UUID
 * @param {object} updates - Fields to update
 * @returns {Promise<object|null>} Updated profile or null
 */
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error.message);
    return null;
  }
  return data;
}

/**
 * Fetch all open vendors
 * @returns {Promise<Array>} List of vendors
 */
export async function fetchVendors() {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('is_open', true)
    .order('rating', { ascending: false });

  if (error) {
    console.error('Error fetching vendors:', error.message);
    return [];
  }
  return data || [];
}

/**
 * Fetch menu items for a specific vendor
 * @param {string} vendorId - The vendor's UUID
 * @returns {Promise<Array>} List of menu items
 */
export async function fetchMenuItems(vendorId) {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('vendor_id', vendorId)
    .eq('is_available', true)
    .order('category', { ascending: true });

  if (error) {
    console.error('Error fetching menu items:', error.message);
    return [];
  }
  return data || [];
}

/**
 * Create a new order and its items
 * @param {object} orderData - { student_id, vendor_id, total, special_instructions, payment_method }
 * @param {Array} items - [{ menu_item_id, quantity, price, customizations }]
 * @returns {Promise<object|null>} Created order or null
 */
export async function createOrder(orderData, items) {
  // Insert the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();

  if (orderError) {
    console.error('Error creating order:', orderError.message);
    return null;
  }

  // Insert order items
  const orderItems = items.map((item) => ({
    ...item,
    order_id: order.id,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Error creating order items:', itemsError.message);
    // Note: order was created but items failed — might want to handle this
    return order;
  }

  return order;
}

/**
 * Fetch orders for a student
 * @param {string} studentId - The student's UUID
 * @returns {Promise<Array>} List of orders with items
 */
export async function fetchStudentOrders(studentId) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      vendor:vendors(name, image_url),
      order_items(
        *,
        menu_item:menu_items(name, image_url)
      )
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error.message);
    return [];
  }
  return data || [];
}

/**
 * Fetch orders for employee queue (by vendor)
 * @param {string} vendorId - The vendor's UUID
 * @param {string} [status] - Optional status filter
 * @returns {Promise<Array>} List of orders
 */
export async function fetchVendorOrders(vendorId, status) {
  let query = supabase
    .from('orders')
    .select(`
      *,
      student:profiles!student_id(name, avatar_url, phone),
      order_items(
        *,
        menu_item:menu_items(name, price, food_type)
      )
    `)
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching vendor orders:', error.message);
    return [];
  }
  return data || [];
}

/**
 * Update order status
 * @param {string} orderId - The order's UUID
 * @param {string} status - New status
 * @returns {Promise<object|null>} Updated order or null
 */
export async function updateOrderStatus(orderId, status) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error.message);
    return null;
  }
  return data;
}

/**
 * Fetch wallet balance from profiles table
 * @param {string} userId - The user's UUID
 * @returns {Promise<number>} Wallet balance
 */
export async function fetchWalletBalance(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('wallet_balance')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching wallet balance:', error.message);
    return 0;
  }
  return data?.wallet_balance || 0;
}

/**
 * Fetch transactions for a user
 * @param {string} userId - The user's UUID
 * @returns {Promise<Array>} List of transactions
 */
export async function fetchTransactions(userId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error.message);
    return [];
  }
  return data || [];
}

/**
 * Mock payment function (simulates Razorpay)
 * @param {number} amount - Amount in INR
 * @param {string} method - Payment method
 * @returns {Promise<object>} Payment result
 */
export function mockPayment(amount, method = 'wallet') {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount,
        method,
        timestamp: new Date().toISOString(),
      });
    }, 2000);
  });
}

/**
 * Fetch active coupons
 * @returns {Promise<Array>} Active coupons
 */
export async function fetchCoupons() {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching coupons:', error.message);
    return [];
  }
  return data || [];
}
