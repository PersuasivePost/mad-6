import { createContext, useContext, useMemo, useState } from "react";

// Cart item shape:
// {
//   id: string|number,
//   name: string,
//   price: number,
//   quantity: number,
//   stallId: string|number,
//   stallName: string,
//   veg_nonveg: 'veg'|'nonveg'
// }

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  function normalizeId(id) {
    return String(id);
  }

  function addToCart(item) {
    if (!item?.id) return;
    const next = {
      id: item.id,
      name: item.name ?? "",
      price: Number(item.price ?? 0),
      quantity: Math.max(1, Number(item.quantity ?? 1)),
      stallId: item.stallId,
      stallName: item.stallName ?? "",
      veg_nonveg: item.veg_nonveg ?? "veg",
    };

    setCartItems((prev) => {
      const idx = prev.findIndex(
        (x) => normalizeId(x.id) === normalizeId(next.id),
      );
      if (idx === -1) return [...prev, next];
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        quantity: updated[idx].quantity + next.quantity,
      };
      return updated;
    });
  }

  function removeFromCart(itemId) {
    setCartItems((prev) =>
      prev.filter((x) => normalizeId(x.id) !== normalizeId(itemId)),
    );
  }

  function updateQuantity(itemId, quantity) {
    const q = Number(quantity);
    if (!Number.isFinite(q)) return;

    if (q <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems((prev) =>
      prev.map((x) =>
        normalizeId(x.id) === normalizeId(itemId) ? { ...x, quantity: q } : x,
      ),
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  function getCartTotal() {
    return cartItems.reduce(
      (sum, x) => sum + Number(x.price || 0) * Number(x.quantity || 0),
      0,
    );
  }

  function getCartCount() {
    return cartItems.reduce((sum, x) => sum + Number(x.quantity || 0), 0);
  }

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
    }),
    [cartItems],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
