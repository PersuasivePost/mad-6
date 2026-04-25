import { SafeAreaView, StyleSheet, View } from "react-native";
import { colors, spacing } from "../styles";

export default function ScreenContainer({ children, style, noPadding }) {
  return (
    <SafeAreaView style={[styles.safe, style]}>
      <View style={[styles.container, noPadding && styles.noPadding]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  container: { flex: 1, paddingHorizontal: spacing.md },
  noPadding: { paddingHorizontal: 0 },
});
