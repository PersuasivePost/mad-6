/**
 * QuickBite — Zustand Store
 * State management with slices for auth, cart, orders, and UI
 */
import { create } from 'zustand';

/**
 * @typedef {object} AuthSlice
 * @property {object|null} session - Supabase session
 * @property {object|null} profile - User profile from profiles table
 * @property {string|null} role - User role: student | employee | manager
 * @property {boolean} isLoading - Auth loading state
 */

/**
 * @typedef {object} CartItem
 * @property {string} id - menu_item id
 * @property {string} name
 * @property {number} price
 * @property {number} quantity
 * @property {string} image_url
 * @property {string} food_type - veg | non-veg
 * @property {object} customizations
 */

/**
 * @typedef {object} CartSlice
 * @property {CartItem[]} items
 * @property {string|null} vendorId - Current cart vendor
 * @property {string|null} vendorName - Current cart vendor name
 * @property {string} specialInstructions
 * @property {string} couponCode
 * @property {number} couponDiscount
 */

const useStore = create((set, get) => ({
  // ========================================
  // AUTH SLICE
  // ========================================
  session: null,
  profile: null,
  role: null,
  isAuthLoading: true,

  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile, role: profile?.role || null }),
  setAuthLoading: (isAuthLoading) => set({ isAuthLoading }),
  clearAuth: () => set({ session: null, profile: null, role: null }),

  // ========================================
  // CART SLICE
  // ========================================
  cartItems: [],
  cartVendorId: null,
  cartVendorName: null,
  specialInstructions: '',
  couponCode: '',
  couponDiscount: 0,
  pickupTime: 'asap', // 'asap' | 'scheduled'
  scheduledTime: null,

  /**
   * Add an item to cart. If from a different vendor, clears existing cart.
   * @param {object} item - Menu item to add
   * @param {string} vendorId
   * @param {string} vendorName
   */
  addToCart: (item, vendorId, vendorName) => {
    const state = get();

    // If switching vendors, clear cart first
    if (state.cartVendorId && state.cartVendorId !== vendorId) {
      set({
        cartItems: [{ ...item, quantity: 1 }],
        cartVendorId: vendorId,
        cartVendorName: vendorName,
      });
      return;
    }

    // Check if item already exists in cart
    const existingIndex = state.cartItems.findIndex((ci) => ci.id === item.id);

    if (existingIndex > -1) {
      const updatedItems = [...state.cartItems];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + 1,
      };
      set({ cartItems: updatedItems });
    } else {
      set({
        cartItems: [...state.cartItems, { ...item, quantity: 1 }],
        cartVendorId: vendorId,
        cartVendorName: vendorName,
      });
    }
  },

  /**
   * Update item quantity; removes item if quantity <= 0
   * @param {string} itemId
   * @param {number} quantity
   */
  updateQuantity: (itemId, quantity) => {
    const state = get();
    if (quantity <= 0) {
      const filtered = state.cartItems.filter((ci) => ci.id !== itemId);
      if (filtered.length === 0) {
        set({
          cartItems: [],
          cartVendorId: null,
          cartVendorName: null,
          specialInstructions: '',
          couponCode: '',
          couponDiscount: 0,
        });
      } else {
        set({ cartItems: filtered });
      }
      return;
    }
    const updatedItems = state.cartItems.map((ci) =>
      ci.id === itemId ? { ...ci, quantity } : ci
    );
    set({ cartItems: updatedItems });
  },

  removeFromCart: (itemId) => {
    const state = get();
    const filtered = state.cartItems.filter((ci) => ci.id !== itemId);
    if (filtered.length === 0) {
      set({
        cartItems: [],
        cartVendorId: null,
        cartVendorName: null,
        specialInstructions: '',
        couponCode: '',
        couponDiscount: 0,
      });
    } else {
      set({ cartItems: filtered });
    }
  },

  clearCart: () =>
    set({
      cartItems: [],
      cartVendorId: null,
      cartVendorName: null,
      specialInstructions: '',
      couponCode: '',
      couponDiscount: 0,
      pickupTime: 'asap',
      scheduledTime: null,
    }),

  setSpecialInstructions: (specialInstructions) => set({ specialInstructions }),
  setPickupTime: (pickupTime) => set({ pickupTime }),
  setScheduledTime: (scheduledTime) => set({ scheduledTime }),

  applyCoupon: (code, discount) =>
    set({ couponCode: code, couponDiscount: discount }),
  removeCoupon: () => set({ couponCode: '', couponDiscount: 0 }),

  /** Computed: total items count */
  getCartItemCount: () => {
    return get().cartItems.reduce((sum, item) => sum + item.quantity, 0);
  },

  /** Computed: subtotal before discount */
  getCartSubtotal: () => {
    return get().cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  },

  /** Computed: total after discount */
  getCartTotal: () => {
    const state = get();
    const subtotal = state.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return Math.max(0, subtotal - state.couponDiscount);
  },

  // ========================================
  // ORDER SLICE
  // ========================================
  activeOrder: null,
  orderHistory: [],

  setActiveOrder: (activeOrder) => set({ activeOrder }),
  setOrderHistory: (orderHistory) => set({ orderHistory }),
  clearActiveOrder: () => set({ activeOrder: null }),

  // ========================================
  // UI SLICE
  // ========================================
  globalLoading: false,
  toastMessage: null,
  toastType: 'info', // 'info' | 'success' | 'error' | 'warning'

  setGlobalLoading: (globalLoading) => set({ globalLoading }),

  showToast: (message, type = 'info') => {
    set({ toastMessage: message, toastType: type });
    // Auto-hide after 3 seconds
    setTimeout(() => {
      set({ toastMessage: null });
    }, 3000);
  },

  hideToast: () => set({ toastMessage: null }),
}));

export default useStore;
