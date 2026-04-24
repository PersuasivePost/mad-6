/**
 * Live Order Tracking Screen
 * Matches Figma: token display, circular progress, step tracker,
 * vendor card, contact buttons
 */
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useStore from '../../lib/store';
import { colors, orderStatusColors } from '../../lib/theme';

const ORDER_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: 'receipt' },
  { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle' },
  { key: 'preparing', label: 'Preparing', icon: 'flame' },
  { key: 'ready', label: 'Ready for Pickup', icon: 'bag-check' },
  { key: 'picked_up', label: 'Completed', icon: 'checkmark-done-circle' },
];

export default function OrderTrackingScreen() {
  const router = useRouter();
  const { orderId, token } = useLocalSearchParams();
  const activeOrder = useStore((s) => s.activeOrder);

  // Mock order progress for demo
  const [currentStatus, setCurrentStatus] = useState(
    activeOrder?.status || 'confirmed'
  );
  const [progress] = useState(new Animated.Value(0));
  const displayToken = token || activeOrder?.pickup_token || '#42';

  const currentStepIndex = ORDER_STEPS.findIndex(
    (s) => s.key === currentStatus
  );
  const progressPercent = Math.round(
    ((currentStepIndex + 1) / ORDER_STEPS.length) * 100
  );

  useEffect(() => {
    Animated.timing(progress, {
      toValue: progressPercent / 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progressPercent]);

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-14 pb-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-lg text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
          Track Order
        </Text>
        <TouchableOpacity>
          <Ionicons name="search" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View className="items-center py-6 bg-primary-light mx-5 rounded-xl mb-6">
          <Text className="text-xs text-primary uppercase mb-1" style={{ fontFamily: 'Inter_600SemiBold' }}>
            YOUR ORDER IS BEING PREPARED
          </Text>
          <Text className="text-4xl text-text-primary mb-2" style={{ fontFamily: 'Inter_700Bold' }}>
            TOKEN {displayToken}
          </Text>

          {/* Circular Progress */}
          <View className="w-36 h-36 items-center justify-center my-4">
            <View
              className="absolute w-36 h-36 rounded-full border-8 border-border-light"
            />
            <View
              className="absolute w-36 h-36 rounded-full border-8"
              style={{
                borderColor: colors.primary,
                borderRightColor: 'transparent',
                borderBottomColor: progressPercent > 50 ? colors.primary : 'transparent',
                transform: [{ rotate: `${(progressPercent / 100) * 360}deg` }],
              }}
            />
            <Text className="text-3xl text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
              {progressPercent}%
            </Text>
          </View>

          <Text className="text-sm text-text-secondary" style={{ fontFamily: 'Inter_400Regular' }}>
            Ready in ~10 mins
          </Text>
        </View>

        {/* Status Details */}
        <View className="px-5">
          <Text className="text-lg text-text-primary mb-4" style={{ fontFamily: 'Inter_700Bold' }}>
            Status Details
          </Text>

          {ORDER_STEPS.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <View key={step.key} className="flex-row mb-0">
                {/* Timeline */}
                <View className="items-center mr-4 w-8">
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      isCompleted ? 'bg-primary' : 'bg-surface border border-border'
                    }`}
                  >
                    <Ionicons
                      name={step.icon}
                      size={16}
                      color={isCompleted ? '#fff' : colors.textTertiary}
                    />
                  </View>
                  {index < ORDER_STEPS.length - 1 && (
                    <View
                      className={`w-0.5 h-10 ${
                        index < currentStepIndex ? 'bg-primary' : 'bg-border'
                      }`}
                    />
                  )}
                </View>

                {/* Content */}
                <View className="flex-1 pb-6">
                  <Text
                    className={`text-sm ${
                      isCompleted ? 'text-text-primary' : 'text-text-tertiary'
                    }`}
                    style={{
                      fontFamily: isCurrent ? 'Inter_700Bold' : 'Inter_500Medium',
                    }}
                  >
                    {step.label}
                  </Text>
                  {isCompleted && (
                    <Text className="text-xs text-text-tertiary mt-0.5" style={{ fontFamily: 'Inter_400Regular' }}>
                      {isCurrent ? 'In progress...' : 'Today, 12:41 PM'}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Order Summary */}
        <View className="px-5 py-4 border-t border-border-light mt-2">
          <Text className="text-sm text-text-primary mb-3" style={{ fontFamily: 'Inter_700Bold' }}>
            Order Summary
          </Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-text-secondary" style={{ fontFamily: 'Inter_400Regular' }}>
              1x Chicken Wrap
            </Text>
            <Text className="text-sm text-text-primary" style={{ fontFamily: 'Inter_500Medium' }}>
              ₹110.00
            </Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-sm text-text-secondary" style={{ fontFamily: 'Inter_400Regular' }}>
              1x Cold Coffee (Large)
            </Text>
            <Text className="text-sm text-text-primary" style={{ fontFamily: 'Inter_500Medium' }}>
              ₹40.00
            </Text>
          </View>
          <View className="flex-row justify-between pt-2 border-t border-border-light">
            <Text className="text-sm text-text-secondary" style={{ fontFamily: 'Inter_500Medium' }}>
              Total Paid
            </Text>
            <Text className="text-base text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
              ₹150.00
            </Text>
          </View>
        </View>

        {/* Vendor Contact */}
        <View className="px-5 py-4 border-t border-border-light mb-4">
          <View className="bg-surface rounded-lg p-4">
            <Text className="text-sm text-text-primary mb-1" style={{ fontFamily: 'Inter_600SemiBold' }}>
              Campus Grill House
            </Text>
            <Text className="text-xs text-success mb-3" style={{ fontFamily: 'Inter_500Medium' }}>
              📍 ENGINEERING BLOCK A • COUNTER 4
            </Text>
            <View className="flex-row" style={{ gap: 8 }}>
              <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-primary rounded-md py-3">
                <Ionicons name="call" size={16} color="#fff" />
                <Text className="text-white text-sm ml-2" style={{ fontFamily: 'Inter_600SemiBold' }}>
                  Call Vendor
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 flex-row items-center justify-center border border-border rounded-md py-3">
                <Ionicons name="flag" size={16} color={colors.textSecondary} />
                <Text className="text-text-secondary text-sm ml-2" style={{ fontFamily: 'Inter_600SemiBold' }}>
                  Report Issue
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-5 pb-8">
          <TouchableOpacity
            className="bg-primary rounded-md py-4 items-center flex-row justify-center mb-3"
            activeOpacity={0.8}
          >
            <Ionicons name="navigate" size={18} color="#fff" />
            <Text className="text-white text-base ml-2" style={{ fontFamily: 'Inter_600SemiBold' }}>
              TRACK ORDER
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="border border-border rounded-md py-4 items-center flex-row justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="download-outline" size={18} color={colors.textSecondary} />
            <Text className="text-text-secondary text-base ml-2" style={{ fontFamily: 'Inter_600SemiBold' }}>
              DOWNLOAD INVOICE
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
