/**
 * Login Screen
 * Matches Figma: "Welcome Back!" heading, email/password inputs,
 * orange Login button, Google sign-in, link to register.
 */
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase, fetchProfile } from '../../lib/supabase';
import useStore from '../../lib/store';
import { colors } from '../../lib/theme';

export default function LoginScreen() {
  const router = useRouter();
  const setProfile = useStore((s) => s.setProfile);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        Alert.alert('Login Failed', error.message);
        return;
      }

      // Fetch profile and redirect will happen in root layout
      if (data?.user) {
        const profile = await fetchProfile(data.user.id);
        if (profile) {
          setProfile(profile);
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Illustration Area */}
        <View className="items-center pt-16 pb-8 bg-primary-light">
          <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-4">
            <Text className="text-white text-3xl">🍔</Text>
          </View>
          <Text
            className="text-2xl text-primary font-inter-bold"
            style={{ fontFamily: 'Inter_700Bold' }}
          >
            QuickBite
          </Text>
          <Text
            className="text-xs text-text-secondary mt-1"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            Skip the Queue, Savor the Time
          </Text>
        </View>

        {/* Login Form */}
        <View className="px-6 pt-8">
          <Text
            className="text-2xl text-text-primary mb-2 text-center"
            style={{ fontFamily: 'Inter_700Bold' }}
          >
            Welcome Back!
          </Text>
          <Text
            className="text-sm text-text-secondary mb-8 text-center"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            Login to your QuickBite account to skip the{'\n'}
            campus canteen queues.
          </Text>

          {/* Email Input */}
          <Text
            className="text-sm text-text-primary mb-2"
            style={{ fontFamily: 'Inter_500Medium' }}
          >
            Email or Phone
          </Text>
          <View className="flex-row items-center border border-border rounded-md px-4 py-3 mb-4 bg-surface">
            <Ionicons name="mail-outline" size={20} color={colors.textTertiary} />
            <TextInput
              className="flex-1 ml-3 text-base text-text-primary"
              style={{ fontFamily: 'Inter_400Regular' }}
              placeholder="Enter your email or phone"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* Password Input */}
          <Text
            className="text-sm text-text-primary mb-2"
            style={{ fontFamily: 'Inter_500Medium' }}
          >
            Password
          </Text>
          <View className="flex-row items-center border border-border rounded-md px-4 py-3 mb-2 bg-surface">
            <Ionicons name="lock-closed-outline" size={20} color={colors.textTertiary} />
            <TextInput
              className="flex-1 ml-3 text-base text-text-primary"
              style={{ fontFamily: 'Inter_400Regular' }}
              placeholder="Enter your password"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            className="self-end mb-6"
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <Text
              className="text-sm text-primary"
              style={{ fontFamily: 'Inter_500Medium' }}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            className="bg-primary rounded-md py-4 items-center mb-6"
            style={{ opacity: loading ? 0.7 : 1 }}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                className="text-white text-base"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                LOGIN
              </Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-border" />
            <Text
              className="mx-4 text-sm text-text-tertiary"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              OR
            </Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          {/* Google Sign In */}
          <TouchableOpacity
            className="flex-row items-center justify-center border border-border rounded-md py-4 mb-8"
            activeOpacity={0.7}
          >
            <Text className="text-lg mr-2">🇬</Text>
            <Text
              className="text-base text-text-primary"
              style={{ fontFamily: 'Inter_500Medium' }}
            >
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View className="flex-row justify-center pb-8">
            <Text
              className="text-sm text-text-secondary"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              Don't have an account?{' '}
            </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text
                  className="text-sm text-primary"
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
