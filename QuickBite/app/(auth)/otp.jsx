/**
 * OTP Verification Screen
 * Matches Figma: 6-digit OTP input with timer and resend
 */
import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';

export default function OTPScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(28);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter the complete OTP.');
      return;
    }
    setLoading(true);
    // Mock verification — in production, verify with Supabase
    setTimeout(() => {
      setLoading(false);
      router.replace('/(auth)/complete-profile');
    }, 1500);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
          <Ionicons name="chatbubble-ellipses-outline" size={36} color={colors.primary} />
        </View>

        <Text className="text-2xl text-text-primary mb-2" style={{ fontFamily: 'Inter_700Bold' }}>
          Verify Your Phone
        </Text>
        <Text className="text-sm text-text-secondary text-center mb-8" style={{ fontFamily: 'Inter_400Regular' }}>
          OTP sent to +91-XXXXX-XXX90
        </Text>

        {/* OTP Inputs */}
        <View className="flex-row justify-center mb-6" style={{ gap: 12 }}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputs.current[index] = ref)}
              className={`w-12 h-14 border-2 rounded-md text-center text-xl text-text-primary ${
                digit ? 'border-primary bg-primary-light' : 'border-border bg-surface'
              }`}
              style={{ fontFamily: 'Inter_700Bold' }}
              maxLength={1}
              keyboardType="number-pad"
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
            />
          ))}
        </View>

        {/* Timer & Resend */}
        <View className="flex-row items-center mb-8">
          <Ionicons name="time-outline" size={16} color={colors.textTertiary} />
          <Text className="text-sm text-text-tertiary ml-1" style={{ fontFamily: 'Inter_400Regular' }}>
            Resend OTP in {formatTime(timer)}
          </Text>
        </View>

        {timer === 0 && (
          <TouchableOpacity onPress={() => setTimer(28)} className="mb-6">
            <Text className="text-sm text-primary" style={{ fontFamily: 'Inter_600SemiBold' }}>
              Resend OTP
            </Text>
          </TouchableOpacity>
        )}

        {/* Verify Button */}
        <TouchableOpacity
          className="bg-primary rounded-md py-4 w-full items-center mb-4"
          onPress={handleVerify}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-base" style={{ fontFamily: 'Inter_600SemiBold' }}>
              Verify
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-sm text-primary" style={{ fontFamily: 'Inter_500Medium' }}>
            Change Number
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
