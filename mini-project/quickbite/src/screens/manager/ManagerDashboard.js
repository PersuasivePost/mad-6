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

import colors from "../../styles/colors";
import typography from "../../styles/typography";
import { apiFetch } from "../../services/api";
import { logout } from "../../services/auth";

export default function ManagerDashboard({ navigation }) {
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await apiFetch(`/stalls`);
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed");
      setStalls(Array.isArray(json.stalls) ? json.stalls : []);
    } catch {
      setError("Could not load stalls.");
      setStalls([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Manager Dashboard</Text>
          <Pressable onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
        <Text style={styles.subTitle}>Select a stall to manage its menu</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <FlatList
        data={stalls}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            {item.description ? (
              <Text style={styles.cardDesc} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}

            <View style={styles.cardFooter}>
              <Pressable
                onPress={() =>
                  navigation.navigate("MenuManagement", {
                    stallId: item.id,
                    stallName: item.name,
                  })
                }
                style={({ pressed }) => [
                  styles.manageBtn,
                  pressed ? styles.manageBtnPressed : null,
                ]}
              >
                <Text style={styles.manageBtnText}>Manage Menu</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { ...typography.h2, color: colors.gray1 },
  subTitle: { ...typography.bodyMedium, color: colors.gray2, marginTop: 4 },
  logoutBtn: { padding: 8 },
  logoutText: { ...typography.bodyMedium, color: colors.error },
  errorText: { ...typography.caption, color: colors.error, marginTop: 8 },
  list: { padding: 16, paddingBottom: 30 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardTitle: { ...typography.h3, color: colors.gray1 },
  cardDesc: { ...typography.caption, color: colors.gray2, marginTop: 4 },
  cardFooter: { marginTop: 14, alignItems: "flex-end" },
  manageBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  manageBtnPressed: { backgroundColor: colors.gray5 },
  manageBtnText: { ...typography.button, color: colors.primary, fontSize: 14 },
  loadingWrap: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { ...typography.body, color: colors.gray2, marginTop: 10 },
});
