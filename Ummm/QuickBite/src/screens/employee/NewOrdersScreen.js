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

import colors from "../../styles/colors";
import typography from "../../styles/typography";
import { apiFetch } from "../../services/api";

function formatMoney(value) {
  const n = Number(value || 0);
  return `₹${n.toFixed(0)}`;
}

function statusPillStyle(status) {
  const s = String(status || "").toLowerCase();
  if (s === "ready")
    return { bg: colors.success, text: colors.white, label: "Ready" };
  if (s === "completed")
    return { bg: colors.gray3, text: colors.white, label: "Completed" };
  return { bg: colors.warning, text: colors.black, label: "Confirmed" };
}

export default function NewOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await apiFetch(`/employee/orders?status=confirmed`);
      const json = await res.json();
      if (!res.ok || !json?.ok)
        throw new Error(json?.error || "Failed to load");
      setOrders(Array.isArray(json.orders) ? json.orders : []);
    } catch (e) {
      setError(
        "Could not load orders. Make sure you are logged in as employee.",
      );
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  // Poll every 5s
  useEffect(() => {
    const id = setInterval(() => {
      load();
    }, 5000);
    return () => clearInterval(id);
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const hasOrders = useMemo(() => orders.length > 0, [orders.length]);

  const updateStatus = useCallback(
    async (orderId, status) => {
      setUpdatingId(orderId);
      try {
        const res = await apiFetch(`/orders/${orderId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        const json = await res.json();
        if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed");
        await load();
      } catch {
        setError("Could not update order.");
      } finally {
        setUpdatingId(null);
      }
    },
    [load],
  );

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>Loading new orders…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>New Orders</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {!hasOrders ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No confirmed orders</Text>
            <Text style={styles.emptySub}>
              We’ll auto-refresh every 5 seconds.
            </Text>
          </View>
        ) : (
          orders.map((o) => {
            const pill = statusPillStyle(o.status);
            return (
              <View key={String(o.id)} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tokenText}>TOKEN #{o.token}</Text>
                    <Text style={styles.metaText}>
                      {o.customer_name || "Customer"}
                    </Text>
                  </View>
                  <View style={[styles.pill, { backgroundColor: pill.bg }]}>
                    <Text style={[styles.pillText, { color: pill.text }]}>
                      {pill.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemsWrap}>
                  {(o.items || []).map((it, idx) => (
                    <Text key={`${o.id}-${idx}`} style={styles.itemText}>
                      • {it.name} ×{it.quantity}
                    </Text>
                  ))}
                </View>

                <View style={styles.bottomRow}>
                  <Text style={styles.totalText}>{formatMoney(o.total)}</Text>

                  <View style={styles.actions}>
                    <Pressable
                      onPress={() => updateStatus(o.id, "preparing")}
                      disabled={updatingId === o.id}
                      style={({ pressed }) => [
                        styles.acceptBtn,
                        pressed ? styles.btnPressed : null,
                        updatingId === o.id ? styles.btnDisabled : null,
                      ]}
                    >
                      <Text style={styles.acceptText}>Accept</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => updateStatus(o.id, "rejected")}
                      disabled={updatingId === o.id}
                      style={({ pressed }) => [
                        styles.rejectBtn,
                        pressed ? styles.btnPressed : null,
                        updatingId === o.id ? styles.btnDisabled : null,
                      ]}
                    >
                      <Text style={styles.rejectText}>Reject</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray5 },
  header: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray5,
  },
  title: { ...typography.h2, color: colors.gray1 },
  errorText: { ...typography.caption, color: colors.error, marginTop: 8 },
  scroll: { padding: 16, paddingBottom: 30 },
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
  tokenText: { ...typography.h3, color: colors.gray1 },
  metaText: { ...typography.caption, color: colors.gray2, marginTop: 4 },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  pillText: { ...typography.caption, fontWeight: "600" },
  itemsWrap: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.gray5,
  },
  itemText: { ...typography.body, color: colors.gray1, marginBottom: 4 },
  bottomRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalText: { ...typography.h2, color: colors.primary },
  actions: { flexDirection: "row", gap: 10 },
  acceptBtn: {
    backgroundColor: colors.success,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  acceptText: { ...typography.button, color: colors.white, fontSize: 14 },
  rejectBtn: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.error,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  rejectText: { ...typography.button, color: colors.error, fontSize: 14 },
  btnPressed: { opacity: 0.92 },
  btnDisabled: { opacity: 0.6 },
  emptyWrap: { marginTop: 60, alignItems: "center", paddingHorizontal: 20 },
  emptyTitle: { ...typography.h2, color: colors.gray1 },
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
  loadingText: { ...typography.body, color: colors.gray2, marginTop: 10 },
});
