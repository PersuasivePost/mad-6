import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useCart } from "../context/CartContext";
import colors from "../styles/colors";
import typography from "../styles/typography";

// For Android emulator use: http://10.0.2.2:4000
// For Expo Go on phone: use your PC's LAN IP (same Wi‑Fi)
const API_BASE_URL = "http://localhost:4000";

function formatMoney(value) {
  const n = Number(value || 0);
  return `₹${n.toFixed(0)}`;
}

function isVeg(vegNonveg) {
  return String(vegNonveg || "").toLowerCase() === "veg";
}

export default function StallDetailScreen({ navigation, route }) {
  const { stallId, stallName, isOpen, prepTime } = route.params || {};
  const { addToCart, getCartCount } = useCart();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuItems, setMenuItems] = useState([]);

  const cartCount = getCartCount();

  const headerMeta = useMemo(() => {
    return {
      name: stallName || `Stall #${String(stallId ?? "")}`,
      ratingText: "4.5 ★",
      statusText: isOpen === false ? "Closed" : "Open Now",
      statusColor: isOpen === false ? colors.error : colors.success,
      prepText: prepTime ? `🕒 ${prepTime}` : "🕒 10-15 min",
    };
  }, [isOpen, prepTime, stallId, stallName]);

  const fetchMenu = useCallback(async () => {
    if (!stallId) {
      setError("Missing stallId");
      setLoading(false);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/menu/${stallId}`);
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Failed to load menu");
      }
      setMenuItems(Array.isArray(json.menu) ? json.menu : []);
    } catch (e) {
      setError(
        "Could not reach server. Start backend on port 4000 and update API_BASE_URL if needed.",
      );
    } finally {
      setLoading(false);
    }
  }, [stallId]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  function onAdd(item) {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      stallId,
      stallName: headerMeta.name,
      veg_nonveg: item.veg_nonveg,
    });
  }

  function renderBanner() {
    return (
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Stall Banner</Text>
      </View>
    );
  }

  function renderStallHeader() {
    return (
      <View style={styles.headerWrap}>
        {renderBanner()}
        <View style={styles.headerTopRow}>
          <Text style={styles.stallName}>{headerMeta.name}</Text>
          <Text style={styles.rating}>{headerMeta.ratingText}</Text>
        </View>

        <View style={styles.headerMetaRow}>
          <View style={styles.statusRow}>
            <View
              style={[styles.dot, { backgroundColor: headerMeta.statusColor }]}
            />
            <Text style={styles.statusText}>{headerMeta.statusText}</Text>
          </View>
          <Text style={styles.prepText}>{headerMeta.prepText}</Text>
        </View>

        <Text style={styles.sectionTitle}>Menu</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  function renderMenuItem({ item }) {
    const veg = isVeg(item.veg_nonveg);
    const dotColor = veg ? colors.veg : colors.nonveg;

    return (
      <View style={styles.menuCard}>
        <View style={styles.menuRow}>
          <View style={styles.menuLeft}>
            <View style={[styles.foodDot, { backgroundColor: dotColor }]} />
            <View style={styles.menuTextCol}>
              <Text style={styles.menuName}>{item.name}</Text>
              <Text style={styles.menuPrice}>{formatMoney(item.price)}</Text>
            </View>
          </View>

          <Pressable
            onPress={() => onAdd(item)}
            style={({ pressed }) => [
              styles.addBtn,
              pressed ? styles.addBtnPressed : null,
            ]}
          >
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Loading menu…</Text>
        </View>
      ) : (
        <FlatList
          data={menuItems}
          keyExtractor={(x) => String(x.id)}
          renderItem={renderMenuItem}
          ListHeaderComponent={renderStallHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pressable
        onPress={() => navigation.navigate("Cart")}
        style={({ pressed }) => [
          styles.fab,
          pressed ? styles.fabPressed : null,
        ]}
        hitSlop={12}
      >
        <Text style={styles.fabIcon}>🛒</Text>
        {cartCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartCount}</Text>
          </View>
        ) : null}
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray5,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  banner: {
    height: 140,
    borderRadius: 16,
    backgroundColor: colors.gray4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  bannerText: {
    ...typography.bodyMedium,
    color: colors.gray2,
  },
  headerWrap: {
    marginBottom: 10,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stallName: {
    ...typography.h2,
    color: colors.gray1,
    flex: 1,
    marginRight: 12,
  },
  rating: {
    ...typography.bodyMedium,
    color: colors.gray1,
  },
  headerMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
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
  sectionTitle: {
    ...typography.h3,
    color: colors.gray1,
    marginTop: 18,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: 8,
  },
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  foodDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  menuTextCol: {
    flex: 1,
  },
  menuName: {
    ...typography.bodyMedium,
    color: colors.gray1,
  },
  menuPrice: {
    ...typography.caption,
    color: colors.gray2,
    marginTop: 2,
  },
  addBtn: {
    height: 32,
    minWidth: 72,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnPressed: {
    backgroundColor: colors.primaryDark,
  },
  addBtnText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: "700",
  },
  fab: {
    position: "absolute",
    right: 18,
    bottom: 18,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  fabPressed: {
    backgroundColor: colors.primaryDark,
  },
  fabIcon: {
    fontSize: 18,
    color: colors.white,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    ...typography.caption,
    color: colors.black,
    fontWeight: "700",
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
