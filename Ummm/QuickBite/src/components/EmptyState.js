import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { typography, colors, spacing } from "../styles";
import Button from "./Button";

export default function EmptyState({
  icon = "cafe-outline",
  title,
  message,
  ctaLabel,
  onCtaPress,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons
        name={icon}
        size={64}
        color={colors.gray3}
        style={styles.icon}
      />
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {ctaLabel && onCtaPress && (
        <Button
          title={ctaLabel}
          onPress={onCtaPress}
          variant="outline"
          style={styles.btn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    minHeight: 300,
  },
  icon: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.gray1,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.body,
    color: colors.gray2,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  btn: {
    minWidth: 160,
  },
});
