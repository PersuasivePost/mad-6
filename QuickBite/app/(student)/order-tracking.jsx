/**
 * Live Order Tracking Screen
 * Polls Supabase every 10s for status updates.
 * Shows real order items and vendor info from DB.
 */
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import useStore from '../../lib/store';
import { colors, orderStatusColors } from '../../lib/theme';

const ORDER_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: 'receipt' },
  { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle' },
  { key: 'preparing', label: 'Preparing', icon: 'flame' },
  { key: 'ready', label: 'Ready for Pickup', icon: 'bag-check' },
  { key: 'picked_up', label: 'Completed', icon: 'checkmark-done-circle' },
];

const STATUS_BANNERS = {
  pending: 'YOUR ORDER HAS BEEN PLACED',
  confirmed: 'YOUR ORDER IS CONFIRMED',
  preparing: 'YOUR ORDER IS BEING PREPARED',
  ready: '🎉 YOUR ORDER IS READY!',
  picked_up: 'ORDER COMPLETE',
  cancelled: 'ORDER CANCELLED',
};

export default function OrderTrackingScreen() {
  const router = useRouter();
  const { orderId, token } = useLocalSearchParams();
  const activeOrder = useStore((s) => s.activeOrder);
  const setActiveOrder = useStore((s) => s.setActiveOrder);

  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(activeOrder?.status || 'pending');
  const [progress] = useState(new Animated.Value(0));
  const pollRef = useRef(null);

  const displayToken = order?.pickup_token || token || activeOrder?.pickup_token || '--';

  const currentStepIndex = ORDER_STEPS.findIndex((s) => s.key === currentStatus);
  const progressPercent = Math.round(
    ((Math.max(0, currentStepIndex) + 1) / ORDER_STEPS.length) * 100
  );

  // Fetch order data + items + vendor
  const fetchOrderData = async () => {
    const oid = orderId || activeOrder?.id;
    if (!oid) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          vendor:vendors!vendor_id(name, location, image_url),
          order_items(
            quantity,
            price,
            menu_item:menu_items(name, food_type, image_url)
          )
        `)
        .eq('id', oid)
        .single();

      if (data && !error) {
        setOrder(data);
        setCurrentStatus(data.status);
        setOrderItems(data.order_items || []);
        setVendor(data.vendor);
        setActiveOrder(data);

        // Alert when ready
        if (data.status === 'ready' && currentStatus !== 'ready') {
          Alert.alert('🎉 Order Ready!', `Your order Token ${data.pickup_token} is ready for pickup!`);
        }
      }
    } catch (err) {
      console.error('Error fetching order:', err);
    }
  };

  useEffect(() => {
    fetchOrderData();

    // Poll every 10 seconds
    pollRef.current = setInterval(fetchOrderData, 10000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [orderId]);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: progressPercent / 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progressPercent]);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View className="items-center py-6 bg-primary-light mx-5 rounded-xl mb-6">
          <Text className="text-xs text-primary uppercase mb-1" style={{ fontFamily: 'Inter_600SemiBold' }}>
            {STATUS_BANNERS[currentStatus] || 'TRACKING ORDER'}
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

          {currentStatus === 'ready' && (
            <Text className="text-sm text-success" style={{ fontFamily: 'Inter_700Bold' }}>
              ✅ Collect your order now!
            </Text>
          )}
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
                      {isCurrent ? 'In progress...' : formatTime(order?.created_at)}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Order Summary — real items from DB */}
        <View className="px-5 py-4 border-t border-border-light mt-2">
          <Text className="text-sm text-text-primary mb-3" style={{ fontFamily: 'Inter_700Bold' }}>
            Order Summary
          </Text>
          {orderItems.length > 0 ? (
            orderItems.map((oi, idx) => (
              <View key={idx} className="flex-row justify-between mb-2">
                <Text className="text-sm text-text-secondary" style={{ fontFamily: 'Inter_400Regular' }}>
                  {oi.quantity}x {oi.menu_item?.name || 'Item'}
                </Text>
                <Text className="text-sm text-text-primary" style={{ fontFamily: 'Inter_500Medium' }}>
                  ₹{(oi.price * oi.quantity).toFixed(2)}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-sm text-text-tertiary" style={{ fontFamily: 'Inter_400Regular' }}>
              Loading items...
            </Text>
          )}
          <View className="flex-row justify-between pt-2 border-t border-border-light">
            <Text className="text-sm text-text-secondary" style={{ fontFamily: 'Inter_500Medium' }}>
              Total Paid
            </Text>
            <Text className="text-base text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
              ₹{Number(order?.total || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Vendor Contact — real vendor from DB */}
        <View className="px-5 py-4 border-t border-border-light mb-4">
          <View className="bg-surface rounded-lg p-4">
            <Text className="text-sm text-text-primary mb-1" style={{ fontFamily: 'Inter_600SemiBold' }}>
              {vendor?.name || 'Loading...'}
            </Text>
            <Text className="text-xs text-success mb-3" style={{ fontFamily: 'Inter_500Medium' }}>
              📍 {vendor?.location || 'Campus'}
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
      </ScrollView>
    </View>
  );
}
