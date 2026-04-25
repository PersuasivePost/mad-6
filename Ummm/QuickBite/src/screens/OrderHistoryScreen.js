import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import colors from "../styles/colors";
import typography from "../styles/typography";
import { useCart } from "../context/CartContext";

// For Android emulator use: http://10.0.2.2:4000
// For Expo Go on phone: use your PC's LAN IP (same Wi‑Fi), e.g. http://192.168.1.34:4000
const API_BASE_URL = "http://localhost:4000";

function formatMoney(value) {
  const n = Number(value || 0);
  return `₹${n.toFixed(0)}`;
}

function parseDate(value) {
  // Backend returns created_at as ISO string.
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function dayLabel(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today - target) / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return date.toLocaleDateString(undefined, { weekday: "long" });
  }
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusPillStyle(status) {
  const s = String(status || "").toLowerCase();

  if (s === "ready") {
    return {
      bg: colors.success,
      text: colors.white,
      label: "Ready",
    };
  }

  if (s === "completed") {
    return {
      bg: colors.gray3,
      text: colors.white,
      label: "Completed",
    };
  }

  // default: preparing (or placed/confirmed/preparing)
  return {
    bg: colors.warning,
    text: colors.black,
    label:
      s === "placed" ? "Placed" : s === "confirmed" ? "Confirmed" : "Preparing",
  };
}

export default function OrderHistoryScreen({ navigation }) {
  const { addToCart, clearCart } = useCart();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [reorderingId, setReorderingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setError("");

    try {
      const raw = await AsyncStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : null;
      const userId = Number(user?.id ?? 1);

      const res = await fetch(`${API_BASE_URL}/orders/${userId}`);
      const json = await res.json();

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Failed to fetch orders");
      }

      setOrders(Array.isArray(json.orders) ? json.orders : []);
    } catch (e) {
      setError(
        "Could not load orders. Start backend on port 4000 and update API_BASE_URL if needed.",
      );
      setOrders([]);
    }
  }, []);

  const boot = useCallback(async () => {
    setLoading(true);
    await fetchOrders();
    setLoading(false);
  }, [fetchOrders]);

  useEffect(() => {
    boot();
  }, [boot]);

  // Use a useMemo to avoid re-grouping on every render.
  const grouped = useMemo(() => {
    const groups = new Map();

    for (const o of orders) {
      const d = parseDate(o.created_at);
      const keyDate = d
        ? new Date(d.getFullYear(), d.getMonth(), d.getDate())
        : null;
      const key = keyDate ? keyDate.toISOString() : "unknown";
      const label = keyDate ? dayLabel(keyDate) : "Unknown";

      if (!groups.has(key)) groups.set(key, { label, date: keyDate, list: [] });
      groups.get(key).list.push(o);
    }

    // Sort by date desc (unknown at bottom)
    return Array.from(groups.values()).sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date - a.date;
    });
  }, [orders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  const handleReorder = useCallback(
    async (orderId) => {
      setReorderingId(orderId);
      setError("");

      try {
        // Replace cart with this order
        clearCart();

        const res = await fetch(`${API_BASE_URL}/order-items/${orderId}`);
        const json = await res.json();
        if (!res.ok || !json?.ok) {
          throw new Error(json?.error || "Failed to load order items");
        }

        const items = Array.isArray(json.items) ? json.items : [];

        for (const it of items) {
          addToCart({
            id: it.menu_item_id,
            name: it.name,
            price: Number(it.unit_price),
            quantity: Number(it.quantity),
            stallId: it.stall_id,
            stallName: it.stall_name,
            veg_nonveg: it.veg_nonveg,
          });
        }

        navigation.navigate("Cart");
      } catch (e) {
        setError("Could not reorder. Please try again.");
      } finally {
        setReorderingId(null);
      }
    },
    [addToCart, clearCart, navigation],
  );

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>Loading orders…</Text>
      </View>
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
            <Text style={styles.title}>Order History</Text>
            <Text style={styles.subTitle}>{orders.length} orders</Text>
          </View>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {grouped.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySub}>
              Place your first order to see it here.
            </Text>
          </View>
        ) : (
          grouped.map((g) => (
            <View key={g.label + String(g.date || "")} style={styles.dayGroup}>
              <Text style={styles.dayTitle}>{g.label}</Text>

              {g.list.map((o) => {
                const pill = statusPillStyle(o.status);
                const created = parseDate(o.created_at);
                const timeText = created
                  ? created.toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";

                return (
                  <View key={String(o.id)} style={styles.card}>
                    <View style={styles.cardTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tokenText}>TOKEN #{o.token}</Text>
                        <Text style={styles.metaText}>
                          {timeText ? `${timeText} • ` : ""}
                          Order #{o.id}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusPill,
                          { backgroundColor: pill.bg },
                        ]}
                      >
                        <Text
                          style={[styles.statusPillText, { color: pill.text }]}
                        >
                          {pill.label}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardBottomRow}>
                      <Text style={styles.totalText}>
                        {formatMoney(o.total)}
                      </Text>

                      <Pressable
                        onPress={() => handleReorder(o.id)}
                        disabled={reorderingId === o.id}
                        style={({ pressed }) => [
                          styles.reorderBtn,
                          pressed ? styles.reorderBtnPressed : null,
                          reorderingId === o.id
                            ? styles.reorderBtnDisabled
                            : null,
                        ]}
                      >
                        <Text style={styles.reorderBtnText}>
                          {reorderingId === o.id ? "Reordering…" : "Reorder"}
                        </Text>
                      </Pressable>
                    </View>

                    {Array.isArray(o.items) && o.items.length ? (
                      <View style={styles.itemsPreview}>
                        <Text style={styles.itemsPreviewText} numberOfLines={2}>
                          {o.items
                            .slice(0, 3)
                            .map((it) => `${it.name} ×${it.quantity}`)
                            .join(" • ")}
                          {o.items.length > 3 ? " • …" : ""}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
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
  subTitle: {
    ...typography.caption,
    color: colors.gray2,
    marginTop: 2,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: 8,
  },
  scroll: {
    padding: 16,
    paddingBottom: 28,
  },
  dayGroup: {
    marginBottom: 18,
  },
  dayTitle: {
    ...typography.h3,
    color: colors.gray1,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tokenText: {
    ...typography.h3,
    color: colors.gray1,
  },
  metaText: {
    ...typography.caption,
    color: colors.gray2,
    marginTop: 4,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusPillText: {
    ...typography.caption,
    fontWeight: "600",
  },
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  totalText: {
    ...typography.h2,
    color: colors.primary,
  },
  reorderBtn: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  reorderBtnPressed: {
    opacity: 0.92,
  },
  reorderBtnDisabled: {
    opacity: 0.6,
  },
  reorderBtnText: {
    ...typography.button,
    color: colors.white,
    fontSize: 14,
  },
  itemsPreview: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.gray5,
  },
  itemsPreviewText: {
    ...typography.caption,
    color: colors.gray2,
  },
  emptyWrap: {
    marginTop: 60,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.gray1,
  },
  emptySub: {
    ...typography.body,
    color: colors.gray2,
    marginTop: 8,
    textAlign: "center",
  },
  loadingWrap: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    ...typography.body,
    color: colors.gray2,
    marginTop: 10,
  },
});
