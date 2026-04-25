/**
 * Forgot Password Screen
 * Matches Figma: email/phone input → send reset link
 */
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { colors } from '../../lib/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setSent(true);
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-14 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View className="px-6 items-center">
        {/* Icon */}
        <View className="w-20 h-20 rounded-full bg-primary-light items-center justify-center mb-6">
          <Ionicons name="key-outline" size={36} color={colors.primary} />
        </View>

        <Text className="text-2xl text-text-primary mb-2" style={{ fontFamily: 'Inter_700Bold' }}>
          Reset Password
        </Text>
        <Text className="text-sm text-text-secondary text-center mb-8" style={{ fontFamily: 'Inter_400Regular' }}>
          Enter your registered email or phone{'\n'}number and we'll send you a link to reset{'\n'}your password.
        </Text>

        {sent ? (
          <View className="items-center">
            <View className="w-16 h-16 rounded-full bg-success-light items-center justify-center mb-4">
              <Ionicons name="checkmark-circle" size={36} color={colors.success} />
            </View>
            <Text className="text-lg text-text-primary mb-2 text-center" style={{ fontFamily: 'Inter_600SemiBold' }}>
              Reset Link Sent!
            </Text>
            <Text className="text-sm text-text-secondary text-center mb-8" style={{ fontFamily: 'Inter_400Regular' }}>
              Check your email for the password{'\n'}reset link.
            </Text>
            <TouchableOpacity
              className="bg-primary rounded-md py-4 w-full items-center"
              onPress={() => router.replace('/(auth)/login')}
              activeOpacity={0.8}
            >
              <Text className="text-white text-base" style={{ fontFamily: 'Inter_600SemiBold' }}>
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text className="text-sm text-text-primary mb-2 self-start" style={{ fontFamily: 'Inter_500Medium' }}>
              Email or Phone Number
            </Text>
            <TextInput
              className="border border-border rounded-md px-4 py-3 mb-6 text-base text-text-primary bg-surface w-full"
              style={{ fontFamily: 'Inter_400Regular' }}
              placeholder="Enter your email or phone"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              className="bg-primary rounded-md py-4 w-full items-center flex-row justify-center mb-6"
              onPress={handleReset}
              disabled={loading}
              activeOpacity={0.8}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text className="text-white text-base mr-2" style={{ fontFamily: 'Inter_600SemiBold' }}>
                    Send Reset Link
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center">
              <Text className="text-sm text-text-secondary" style={{ fontFamily: 'Inter_400Regular' }}>
                Remember password?{' '}
              </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text className="text-sm text-primary" style={{ fontFamily: 'Inter_600SemiBold' }}>
                    Login
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
