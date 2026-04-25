import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useCart } from "../context/CartContext";
import colors from "../styles/colors";
import typography from "../styles/typography";

// For Android emulator: http://10.0.2.2:4000
// For Expo Go on phone: use your PC's LAN IP
const API_BASE_URL = "http://localhost:4000";

function formatMoney(value) {
  const n = Number(value || 0);
  return `₹${n.toFixed(0)}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function PaymentScreen({ navigation }) {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const total = getCartTotal();

  const [paying, setPaying] = useState(false);

  const summaryLines = useMemo(() => {
    return cartItems.map((it) => ({
      key: String(it.id),
      name: it.name,
      qty: Number(it.quantity || 0),
      lineTotal: Number(it.price || 0) * Number(it.quantity || 0),
    }));
  }, [cartItems]);

  async function onPayNow() {
    if (cartItems.length === 0 || total <= 0) {
      Alert.alert("Cart is empty", "Add items before paying.");
      return;
    }

    setPaying(true);
    try {
      // Simulate payment processing
      await sleep(1500);

      // Load current user id (fallback to 1 if missing)
      let userId = 1;
      try {
        const raw = await AsyncStorage.getItem("user");
        const u = raw ? JSON.parse(raw) : null;
        if (u?.id) userId = Number(u.id);
      } catch {
        // ignore; keep fallback
      }

      const payload = {
        userId,
        total,
        items: cartItems.map((x) => ({
          menuItemId: Number(x.id),
          name: x.name,
          price: Number(x.price),
          quantity: Number(x.quantity),
          stallId: x.stallId,
          stallName: x.stallName,
          veg_nonveg: x.veg_nonveg,
        })),
      };

      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Failed to create order");
      }

      const token = json?.token ?? json?.order?.token;
      const orderId = json?.orderId ?? json?.order?.id;

      clearCart();
      navigation.replace("OrderConfirmation", { token, orderId, total });
    } catch (e) {
      Alert.alert("Payment failed", String(e?.message || e));
    } finally {
      setPaying(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment</Text>
        <Text style={styles.sub}>Review your order before paying.</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cart Summary</Text>
          {summaryLines.map((x) => (
            <View key={x.key} style={styles.lineRow}>
              <Text style={styles.lineLeft} numberOfLines={1}>
                {x.name} × {x.qty}
              </Text>
              <Text style={styles.lineRight}>{formatMoney(x.lineTotal)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>{formatMoney(total)}</Text>
        </View>

        <Pressable
          onPress={onPayNow}
          disabled={paying}
          style={({ pressed }) => [
            styles.payBtn,
            pressed && !paying ? styles.payBtnPressed : null,
            paying ? styles.payBtnDisabled : null,
          ]}
        >
          {paying ? (
            <View style={styles.payBtnInner}>
              <ActivityIndicator color={colors.white} />
              <Text style={styles.payBtnText}>Processing…</Text>
            </View>
          ) : (
            <Text style={styles.payBtnText}>Pay Now</Text>
          )}
        </Pressable>
      </View>
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
    paddingBottom: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray5,
  },
  title: {
    ...typography.h2,
    color: colors.gray1,
    marginBottom: 2,
  },
  sub: {
    ...typography.body,
    color: colors.gray2,
    marginBottom: 6,
  },
  content: {
    padding: 16,
    paddingBottom: 160,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.gray1,
    marginBottom: 10,
  },
  lineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  lineLeft: {
    ...typography.body,
    color: colors.gray1,
    flex: 1,
    marginRight: 10,
  },
  lineRight: {
    ...typography.bodyMedium,
    color: colors.gray1,
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
    ...typography.bodyMedium,
    color: colors.gray2,
  },
  totalValue: {
    ...typography.h1,
    color: colors.primary,
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
  payBtnDisabled: {
    opacity: 0.7,
  },
  payBtnText: {
    ...typography.button,
    color: colors.white,
  },
  payBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
