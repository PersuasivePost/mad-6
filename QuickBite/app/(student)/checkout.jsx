/**
 * Checkout / Payment Screen
 * Matches Figma: order total, wallet, UPI, cards, PAY button
 * Uses mock payment function (Razorpay to be wired later)
 */
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createOrder, mockPayment } from '../../lib/supabase';
import useStore from '../../lib/store';
import { colors } from '../../lib/theme';

const PLATFORM_FEE = 25;
const GST_RATE = 0.05;

export default function CheckoutScreen() {
  const router = useRouter();
  const session = useStore((s) => s.session);
  const profile = useStore((s) => s.profile);
  const cartItems = useStore((s) => s.cartItems);
  const cartVendorId = useStore((s) => s.cartVendorId);
  const cartVendorName = useStore((s) => s.cartVendorName);
  const specialInstructions = useStore((s) => s.specialInstructions);
  const getCartSubtotal = useStore((s) => s.getCartSubtotal);
  const couponDiscount = useStore((s) => s.couponDiscount);
  const clearCart = useStore((s) => s.clearCart);
  const setActiveOrder = useStore((s) => s.setActiveOrder);

  const [selectedMethod, setSelectedMethod] = useState('wallet');
  const [loading, setLoading] = useState(false);

  const subtotal = getCartSubtotal();
  const gst = Math.round(subtotal * GST_RATE * 100) / 100;
  const total = subtotal + gst + PLATFORM_FEE - couponDiscount;

  const walletBalance = profile?.wallet_balance || 450;
  const canPayWithWallet = walletBalance >= total;

  const paymentMethods = [
    {
      id: 'wallet',
      name: 'QuickBite Wallet',
      subtitle: `₹${walletBalance.toFixed(2)} Available`,
      icon: 'wallet',
      color: colors.primary,
    },
    { id: 'googlepay', name: 'Google Pay', icon: 'logo-google', color: '#4285F4' },
    { id: 'phonepe', name: 'PhonePe', icon: 'phone-portrait', color: '#5F259F' },
    { id: 'card', name: 'Debit / Credit Cards', icon: 'card', color: colors.textSecondary },
  ];

  const handlePay = async () => {
    setLoading(true);

    try {
      // 1. Mock payment
      const paymentResult = await mockPayment(total, selectedMethod);

      if (!paymentResult.success) {
        Alert.alert('Payment Failed', 'Please try again.');
        setLoading(false);
        return;
      }

      // 2. Create order in Supabase
      const orderData = {
        student_id: session?.user?.id,
        vendor_id: cartVendorId,
        total,
        special_instructions: specialInstructions,
        payment_method: selectedMethod,
      };

      const items = cartItems.map((ci) => ({
        menu_item_id: ci.id,
        quantity: ci.quantity,
        price: ci.price,
        customizations: {},
      }));

      const order = await createOrder(orderData, items);

      if (order) {
        setActiveOrder(order);
        clearCart();
        // Navigate to success/tracking
        router.replace({
          pathname: '/(student)/order-tracking',
          params: { orderId: order.id, token: order.pickup_token },
        });
      } else {
        Alert.alert('Error', 'Order creation failed. Payment was processed.');
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
      <View className="flex-row items-center px-4 pt-14 pb-3 border-b border-border-light">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="flex-1 text-lg text-text-primary text-center mr-10" style={{ fontFamily: 'Inter_700Bold' }}>
          Payment
        </Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Order Total */}
        <View className="py-4 border-b border-border-light">
          <Text className="text-xs text-text-tertiary uppercase mb-1" style={{ fontFamily: 'Inter_600SemiBold' }}>
            Order Total
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
              ₹{total.toFixed(2)}
            </Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-sm text-primary mr-1" style={{ fontFamily: 'Inter_500Medium' }}>
                View Details
              </Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* QuickBite Wallet */}
        <View className="py-4 border-b border-border-light">
          <Text className="text-xs text-text-tertiary uppercase mb-3" style={{ fontFamily: 'Inter_600SemiBold' }}>
            QuickBite Wallet
          </Text>
          <TouchableOpacity
            className={`flex-row items-center p-4 rounded-lg border ${
              selectedMethod === 'wallet'
                ? 'border-primary bg-primary-light'
                : 'border-border bg-surface'
            }`}
            onPress={() => setSelectedMethod('wallet')}
          >
            <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mr-3">
              <Ionicons name="wallet" size={20} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-text-primary" style={{ fontFamily: 'Inter_600SemiBold' }}>
                QuickBite Wallet
              </Text>
              <Text className="text-xs text-text-secondary" style={{ fontFamily: 'Inter_400Regular' }}>
                ₹{walletBalance.toFixed(2)} Available
              </Text>
            </View>
            <View
              className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                selectedMethod === 'wallet' ? 'border-primary' : 'border-border'
              }`}
            >
              {selectedMethod === 'wallet' && (
                <View className="w-3 h-3 rounded-full bg-primary" />
              )}
            </View>
          </TouchableOpacity>
          {selectedMethod === 'wallet' && (
            <View className="flex-row mt-2" style={{ gap: 8 }}>
              <TouchableOpacity className="flex-1 py-2 rounded-md bg-primary items-center">
                <Text className="text-white text-xs" style={{ fontFamily: 'Inter_600SemiBold' }}>
                  Pay Full
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 py-2 rounded-md bg-surface border border-border items-center">
                <Text className="text-text-secondary text-xs" style={{ fontFamily: 'Inter_600SemiBold' }}>
                  PartialPay
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* UPI Payments */}
        <View className="py-4 border-b border-border-light">
          <Text className="text-xs text-text-tertiary uppercase mb-3" style={{ fontFamily: 'Inter_600SemiBold' }}>
            UPI Payments
          </Text>
          {['googlepay', 'phonepe'].map((method) => {
            const pm = paymentMethods.find((m) => m.id === method);
            return (
              <TouchableOpacity
                key={method}
                className={`flex-row items-center p-3 rounded-lg mb-2 border ${
                  selectedMethod === method
                    ? 'border-primary bg-primary-light'
                    : 'border-border bg-surface'
                }`}
                onPress={() => setSelectedMethod(method)}
              >
                <Ionicons name={pm.icon} size={22} color={pm.color} style={{ marginRight: 12 }} />
                <Text className="flex-1 text-sm text-text-primary" style={{ fontFamily: 'Inter_500Medium' }}>
                  {pm.name}
                </Text>
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                    selectedMethod === method ? 'border-primary' : 'border-border'
                  }`}
                >
                  {selectedMethod === method && (
                    <View className="w-3 h-3 rounded-full bg-primary" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity className="flex-row items-center p-3">
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text className="text-sm text-primary ml-2" style={{ fontFamily: 'Inter_500Medium' }}>
              Add new UPI ID
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cards */}
        <View className="py-4 mb-6">
          <Text className="text-xs text-text-tertiary uppercase mb-3" style={{ fontFamily: 'Inter_600SemiBold' }}>
            Cards & Net Banking
          </Text>
          <TouchableOpacity
            className={`flex-row items-center p-3 rounded-lg border ${
              selectedMethod === 'card'
                ? 'border-primary bg-primary-light'
                : 'border-border bg-surface'
            }`}
            onPress={() => setSelectedMethod('card')}
          >
            <Ionicons name="card" size={22} color={colors.textSecondary} style={{ marginRight: 12 }} />
            <View className="flex-1">
              <Text className="text-sm text-text-primary" style={{ fontFamily: 'Inter_500Medium' }}>
                Debit / Credit Cards
              </Text>
              <Text className="text-xs text-text-tertiary" style={{ fontFamily: 'Inter_400Regular' }}>
                VISA/MC/RuPay supported
              </Text>
            </View>
            <View
              className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                selectedMethod === 'card' ? 'border-primary' : 'border-border'
              }`}
            >
              {selectedMethod === 'card' && (
                <View className="w-3 h-3 rounded-full bg-primary" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Bill Summary */}
        <View className="bg-surface rounded-lg p-4 mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-text-secondary" style={{ fontFamily: 'Inter_400Regular' }}>
              Item Total
            </Text>
            <Text className="text-sm text-text-primary" style={{ fontFamily: 'Inter_500Medium' }}>
              ₹{subtotal.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-text-secondary" style={{ fontFamily: 'Inter_400Regular' }}>
              GST & Restaurant Charges
            </Text>
            <Text className="text-sm text-text-primary" style={{ fontFamily: 'Inter_500Medium' }}>
              ₹{gst.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-sm text-text-secondary" style={{ fontFamily: 'Inter_400Regular' }}>
              Platform Fee
            </Text>
            <Text className="text-sm text-text-primary" style={{ fontFamily: 'Inter_500Medium' }}>
              ₹{PLATFORM_FEE.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-text-secondary" style={{ fontFamily: 'Inter_400Regular' }}>
              Paying via Wallet
            </Text>
            <Text className="text-sm text-text-primary" style={{ fontFamily: 'Inter_500Medium' }}>
              Balance: ₹{walletBalance.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between pt-3 border-t border-border">
            <Text className="text-base text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
              Grand Total
            </Text>
            <Text className="text-base text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
              ₹{total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Disclaimer */}
        <View className="flex-row items-start mb-8 px-2">
          <Ionicons name="information-circle-outline" size={16} color={colors.textTertiary} style={{ marginTop: 1 }} />
          <Text className="flex-1 text-xs text-text-tertiary ml-2" style={{ fontFamily: 'Inter_400Regular' }}>
            QuickBite does not serve or deliver food products. All hygiene standards, food quality, 
            and packaging are solely the vendor's responsibility. Your order is safely packed for pickup.
          </Text>
        </View>
      </ScrollView>

      {/* Pay Button */}
      <View
        className="bg-white px-5 pb-8 pt-3 border-t border-border-light"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 5,
        }}
      >
        <TouchableOpacity
          className="bg-primary rounded-lg py-4 items-center"
          onPress={handlePay}
          disabled={loading}
          activeOpacity={0.8}
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
              <Text className="text-white text-base" style={{ fontFamily: 'Inter_600SemiBold' }}>
                Processing...
              </Text>
            </View>
          ) : (
            <Text className="text-white text-base" style={{ fontFamily: 'Inter_700Bold' }}>
              PAY ₹{total.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
