import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { useCart } from "../context/CartContext";
import colors from "../styles/colors";
import typography from "../styles/typography";

export default function OrderConfirmationScreen({ navigation, route }) {
  const { token, orderId, total } = route.params || {};
  const { clearCart } = useCart();

  const scale = useRef(new Animated.Value(0.4)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 120,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  function onBackToHome() {
    clearCart();
    navigation.navigate("Home");
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.iconWrap, { transform: [{ scale }], opacity }]}
      >
        <View style={styles.successCircle}>
          <Text style={styles.check}>✓</Text>
        </View>
      </Animated.View>

      <Text style={styles.heading}>Order Placed Successfully!</Text>

      <View style={styles.tokenBox}>
        <Text style={styles.tokenText}>TOKEN #{String(token ?? "--")}</Text>
      </View>

      <Text style={styles.orderId}>Order ID: {String(orderId ?? "--")}</Text>
      <Text style={styles.eta}>Ready in ~20 mins</Text>

      <View style={styles.actionsRow}>
        <Pressable
          onPress={() => navigation.navigate("OrderTracking", { orderId })}
          style={({ pressed }) => [
            styles.btnOutline,
            pressed ? styles.btnOutlinePressed : null,
          ]}
        >
          <Text style={styles.btnOutlineText}>Track Order</Text>
        </Pressable>

        <Pressable
          onPress={onBackToHome}
          style={({ pressed }) => [
            styles.btnFilled,
            pressed ? styles.btnFilledPressed : null,
          ]}
        >
          <Text style={styles.btnFilledText}>Back to Home</Text>
        </Pressable>
      </View>

      {/* Keeping total available for future UI, but not required to display per spec */}
      <Text style={styles.hiddenMeta} accessibilityElementsHidden>
        {String(total ?? "")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrap: {
    marginBottom: 14,
  },
  successCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  check: {
    fontSize: 44,
    fontWeight: "900",
    color: colors.white,
    lineHeight: 48,
  },
  heading: {
    ...typography.h1,
    color: colors.gray1,
    textAlign: "center",
    marginBottom: 18,
  },
  tokenBox: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 420,
    marginBottom: 14,
  },
  tokenText: {
    ...typography.h1,
    color: colors.primary,
    fontWeight: "900",
    textAlign: "center",
  },
  orderId: {
    ...typography.caption,
    color: colors.gray3,
    marginTop: 2,
  },
  eta: {
    ...typography.body,
    color: colors.gray2,
    marginTop: 6,
    marginBottom: 18,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    maxWidth: 420,
  },
  btnOutline: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  btnOutlinePressed: {
    backgroundColor: colors.gray5,
  },
  btnOutlineText: {
    ...typography.button,
    color: colors.primary,
  },
  btnFilled: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  btnFilledPressed: {
    backgroundColor: colors.primaryDark,
  },
  btnFilledText: {
    ...typography.button,
    color: colors.white,
  },
  hiddenMeta: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
});
