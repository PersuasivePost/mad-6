/**
 * Shopping Cart Screen
 * Matches Figma: vendor-grouped items, coupon, special instructions,
 * ASAP/Schedule, bill details, PROCEED TO PAYMENT bar
 */
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useStore from '../../lib/store';
import { colors } from '../../lib/theme';

const PLATFORM_FEE = 25;
const GST_RATE = 0.05;

export default function CartScreen() {
  const router = useRouter();
  const cartItems = useStore((s) => s.cartItems);
  const cartVendorName = useStore((s) => s.cartVendorName);
  const updateQuantity = useStore((s) => s.updateQuantity);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const clearCart = useStore((s) => s.clearCart);
  const specialInstructions = useStore((s) => s.specialInstructions);
  const setSpecialInstructions = useStore((s) => s.setSpecialInstructions);
  const pickupTime = useStore((s) => s.pickupTime);
  const setPickupTime = useStore((s) => s.setPickupTime);
  const couponCode = useStore((s) => s.couponCode);
  const couponDiscount = useStore((s) => s.couponDiscount);
  const getCartSubtotal = useStore((s) => s.getCartSubtotal);

  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponInputValue, setCouponInputValue] = useState('');

  const subtotal = getCartSubtotal();
  const gst = Math.round(subtotal * GST_RATE * 100) / 100;
  const total = subtotal + gst + PLATFORM_FEE - couponDiscount;

  if (cartItems.length === 0) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="cart-outline" size={80} color={colors.textTertiary} />
        <Text className="text-xl text-text-primary mt-4" style={{ fontFamily: 'Inter_700Bold' }}>
          Your cart is empty
        </Text>
        <Text className="text-sm text-text-secondary text-center mt-2" style={{ fontFamily: 'Inter_400Regular' }}>
          Browse menus and add delicious items{'\n'}to get started!
        </Text>
        <TouchableOpacity
          className="bg-primary rounded-md py-3 px-8 mt-6"
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text className="text-white text-base" style={{ fontFamily: 'Inter_600SemiBold' }}>
            Browse Menus
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderCartItem = ({ item }) => (
    <View className="flex-row items-center py-3 border-b border-border-light">
      <Image
        source={{ uri: item.image_url || `https://picsum.photos/seed/${item.id}/100/100` }}
        className="w-14 h-14 rounded-md"
        resizeMode="cover"
      />
      <View className="flex-1 ml-3">
        <View className="flex-row items-center">
          <View
            className="w-3.5 h-3.5 border rounded-sm items-center justify-center mr-2"
            style={{
              borderColor: item.food_type === 'veg' ? colors.vegBadge : colors.nonVegBadge,
            }}
          >
            <View
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: item.food_type === 'veg' ? colors.vegBadge : colors.nonVegBadge,
              }}
            />
          </View>
          <Text className="text-sm text-text-primary flex-1" style={{ fontFamily: 'Inter_600SemiBold' }} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
        <Text className="text-sm text-text-primary mt-1" style={{ fontFamily: 'Inter_700Bold' }}>
          ₹{item.price * item.quantity}
        </Text>
      </View>
      {/* Quantity Controls */}
      <View className="flex-row items-center bg-primary rounded-md">
        <TouchableOpacity
          className="w-8 h-8 items-center justify-center"
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
        >
          <Ionicons name="remove" size={16} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-sm mx-1 min-w-[20px] text-center" style={{ fontFamily: 'Inter_700Bold' }}>
          {item.quantity}
        </Text>
        <TouchableOpacity
          className="w-8 h-8 items-center justify-center"
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <Ionicons name="add" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-14 pb-3 border-b border-border-light">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-lg text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
          Your Cart
        </Text>
        <TouchableOpacity
          onPress={() => {
            Alert.alert('Clear Cart', 'Remove all items?', [
              { text: 'Cancel' },
              { text: 'Clear', style: 'destructive', onPress: clearCart },
            ]);
          }}
        >
          <Ionicons name="trash-outline" size={22} color={colors.error} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={renderCartItem}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="pt-3">
            {/* Vendor Name */}
            <View className="flex-row items-center mb-2">
              <View className="w-2 h-2 rounded-full bg-success mr-2" />
              <Text className="text-xs text-text-secondary uppercase" style={{ fontFamily: 'Inter_600SemiBold' }}>
                {cartVendorName}
              </Text>
            </View>
          </View>
        }
        ListFooterComponent={
          <View className="pb-40">
            {/* Apply Coupon */}
            <TouchableOpacity
              className="flex-row items-center py-4 border-b border-border-light"
              onPress={() => setShowCouponInput(!showCouponInput)}
            >
              <Ionicons name="pricetag-outline" size={20} color={colors.primary} />
              <Text className="flex-1 ml-3 text-sm text-text-primary" style={{ fontFamily: 'Inter_500Medium' }}>
                Apply Coupon
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </TouchableOpacity>

            {showCouponInput && (
              <View className="flex-row py-3" style={{ gap: 8 }}>
                <TextInput
                  className="flex-1 border border-border rounded-md px-3 py-2 text-sm bg-surface"
                  style={{ fontFamily: 'Inter_400Regular' }}
                  placeholder="Enter coupon code"
                  placeholderTextColor={colors.textTertiary}
                  value={couponInputValue}
                  onChangeText={setCouponInputValue}
                  autoCapitalize="characters"
                />
                <TouchableOpacity className="bg-primary rounded-md px-4 justify-center">
                  <Text className="text-white text-sm" style={{ fontFamily: 'Inter_600SemiBold' }}>
                    Apply
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Special Instructions */}
            <View className="py-4 border-b border-border-light">
              <Text className="text-xs text-text-tertiary uppercase mb-2" style={{ fontFamily: 'Inter_600SemiBold' }}>
                Special Instructions
              </Text>
              <TextInput
                className="border border-border rounded-md px-3 py-2 text-sm bg-surface"
                style={{ fontFamily: 'Inter_400Regular', minHeight: 60 }}
                placeholder="e.g. No onions in the chutney please..."
                placeholderTextColor={colors.textTertiary}
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Pickup Time */}
            <View className="py-4 border-b border-border-light">
              <Text className="text-xs text-text-tertiary uppercase mb-2" style={{ fontFamily: 'Inter_600SemiBold' }}>
                Pickup Time
              </Text>
              <View className="flex-row" style={{ gap: 8 }}>
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-md items-center border ${
                    pickupTime === 'asap'
                      ? 'bg-primary border-primary'
                      : 'bg-surface border-border'
                  }`}
                  onPress={() => setPickupTime('asap')}
                >
                  <Text
                    className={`text-sm ${
                      pickupTime === 'asap' ? 'text-white' : 'text-text-secondary'
                    }`}
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                  >
                    ASAP
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-md items-center border ${
                    pickupTime === 'scheduled'
                      ? 'bg-primary border-primary'
                      : 'bg-surface border-border'
                  }`}
                  onPress={() => setPickupTime('scheduled')}
                >
                  <Text
                    className={`text-sm ${
                      pickupTime === 'scheduled' ? 'text-white' : 'text-text-secondary'
                    }`}
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                  >
                    Schedule
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bill Details */}
            <View className="py-4">
              <Text className="text-sm text-text-primary mb-3" style={{ fontFamily: 'Inter_700Bold' }}>
                Bill Details
              </Text>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-text-secondary" style={{ fontFamily: 'Inter_400Regular' }}>
                  Item Total
                </Text>
                <Text className="text-sm text-text-primary" style={{ fontFamily: 'Inter_500Medium' }}>
                  ₹{subtotal.toFixed(2)}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <View className="flex-row items-center">
                  <Text className="text-sm text-text-secondary" style={{ fontFamily: 'Inter_400Regular' }}>
                    GST & Restaurant Charges
                  </Text>
                  <Ionicons name="information-circle-outline" size={14} color={colors.textTertiary} className="ml-1" />
                </View>
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
              {couponDiscount > 0 && (
                <View className="flex-row justify-between mb-3">
                  <Text className="text-sm text-success" style={{ fontFamily: 'Inter_500Medium' }}>
                    Coupon Discount
                  </Text>
                  <Text className="text-sm text-success" style={{ fontFamily: 'Inter_500Medium' }}>
                    -₹{couponDiscount.toFixed(2)}
                  </Text>
                </View>
              )}
              <View className="flex-row justify-between pt-3 border-t border-border">
                <Text className="text-base text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
                  Grand Total
                </Text>
                <Text className="text-base text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
                  ₹{total.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        }
      />

      {/* Bottom Action Bar */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-xl py-4 px-5 flex-row items-center justify-between"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <View>
          <Text className="text-white/80 text-xs" style={{ fontFamily: 'Inter_500Medium' }}>
            TOTAL AMOUNT
          </Text>
          <Text className="text-white text-xl" style={{ fontFamily: 'Inter_700Bold' }}>
            ₹{total.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => router.push('/(student)/checkout')}
          activeOpacity={0.8}
        >
          <Text className="text-white text-base mr-2" style={{ fontFamily: 'Inter_600SemiBold' }}>
            PROCEED TO PAYMENT
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
