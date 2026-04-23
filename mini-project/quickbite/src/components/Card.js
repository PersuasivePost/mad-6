import { View, StyleSheet } from "react-native";
import { colors, shadowPresets, spacing } from "../styles";

export default function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    ...shadowPresets.card,
  },
});
