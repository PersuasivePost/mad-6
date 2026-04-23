import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import colors from "../styles/colors";
import typography from "../styles/typography";
import { signIn } from "../services/auth";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      const user = await signIn(email, password);
      if (user?.role === "employee") {
        navigation.replace("EmployeeTabs");
      } else if (user?.role === "manager") {
        navigation.replace("ManagerDashboard");
      } else {
        navigation.replace("Home");
      }
    } catch (e) {
      switch (e?.message) {
        case "USER_NOT_FOUND":
          setError("No account found for this email.");
          break;
        case "INVALID_CREDENTIALS":
          setError("Incorrect email or password.");
          break;
        default:
          setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.logo}>QuickBite</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={styles.input}
              placeholderTextColor={colors.gray3}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••"
              secureTextEntry
              style={styles.input}
              placeholderTextColor={colors.gray3}
            />
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              pressed && !loading ? styles.buttonPressed : null,
              loading ? styles.buttonDisabled : null,
            ]}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("Register")}
            style={styles.linkWrap}
          >
            <Text style={styles.linkText}>Don’t have an account? Sign Up</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: colors.white,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    ...typography.h1,
    color: colors.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray2,
    marginTop: 8,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    textAlign: "center",
    marginBottom: 16,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  label: {
    ...typography.caption,
    color: colors.gray2,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray5,
    paddingHorizontal: 16,
    color: colors.gray1,
    ...typography.body,
  },
  button: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 8,
  },
  buttonPressed: {
    backgroundColor: colors.primaryDark,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    ...typography.button,
    color: colors.white,
  },
  linkWrap: {
    marginTop: 18,
    alignItems: "center",
  },
  linkText: {
    ...typography.bodyMedium,
    color: colors.secondary,
  },
});
