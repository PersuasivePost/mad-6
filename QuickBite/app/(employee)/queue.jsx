/**
 * Employee Order Queue Screen
 * Real-time: polls every 15s, status update buttons (Accept, Preparing, Ready)
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchVendorOrders, updateOrderStatus, fetchVendors } from '../../lib/supabase';
import useStore from '../../lib/store';
import { colors } from '../../lib/theme';

const ORDER_TABS = ['New', 'Confirmed', 'Preparing', 'Ready', 'Done'];
const STATUS_MAP = {
  New: 'pending',
  Confirmed: 'confirmed',
  Preparing: 'preparing',
  Ready: 'ready',
  Done: 'picked_up',
};

export default function EmployeeQueueScreen() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);

  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [selectedTab, setSelectedTab] = useState('New');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showVendorPicker, setShowVendorPicker] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    loadVendors();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    if (selectedVendor) {
      loadOrders();
      // Auto-poll every 15 seconds
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(loadOrders, 15000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedVendor, selectedTab]);

  const loadVendors = async () => {
    const data = await fetchVendors();
    setVendors(data);
    if (data.length > 0) {
      setSelectedVendor(data[0]);
    }
    setLoading(false);
  };

  const loadOrders = async () => {
    if (!selectedVendor) return;
    const data = await fetchVendorOrders(selectedVendor.id, STATUS_MAP[selectedTab]);
    setOrders(data);
    // Also fetch all active orders for stats
    const allActive = await fetchVendorOrders(selectedVendor.id);
    setAllOrders(allActive);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [selectedVendor, selectedTab]);

  const handleStatusUpdate = async (orderId, newStatus, label) => {
    const updated = await updateOrderStatus(orderId, newStatus);
    if (updated) {
      loadOrders();
      Alert.alert('Updated', `Order marked as ${label}.`);
    } else {
      Alert.alert('Error', 'Failed to update order status.');
    }
  };

  const handleReject = async (orderId) => {
    Alert.alert('Reject Order', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          await updateOrderStatus(orderId, 'cancelled');
          loadOrders();
        },
      },
    ]);
  };

  // Real stats from orders
  const pendingCount = allOrders.filter((o) => o.status === 'pending').length;
  const preparingCount = allOrders.filter((o) => o.status === 'preparing' || o.status === 'confirmed').length;
  const doneCount = allOrders.filter((o) => o.status === 'picked_up').length;

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderOrderCard = ({ item: order }) => {
    const timeAgo = getTimeAgo(order.created_at);
    const statusColor = colors.primary;

    // Determine which action buttons to show based on order status
    const renderActions = () => {
      switch (order.status) {
        case 'pending':
          return (
            <View className="flex-row mt-3 pt-3 border-t border-border-light" style={{ gap: 8 }}>
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center py-2.5 rounded-md border border-error"
                onPress={() => handleReject(order.id)}
              >
                <Ionicons name="close" size={16} color={colors.error} />
                <Text className="text-error text-sm ml-1" style={{ fontFamily: 'Inter_600SemiBold' }}>
                  REJECT
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center py-2.5 rounded-md bg-success"
                onPress={() => handleStatusUpdate(order.id, 'confirmed', 'Confirmed')}
              >
                <Ionicons name="checkmark" size={16} color="#fff" />
                <Text className="text-white text-sm ml-1" style={{ fontFamily: 'Inter_600SemiBold' }}>
                  ACCEPT
                </Text>
              </TouchableOpacity>
            </View>
          );
        case 'confirmed':
          return (
            <View className="mt-3 pt-3 border-t border-border-light">
              <TouchableOpacity
                className="flex-row items-center justify-center py-2.5 rounded-md bg-primary"
                onPress={() => handleStatusUpdate(order.id, 'preparing', 'Preparing')}
              >
                <Ionicons name="flame" size={16} color="#fff" />
                <Text className="text-white text-sm ml-1" style={{ fontFamily: 'Inter_600SemiBold' }}>
                  START PREPARING
                </Text>
              </TouchableOpacity>
            </View>
          );
        case 'preparing':
          return (
            <View className="mt-3 pt-3 border-t border-border-light">
              <TouchableOpacity
                className="flex-row items-center justify-center py-2.5 rounded-md bg-success"
                onPress={() => handleStatusUpdate(order.id, 'ready', 'Ready for Pickup')}
              >
                <Ionicons name="bag-check" size={16} color="#fff" />
                <Text className="text-white text-sm ml-1" style={{ fontFamily: 'Inter_600SemiBold' }}>
                  MARK READY
                </Text>
              </TouchableOpacity>
            </View>
          );
        case 'ready':
          return (
            <View className="mt-3 pt-3 border-t border-border-light">
              <TouchableOpacity
                className="flex-row items-center justify-center py-2.5 rounded-md bg-primary"
                onPress={() => handleStatusUpdate(order.id, 'picked_up', 'Picked Up')}
              >
                <Ionicons name="checkmark-done-circle" size={16} color="#fff" />
                <Text className="text-white text-sm ml-1" style={{ fontFamily: 'Inter_600SemiBold' }}>
                  MARK PICKED UP
                </Text>
              </TouchableOpacity>
            </View>
          );
        default:
          return null;
      }
    };

    return (
      <View
        className="bg-white rounded-lg p-4 mb-3"
        style={{
          marginHorizontal: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Text className="text-lg text-text-primary mr-3" style={{ fontFamily: 'Inter_700Bold' }}>
              TOKEN {order.pickup_token || '#--'}
            </Text>
            <View className="bg-primary-light px-2 py-1 rounded-md">
              <Text className="text-xs text-primary uppercase" style={{ fontFamily: 'Inter_600SemiBold' }}>
                {order.payment_method === 'wallet' ? 'PREPAID' : order.payment_method?.toUpperCase() || 'COD'}
              </Text>
            </View>
          </View>
          <Text className="text-sm text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
            ₹{Number(order.total).toFixed(0)}
          </Text>
        </View>

        {/* Customer + Time */}
        <Text className="text-xs text-text-tertiary mb-2" style={{ fontFamily: 'Inter_400Regular' }}>
          {order.student?.name || 'Student'} • {timeAgo}
        </Text>

        {/* Items */}
        {order.order_items?.map((oi, idx) => (
          <View key={idx} className="flex-row items-center mb-1">
            <Text className="text-xs text-text-tertiary w-5" style={{ fontFamily: 'Inter_500Medium' }}>
              {oi.quantity}
            </Text>
            <Text className="text-sm text-text-primary flex-1" style={{ fontFamily: 'Inter_400Regular' }} numberOfLines={1}>
              {oi.menu_item?.name || 'Item'}
            </Text>
          </View>
        ))}

        {/* Special Instructions */}
        {order.special_instructions && (
          <View className="bg-warning-light rounded-md p-2 mt-2 flex-row items-start">
            <Ionicons name="information-circle" size={16} color={colors.warning} style={{ marginTop: 1 }} />
            <Text className="text-xs text-text-secondary ml-2 flex-1" style={{ fontFamily: 'Inter_400Regular' }}>
              {order.special_instructions}
            </Text>
          </View>
        )}

        {/* Action buttons */}
        {renderActions()}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-surface-alt">
      {/* Header */}
      <View className="bg-white px-5 pt-14 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity>
            <Ionicons name="menu" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <Text className="text-xl text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
              QuickBite{' '}
            </Text>
            <Text className="text-xl text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
              Staff
            </Text>
          </View>
          <View className="flex-row items-center" style={{ gap: 12 }}>
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="person-circle-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stall Selector */}
        <TouchableOpacity
          className="flex-row items-center justify-between border border-border rounded-lg px-4 py-3 mb-4"
          onPress={() => setShowVendorPicker(!showVendorPicker)}
        >
          <Text className="text-base text-text-primary" style={{ fontFamily: 'Inter_500Medium' }}>
            {selectedVendor?.name || 'Select Stall'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.textTertiary} />
        </TouchableOpacity>

        {showVendorPicker && (
          <View className="border border-border rounded-lg mb-3 bg-white overflow-hidden">
            {vendors.map((v) => (
              <TouchableOpacity
                key={v.id}
                className={`px-4 py-3 border-b border-border-light ${
                  selectedVendor?.id === v.id ? 'bg-primary-light' : ''
                }`}
                onPress={() => {
                  setSelectedVendor(v);
                  setShowVendorPicker(false);
                }}
              >
                <Text className="text-sm text-text-primary" style={{ fontFamily: 'Inter_400Regular' }}>
                  {v.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Stats Cards — real data */}
        <View className="flex-row" style={{ gap: 8 }}>
          <View className="flex-1 bg-warning-light rounded-lg p-3 items-center">
            <Text className="text-xs text-warning uppercase" style={{ fontFamily: 'Inter_600SemiBold' }}>
              Pending
            </Text>
            <Text className="text-2xl text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
              {pendingCount}
            </Text>
          </View>
          <View className="flex-1 bg-primary-light rounded-lg p-3 items-center">
            <Text className="text-xs text-primary uppercase" style={{ fontFamily: 'Inter_600SemiBold' }}>
              In Progress
            </Text>
            <Text className="text-2xl text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
              {preparingCount}
            </Text>
          </View>
          <View className="flex-1 bg-success-light rounded-lg p-3 items-center">
            <Text className="text-xs text-success uppercase" style={{ fontFamily: 'Inter_600SemiBold' }}>
              Done
            </Text>
            <Text className="text-2xl text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
              {doneCount}
            </Text>
          </View>
        </View>
      </View>

      {/* Order Tabs */}
      <View className="px-5 py-3 bg-white border-b border-border-light">
        <FlatList
          horizontal
          data={ORDER_TABS}
          keyExtractor={(item) => item}
          renderItem={({ item: tab }) => (
            <TouchableOpacity
              className={`mr-4 pb-2 ${
                selectedTab === tab ? 'border-b-2 border-primary' : ''
              }`}
              onPress={() => setSelectedTab(tab)}
            >
              <Text
                className={`text-sm ${
                  selectedTab === tab ? 'text-primary' : 'text-text-tertiary'
                }`}
                style={{
                  fontFamily: selectedTab === tab ? 'Inter_600SemiBold' : 'Inter_500Medium',
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderCard}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View className="items-center py-20">
            <Ionicons name="restaurant-outline" size={48} color={colors.textTertiary} />
            <Text className="text-text-secondary mt-3" style={{ fontFamily: 'Inter_500Medium' }}>
              No {selectedTab.toLowerCase()} orders
            </Text>
          </View>
        }
      />
    </View>
  );
}

/** Helper to format time ago */
function getTimeAgo(dateString) {
  if (!dateString) return 'just now';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} mins ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
