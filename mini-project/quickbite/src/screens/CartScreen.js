import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useCart } from "../context/CartContext";
import colors from "../styles/colors";
import typography from "../styles/typography";

function formatMoney(value) {
  const n = Number(value || 0);
  return `₹${n.toFixed(0)}`;
}

function groupByStall(items) {
  const map = new Map();
  for (const item of items) {
    const key = item.stallName || "Unknown Stall";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return Array.from(map.entries()).map(([stallName, list]) => ({
    stallName,
    items: list,
  }));
}

export default function CartScreen({ navigation }) {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
  } = useCart();

  const groups = groupByStall(cartItems);
  const total = getCartTotal();
  const count = getCartCount();

  function groupSubtotal(items) {
    return items.reduce(
      (sum, x) => sum + Number(x.price || 0) * Number(x.quantity || 0),
      0,
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Cart</Text>
            <Text style={styles.count}>{count} items</Text>
          </View>
          {cartItems.length > 0 ? (
            <Pressable onPress={clearCart} hitSlop={10}>
              <Text style={styles.clearText}>Clear Cart</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Add items from a stall menu.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {groups.map((g) => {
            const subtotal = groupSubtotal(g.items);
            return (
              <View key={g.stallName} style={styles.groupCard}>
                <View style={styles.stallHeader}>
                  <Text style={styles.stallTitle}>{g.stallName}</Text>
                  <View style={styles.underline} />
                </View>

                {g.items.map((item) => (
                  <View key={String(item.id)} style={styles.itemRow}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPrice}>
                        {formatMoney(item.price)}
                      </Text>
                    </View>

                    <View style={styles.rightCol}>
                      <View style={styles.stepper}>
                        <Pressable
                          onPress={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          style={styles.stepBtn}
                        >
                          <Text style={styles.stepBtnText}>-</Text>
                        </Pressable>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <Pressable
                          onPress={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          style={styles.stepBtn}
                        >
                          <Text style={styles.stepBtnText}>+</Text>
                        </Pressable>
                      </View>

                      <View style={styles.lineRow}>
                        <Text style={styles.lineTotal}>
                          {formatMoney(
                            Number(item.price) * Number(item.quantity),
                          )}
                        </Text>
                        <Pressable
                          onPress={() => removeFromCart(item.id)}
                          hitSlop={10}
                        >
                          <Text style={styles.removeIcon}>✕</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ))}

                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Subtotal</Text>
                  <Text style={styles.subtotalValue}>
                    {formatMoney(subtotal)}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {cartItems.length > 0 ? (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatMoney(total)}</Text>
          </View>

          <Pressable
            onPress={() => navigation.navigate("Payment")}
            style={({ pressed }) => [
              styles.payBtn,
              pressed ? styles.payBtnPressed : null,
            ]}
          >
            <Text style={styles.payBtnText}>Proceed to Payment</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray5,
  },
  header: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray5,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray5,
    marginRight: 12,
  },
  backText: {
    ...typography.h3,
    color: colors.gray1,
  },
  title: {
    ...typography.h2,
    color: colors.gray1,
  },
  count: {
    ...typography.caption,
    color: colors.gray2,
    marginTop: 2,
  },
  clearText: {
    ...typography.bodyMedium,
    color: colors.secondary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 170,
  },
  groupCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  stallHeader: {
    marginBottom: 8,
  },
  stallTitle: {
    ...typography.h3,
    color: colors.gray1,
  },
  underline: {
    height: 2,
    width: 46,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: 6,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.gray5,
  },
  itemName: {
    ...typography.bodyMedium,
    color: colors.gray1,
  },
  itemPrice: {
    ...typography.caption,
    color: colors.gray2,
    marginTop: 2,
  },
  rightCol: {
    alignItems: "flex-end",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: {
    ...typography.h3,
    color: colors.white,
  },
  qtyText: {
    ...typography.bodyMedium,
    color: colors.gray1,
    marginHorizontal: 10,
    minWidth: 22,
    textAlign: "center",
  },
  lineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  lineTotal: {
    ...typography.bodyMedium,
    color: colors.gray1,
    marginRight: 10,
  },
  removeIcon: {
    ...typography.h3,
    color: colors.error,
    lineHeight: 22,
  },
  subtotalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
  },
  subtotalLabel: {
    ...typography.bodyMedium,
    color: colors.gray2,
  },
  subtotalValue: {
    ...typography.bodyMedium,
    color: colors.gray1,
    fontWeight: "700",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray5,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  totalLabel: {
    ...typography.h2,
    color: colors.gray2,
    fontWeight: "700",
  },
  totalValue: {
    ...typography.h2,
    color: colors.gray1,
    fontWeight: "800",
  },
  payBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  payBtnPressed: {
    backgroundColor: colors.primaryDark,
  },
  payBtnText: {
    ...typography.button,
    color: colors.white,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.gray1,
    marginBottom: 6,
  },
  emptySub: {
    ...typography.body,
    color: colors.gray2,
    textAlign: "center",
  },
});
