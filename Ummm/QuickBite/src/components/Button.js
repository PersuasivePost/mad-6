import { Pressable, Text, StyleSheet, Animated } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, typography } from "../styles";

export default function Button({
  title,
  onPress,
  variant = "primary",
  style,
  textStyle,
  disabled,
}) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  const handlePress = (e) => {
    if (!disabled) {
      if (variant === "primary") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress?.(e);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={({ pressed }) => [
        // base merged logically in animated view logic below
      ]}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.base,
            styles[variant],
            disabled && styles.disabled,
            pressed && styles.pressed,
            style,
            { transform: [{ scale }] },
          ]}
        >
          <Text style={[styles.textBase, styles[`${variant}Text`], textStyle]}>
            {title}
          </Text>
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.secondary },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.8 },
  textBase: { ...typography.button },
  primaryText: { color: colors.white },
  secondaryText: { color: colors.white },
  outlineText: { color: colors.primary },
});
