import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import colors from "../styles/colors";
import typography from "../styles/typography";

// For Android emulator use: http://10.0.2.2:4000
// For Expo Go on phone: use your PC's LAN IP (same Wi‑Fi), e.g. http://192.168.1.34:4000
const API_BASE_URL = "http://localhost:4000";

function tinyPrepTime(prepTime) {
  if (!prepTime) return "";
  // Convert "10-15 min" -> "~15 mins" (simple heuristic)
  const match = String(prepTime).match(/(\d+)\s*[-–]\s*(\d+)/);
  if (match) return `~${match[2]} mins`;
  return String(prepTime).includes("min") ? `~${prepTime}` : prepTime;
}

export default function HomeScreen({ navigation }) {
  const [userName, setUserName] = useState("");
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadUser = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem("user");
      if (!raw) return;
      const u = JSON.parse(raw);
      setUserName(u?.name || "");
    } catch {
      // ignore
    }
  }, []);

  const fetchStalls = useCallback(async () => {
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/stalls`);
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Failed to load stalls");
      }
      setStalls(Array.isArray(json.stalls) ? json.stalls : []);
    } catch (e) {
      setError(
        "Could not reach server. Start backend on port 4000 and update API_BASE_URL if needed.",
      );
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadUser();
      await fetchStalls();
      setLoading(false);
    })();
  }, [fetchStalls, loadUser]);

  async function onRefresh() {
    setRefreshing(true);
    await fetchStalls();
    setRefreshing(false);
  }

  function renderHeader() {
    return (
      <View style={styles.headerWrap}>
        <View style={styles.headerTopRow}>
          <Text style={styles.greeting}>Hi, {userName || "there"}!</Text>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => navigation.navigate("OrderHistory")}
              style={({ pressed }) => [
                styles.ordersBtn,
                pressed ? styles.ordersBtnPressed : null,
              ]}
            >
              <Text style={styles.ordersBtnText}>Orders</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("Profile")}
              style={({ pressed }) => [
                styles.profileBtn,
                pressed ? styles.profileBtnPressed : null,
              ]}
            >
              <Text style={styles.profileBtnText}>Profile</Text>
            </Pressable>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Popular Stalls</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  function renderItem({ item }) {
    const isOpen = !!item.is_open;
    const statusColor = isOpen ? colors.success : colors.error;
    const statusText = isOpen ? "Open Now" : "Closed";
    const prep = tinyPrepTime(item.prep_time);

    return (
      <Pressable
        onPress={() =>
          navigation.navigate("StallDetail", {
            stallId: item.id,
            stallName: item.name,
            isOpen: !!item.is_open,
            prepTime: item.prep_time,
          })
        }
        style={({ pressed }) => [
          styles.card,
          pressed ? styles.cardPressed : null,
        ]}
      >
        <Text style={styles.cardTitle}>{item.name}</Text>
        {!!item.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: statusColor }]} />
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
          {prep ? <Text style={styles.prepText}>🕒 {prep}</Text> : null}
        </View>
      </Pressable>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>Loading stalls…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={stalls}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray5,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 24,
  },
  headerWrap: {
    marginBottom: 12,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  greeting: {
    ...typography.h2,
    color: colors.gray1,
    marginBottom: 10,
  },
  ordersBtn: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  ordersBtnPressed: {
    opacity: 0.92,
  },
  ordersBtnText: {
    ...typography.bodyMedium,
    color: colors.white,
  },
  profileBtn: {
    backgroundColor: colors.gray4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  profileBtnPressed: {
    opacity: 0.92,
  },
  profileBtnText: {
    ...typography.bodyMedium,
    color: colors.gray1,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.gray1,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
  },
  cardTitle: {
    ...typography.h3,
    color: colors.gray1,
  },
  cardDesc: {
    ...typography.caption,
    color: colors.gray2,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    ...typography.caption,
    color: colors.gray2,
  },
  prepText: {
    ...typography.caption,
    color: colors.gray2,
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
