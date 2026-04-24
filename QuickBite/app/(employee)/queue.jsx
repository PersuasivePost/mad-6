/**
 * Employee Order Queue Screen
 * Matches Figma: stall selector, stats cards, order tabs, order cards with actions
 */
import { useState, useEffect, useCallback } from 'react';
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
import OrderCard from '../../components/OrderCard';
import { colors } from '../../lib/theme';

const ORDER_TABS = ['New', 'Preparing', 'Ready', 'Done'];
const STATUS_MAP = {
  New: 'pending',
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
  const [selectedTab, setSelectedTab] = useState('New');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showVendorPicker, setShowVendorPicker] = useState(false);

  useEffect(() => {
    loadVendors();
  }, []);

  useEffect(() => {
    if (selectedVendor) {
      loadOrders();
    }
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
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [selectedVendor, selectedTab]);

  const handleAccept = async (orderId) => {
    const updated = await updateOrderStatus(orderId, 'confirmed');
    if (updated) {
      loadOrders();
      Alert.alert('Order Accepted', 'Order has been confirmed.');
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

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const doneCount = 45; // Mock
  const avgTime = '~14m'; // Mock

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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

        {/* Stats Cards */}
        <View className="flex-row" style={{ gap: 8 }}>
          <View className="flex-1 bg-warning-light rounded-lg p-3 items-center">
            <Text className="text-xs text-warning uppercase" style={{ fontFamily: 'Inter_600SemiBold' }}>
              Pending
            </Text>
            <Text className="text-2xl text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
              {pendingCount}
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
          <View className="flex-1 bg-info-light rounded-lg p-3 items-center">
            <Text className="text-xs text-info uppercase" style={{ fontFamily: 'Inter_600SemiBold' }}>
              Avg Time
            </Text>
            <Text className="text-2xl text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
              {avgTime}
            </Text>
          </View>
        </View>
      </View>

      {/* Order Tabs */}
      <View className="flex-row px-5 py-3 bg-white border-b border-border-light">
        {ORDER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
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
        ))}
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            variant="employee"
            onAccept={() => handleAccept(item.id)}
            onReject={() => handleReject(item.id)}
            style={{ marginHorizontal: 16 }}
          />
        )}
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
