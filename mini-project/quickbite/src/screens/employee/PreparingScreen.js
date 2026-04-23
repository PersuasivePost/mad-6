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

export default function PreparingScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await apiFetch(`/employee/orders?status=preparing`);
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed");
      setOrders(Array.isArray(json.orders) ? json.orders : []);
    } catch {
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

  const markReady = useCallback(
    async (orderId) => {
      setUpdatingId(orderId);
      try {
        const res = await apiFetch(`/orders/${orderId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "ready" }),
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
        <Text style={styles.loadingText}>Loading preparing…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Preparing</Text>
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
            <Text style={styles.emptyTitle}>No preparing orders</Text>
            <Text style={styles.emptySub}>
              We’ll auto-refresh every 5 seconds.
            </Text>
          </View>
        ) : (
          orders.map((o) => (
            <View key={String(o.id)} style={styles.card}>
              <View style={styles.cardTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tokenText}>TOKEN #{o.token}</Text>
                  <Text style={styles.metaText}>
                    {o.customer_name || "Customer"}
                  </Text>
                </View>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>Preparing</Text>
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
                <Pressable
                  onPress={() => markReady(o.id)}
                  disabled={updatingId === o.id}
                  style={({ pressed }) => [
                    styles.readyBtn,
                    pressed ? styles.btnPressed : null,
                    updatingId === o.id ? styles.btnDisabled : null,
                  ]}
                >
                  <Text style={styles.readyBtnText}>
                    {updatingId === o.id ? "Updating…" : "Ready"}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
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
  pill: {
    backgroundColor: colors.warning,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillText: { ...typography.caption, fontWeight: "600", color: colors.black },
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
  readyBtn: {
    backgroundColor: colors.success,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  readyBtnText: { ...typography.button, color: colors.white, fontSize: 14 },
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
