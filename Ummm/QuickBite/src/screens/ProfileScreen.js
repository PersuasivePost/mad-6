import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import colors from "../styles/colors";
import typography from "../styles/typography";
import { logout } from "../services/auth";

// For Android emulator use: http://10.0.2.2:4000
// For Expo Go on phone: use your PC's LAN IP (same Wi‑Fi), e.g. http://192.168.1.34:4000
const API_BASE_URL = "http://localhost:4000";

function initials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "U";
  const first = parts[0]?.[0] || "U";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
}

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const avatarUri = user?.photoUrl || user?.photoURL || "";

  const loadUser = useCallback(async () => {
    setError("");
    try {
      const raw = await AsyncStorage.getItem("user");
      const u = raw ? JSON.parse(raw) : null;
      setUser(u);
      setFullName(String(u?.name || ""));
    } catch (e) {
      setUser(null);
      setFullName("");
      setError("Could not load profile.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadUser();
      setLoading(false);
    })();
  }, [loadUser]);

  const canSave = useMemo(() => {
    const n = String(fullName || "").trim();
    return !!n && n !== String(user?.name || "");
  }, [fullName, user?.name]);

  const handleSave = useCallback(async () => {
    const nextName = String(fullName || "").trim();
    if (!nextName) {
      Alert.alert("Full Name required", "Please enter your full name.");
      return;
    }

    const id = Number(user?.id);
    if (!Number.isFinite(id)) {
      // Your current local auth doesn't store a DB id; we keep UI working anyway.
      Alert.alert(
        "Not linked to backend",
        "This account doesn't have a database user id yet. (user.id is missing)\n\nTip: create a DB user row and store its id in AsyncStorage 'user'.",
      );
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nextName }),
      });

      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Failed to update user");
      }

      // Update local session user so rest of the app shows the new name.
      const updatedUser = { ...user, name: json.user?.name ?? nextName };
      setUser(updatedUser);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      Alert.alert("Saved", "Your name has been updated.");
    } catch (e) {
      setError("Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [fullName, user, navigation]);

  const handleLogout = useCallback(() => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        },
      },
    ]);
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile…</Text>
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
            <Text style={styles.title}>Profile</Text>
          </View>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.profileRow}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{initials(user?.name)}</Text>
              </View>
            )}

            <View style={{ flex: 1 }}>
              <Text style={styles.nameText}>{user?.name || "User"}</Text>
              <Text style={styles.emailText}>{user?.email || ""}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account</Text>

          <Text style={styles.label}>Full Name</Text>
          <View style={styles.nameRow}>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor={colors.gray3}
              style={[styles.input, isFocused ? styles.inputFocused : null]}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />

            <Pressable
              onPress={handleSave}
              disabled={!canSave || saving}
              style={({ pressed }) => [
                styles.saveBtn,
                pressed && !saving ? styles.saveBtnPressed : null,
                !canSave || saving ? styles.saveBtnDisabled : null,
              ]}
            >
              {saving ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save</Text>
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <Pressable style={styles.listItem}>
            <Text style={styles.listItemText}>Dietary Preferences</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.listItem}>
            <Text style={styles.listItemText}>Notifications</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
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
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: 8,
  },
  scroll: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
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
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarImg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gray5,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  avatarText: {
    ...typography.h3,
    color: colors.white,
  },
  nameText: {
    ...typography.h3,
    color: colors.gray1,
  },
  emailText: {
    ...typography.body,
    color: colors.gray2,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.gray1,
    marginBottom: 10,
  },
  label: {
    ...typography.caption,
    color: colors.gray2,
    marginBottom: 6,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray4,
    paddingHorizontal: 12,
    color: colors.gray1,
    ...typography.body,
    backgroundColor: colors.white,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 74,
  },
  saveBtnPressed: {
    backgroundColor: colors.primaryDark,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    ...typography.button,
    color: colors.white,
    fontSize: 14,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  listItemText: {
    ...typography.bodyMedium,
    color: colors.gray1,
  },
  chevron: {
    ...typography.h3,
    color: colors.gray3,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray5,
  },
  logoutBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  logoutText: {
    ...typography.bodyMedium,
    color: colors.error,
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
