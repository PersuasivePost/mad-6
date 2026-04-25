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
import { Picker } from "@react-native-picker/picker";

import colors from "../styles/colors";
import typography from "../styles/typography";
import { signUp } from "../services/auth";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister() {
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const user = await signUp(name, email, password, role);
      if (user?.role === "employee") {
        navigation.replace("EmployeeTabs");
      } else if (user?.role === "manager") {
        navigation.replace("ManagerDashboard");
      } else {
        navigation.replace("Home");
      }
    } catch (e) {
      switch (e?.message) {
        case "EMAIL_EXISTS":
          setError("This email is already registered.");
          break;
        case "INVALID_INPUT":
          setError("Please enter valid details (password must be 6+ chars).");
          break;
        default:
          setError("Registration failed. Please try again.");
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join QuickBite in seconds</Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              style={styles.input}
              placeholderTextColor={colors.gray3}
            />
          </View>

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
            <Text style={styles.label}>Role</Text>
            <View style={styles.pickerWrap}>
              <Picker selectedValue={role} onValueChange={setRole}>
                <Picker.Item label="Student" value="student" />
                <Picker.Item label="Employee" value="employee" />
                <Picker.Item label="Manager" value="manager" />
              </Picker>
            </View>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="123456"
              secureTextEntry
              style={styles.input}
              placeholderTextColor={colors.gray3}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="123456"
              secureTextEntry
              style={styles.input}
              placeholderTextColor={colors.gray3}
            />
          </View>

          <Pressable
            onPress={handleRegister}
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
              <Text style={styles.buttonText}>Register</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.linkWrap}
          >
            <Text style={styles.linkText}>Already have an account? Login</Text>
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
    marginBottom: 18,
  },
  title: {
    ...typography.h2,
    color: colors.gray1,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray2,
    marginTop: 6,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    textAlign: "center",
    marginBottom: 12,
  },
  fieldBlock: {
    marginBottom: 12,
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
  pickerWrap: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray5,
    overflow: "hidden",
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
    marginTop: 16,
    alignItems: "center",
  },
  linkText: {
    ...typography.bodyMedium,
    color: colors.secondary,
  },
});
