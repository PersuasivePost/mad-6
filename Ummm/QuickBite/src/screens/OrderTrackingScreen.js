import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import colors from "../styles/colors";
import typography from "../styles/typography";
import Button from "../components/Button";
import { Alert } from "react-native";

// For Android emulator: http://10.0.2.2:4000
// For Expo Go on phone: use your PC's LAN IP
const API_BASE_URL = "http://localhost:4000";

const STEPS = [
  { key: "placed", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function stepIndexFromStatus(status) {
  const s = String(status || "").toLowerCase();
  const idx = STEPS.findIndex((x) => x.key === s);
  return idx === -1 ? 0 : idx;
}

export default function OrderTrackingScreen({ navigation, route }) {
  const { orderId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("placed");

  const currentIdx = useMemo(() => stepIndexFromStatus(status), [status]);

  const fetchStatus = useCallback(async () => {
    if (!orderId) {
      setError("Missing orderId");
      setLoading(false);
      return;
    }

    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`);
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Failed to fetch status");
      }
      setStatus(json.status);
    } catch (e) {
      setError(
        "Could not reach server. Start backend on port 4000 and update API_BASE_URL if needed.",
      );
    }
  }, [orderId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      setLoading(true);
      await fetchStatus();
      if (!mounted) return;
      setLoading(false);
    })();

    const interval = setInterval(() => {
      fetchStatus();
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [fetchStatus]);

  const handleCancelOrder = () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order? The refund will be added to your wallet.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(
                `${API_BASE_URL}/orders/${orderId}/status`,
                {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: "cancelled" }),
                },
              );
              const json = await res.json();
              if (!res.ok || !json?.ok)
                throw new Error(json?.error || "Failed to cancel");

              Alert.alert(
                "Success",
                "Order cancelled and refunded to your wallet.",
              );
              await fetchStatus();
            } catch (e) {
              Alert.alert("Error", "Could not cancel order: " + e.message);
            }
          },
        },
      ],
    );
  };

  function renderStep(step, idx) {
    // Hide default steps if cancelled
    if (status === "cancelled" && step.key !== "cancelled") return null;
    if (status !== "cancelled" && step.key === "cancelled") return null;

    const isCompleted = status === "cancelled" ? true : idx < currentIdx;
    const isCurrent = status === "cancelled" ? true : idx === currentIdx;
    const dotColor = isCompleted
      ? colors.success
      : isCurrent
        ? colors.primary
        : colors.gray4;
    const lineColor = isCompleted ? colors.success : colors.gray4;
    const textColor = isCompleted
      ? colors.gray1
      : isCurrent
        ? colors.primary
        : colors.gray3;

    return (
      <View key={step.key} style={styles.stepRow}>
        <View style={styles.leftCol}>
          <View style={[styles.dot, { backgroundColor: dotColor }]} />
          {idx < STEPS.length - 1 ? (
            <View style={[styles.line, { backgroundColor: lineColor }]} />
          ) : null}
        </View>
        <View style={styles.rightCol}>
          <Text style={[styles.stepLabel, { color: textColor }]}>
            {step.label}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Track Order</Text>
          <Text style={styles.sub}>Order ID: {String(orderId ?? "--")}</Text>
        </View>
        {(status === "placed" || status === "confirmed") && (
          <Button
            title="Cancel"
            variant="outline"
            onPress={handleCancelOrder}
            style={{
              height: 36,
              paddingHorizontal: 12,
              borderColor: colors.error,
            }}
            textStyle={{ color: colors.error, fontSize: 12 }}
          />
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Fetching status…</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={styles.card}>{STEPS.map(renderStep)}</View>
          <Text style={styles.pollHint}>Updates every 5 seconds.</Text>
        </View>
      )}
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
  sub: {
    ...typography.caption,
    color: colors.gray2,
    marginTop: 2,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 56,
  },
  leftCol: {
    width: 32,
    alignItems: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 2,
  },
  line: {
    width: 3,
    flex: 1,
    borderRadius: 2,
    marginTop: 6,
    marginBottom: 2,
  },
  rightCol: {
    flex: 1,
    paddingBottom: 10,
  },
  stepLabel: {
    ...typography.bodyMedium,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginBottom: 10,
  },
  pollHint: {
    ...typography.caption,
    color: colors.gray3,
    marginTop: 10,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.white,
  },
  loadingText: {
    ...typography.body,
    color: colors.gray2,
    marginTop: 10,
  },
});
