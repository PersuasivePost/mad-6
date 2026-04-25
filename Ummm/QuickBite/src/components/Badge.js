import { View, Text, StyleSheet } from "react-native";
import { colors, typography } from "../styles";

export default function Badge({ label, status = "info", style }) {
  return (
    <View style={[styles.badge, styles[`${status}Bg`], style]}>
      <Text style={[styles.text, styles[`${status}Text`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  text: { ...typography.caption, fontWeight: "600" },
  successBg: { backgroundColor: `${colors.success}20` },
  successText: { color: colors.success },
  warningBg: { backgroundColor: `${colors.warning}20` },
  warningText: { color: colors.warning },
  errorBg: { backgroundColor: `${colors.error}20` },
  errorText: { color: colors.error },
  infoBg: { backgroundColor: `${colors.primary}20` },
  infoText: { color: colors.primary },
});
