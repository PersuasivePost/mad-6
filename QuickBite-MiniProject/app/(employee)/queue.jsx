/**
 * Employee Order Queue Screen
 * Filters orders by the staff's assigned canteen (vendorId from Zustand).
 * Full order lifecycle: Accept → Preparing → Ready → Picked Up
 * Auto-polls every 15 seconds.
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
import { supabase, fetchVendorOrders, updateOrderStatus } from '../../lib/supabase';
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
  const vendorId = useStore((s) => s.vendorId);
  const vendorName = useStore((s) => s.vendorName);
  const clearAuth = useStore((s) => s.clearAuth);

  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [selectedTab, setSelectedTab] = useState('New');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    if (vendorId) {
      loadOrders();
      pollRef.current = setInterval(loadOrders, 15000);
    } else {
      setLoading(false);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [vendorId, selectedTab]);

  const loadOrders = async () => {
    if (!vendorId) return;
    try {
      const data = await fetchVendorOrders(vendorId, STATUS_MAP[selectedTab]);
      setOrders(data);
      // Fetch all active orders for stats
      const allActive = await fetchVendorOrders(vendorId);
      setAllOrders(allActive);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [vendorId, selectedTab]);

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

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          clearAuth();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  // Real stats from orders
  const pendingCount = allOrders.filter((o) => o.status === 'pending').length;
  const preparingCount = allOrders.filter((o) => o.status === 'preparing' || o.status === 'confirmed').length;
  const doneCount = allOrders.filter((o) => o.status === 'picked_up').length;

  // No canteen assigned
  if (!vendorId && !loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-8">
        <Ionicons name="alert-circle-outline" size={64} color={colors.warning} />
        <Text className="text-lg text-text-primary text-center mt-4" style={{ fontFamily: 'Inter_700Bold' }}>
          No Canteen Assigned
        </Text>
        <Text className="text-sm text-text-secondary text-center mt-2" style={{ fontFamily: 'Inter_400Regular' }}>
          Your account is not assigned to any canteen. Please contact the admin to assign your canteen.
        </Text>
        <TouchableOpacity
          className="bg-primary rounded-md py-3 px-8 mt-6"
          onPress={handleLogout}
        >
          <Text className="text-white text-sm" style={{ fontFamily: 'Inter_600SemiBold' }}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderOrderCard = ({ item: order }) => {
    const timeAgo = getTimeAgo(order.created_at);

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

        <Text className="text-xs text-text-tertiary mb-2" style={{ fontFamily: 'Inter_400Regular' }}>
          {order.student?.name || 'Student'} • {timeAgo}
        </Text>

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

        {order.special_instructions && (
          <View className="bg-warning-light rounded-md p-2 mt-2 flex-row items-start">
            <Ionicons name="information-circle" size={16} color={colors.warning} style={{ marginTop: 1 }} />
            <Text className="text-xs text-text-secondary ml-2 flex-1" style={{ fontFamily: 'Inter_400Regular' }}>
              {order.special_instructions}
            </Text>
          </View>
        )}

        {renderActions()}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-surface-alt">
      {/* Header */}
      <View className="bg-white px-5 pt-14 pb-4">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1">
            <Text className="text-xl text-text-primary" style={{ fontFamily: 'Inter_700Bold' }} numberOfLines={1}>
              {vendorName || 'Canteen'}
            </Text>
            <Text className="text-xs text-text-tertiary mt-0.5" style={{ fontFamily: 'Inter_400Regular' }}>
              Logged in as {profile?.name || 'Staff'}
            </Text>
          </View>
          <View className="flex-row items-center" style={{ gap: 12 }}>
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards — real data */}
        <View className="flex-row mt-3" style={{ gap: 8 }}>
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
              <View className="flex-row items-center">
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
                {tab === 'New' && pendingCount > 0 && (
                  <View className="bg-primary rounded-full w-5 h-5 items-center justify-center ml-1">
                    <Text className="text-white text-xs" style={{ fontFamily: 'Inter_700Bold' }}>
                      {pendingCount}
                    </Text>
                  </View>
                )}
              </View>
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
