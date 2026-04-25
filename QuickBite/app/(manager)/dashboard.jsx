/**
 * Manager Analytics Dashboard
 * Filtered by the manager's assigned canteen (vendorId from Zustand).
 * Shows real order stats from Supabase.
 */
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase, fetchVendorOrders, fetchMenuItems } from '../../lib/supabase';
import useStore from '../../lib/store';
import { colors } from '../../lib/theme';

const DATE_FILTERS = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days'];

export default function ManagerDashboardScreen() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const vendorId = useStore((s) => s.vendorId);
  const vendorName = useStore((s) => s.vendorName);
  const clearAuth = useStore((s) => s.clearAuth);

  const [selectedFilter, setSelectedFilter] = useState('Today');
  const [orders, setOrders] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vendorId) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [vendorId]);

  const loadDashboardData = async () => {
    try {
      // Fetch all orders for this vendor
      const allOrders = await fetchVendorOrders(vendorId);
      setOrders(allOrders);

      // Calculate top sellers from order items
      const itemCounts = {};
      allOrders.forEach((order) => {
        order.order_items?.forEach((oi) => {
          const name = oi.menu_item?.name || 'Unknown';
          itemCounts[name] = (itemCounts[name] || 0) + oi.quantity;
        });
      });

      const sorted = Object.entries(itemCounts)
        .map(([name, sold]) => ({ name, sold }))
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5);

      setTopSellers(sorted);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
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

  // Compute stats
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'picked_up').length;
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const maxSold = topSellers.length > 0 ? Math.max(...topSellers.map((i) => i.sold)) : 1;

  // No canteen assigned
  if (!vendorId && !loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-8">
        <Ionicons name="alert-circle-outline" size={64} color={colors.warning} />
        <Text className="text-lg text-text-primary text-center mt-4" style={{ fontFamily: 'Inter_700Bold' }}>
          No Canteen Assigned
        </Text>
        <Text className="text-sm text-text-secondary text-center mt-2" style={{ fontFamily: 'Inter_400Regular' }}>
          Your account is not assigned to any canteen. Please contact the admin.
        </Text>
        <TouchableOpacity className="bg-primary rounded-md py-3 px-8 mt-6" onPress={handleLogout}>
          <Text className="text-white text-sm" style={{ fontFamily: 'Inter_600SemiBold' }}>Logout</Text>
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

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-14 pb-3">
        <View className="flex-1">
          <Text className="text-lg text-text-primary" style={{ fontFamily: 'Inter_700Bold' }} numberOfLines={1}>
            {vendorName || 'Dashboard'}
          </Text>
          <Text className="text-xs text-text-tertiary" style={{ fontFamily: 'Inter_400Regular' }}>
            Manager: {profile?.name || 'Staff'}
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

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Date Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 mb-5"
          contentContainerStyle={{ gap: 8 }}>
          {DATE_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              className={`px-4 py-2 rounded-full ${
                selectedFilter === filter ? 'bg-primary' : 'bg-surface'
              }`}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                className={`text-sm ${
                  selectedFilter === filter ? 'text-white' : 'text-text-secondary'
                }`}
                style={{ fontFamily: 'Inter_500Medium' }}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats Cards — real data */}
        <View className="flex-row px-5 mb-5" style={{ gap: 12 }}>
          <View className="flex-1 bg-primary-light rounded-xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="cash-outline" size={16} color={colors.primary} />
              <Text className="text-xs text-text-secondary ml-1" style={{ fontFamily: 'Inter_500Medium' }}>
                Revenue
              </Text>
            </View>
            <Text className="text-xl text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
              ₹{totalRevenue.toLocaleString('en-IN')}
            </Text>
          </View>

          <View className="flex-1 bg-info-light rounded-xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="receipt-outline" size={16} color={colors.info} />
              <Text className="text-xs text-text-secondary ml-1" style={{ fontFamily: 'Inter_500Medium' }}>
                Total Orders
              </Text>
            </View>
            <Text className="text-xl text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
              {totalOrders}
            </Text>
          </View>
        </View>

        {/* Secondary Stats */}
        <View className="flex-row px-5 mb-5" style={{ gap: 12 }}>
          {[
            { label: 'Avg. Value', value: `₹${avgOrderValue}` },
            { label: 'Completed', value: `${completedOrders}` },
            { label: 'Cancelled', value: `${cancelledOrders}` },
          ].map((stat, idx) => (
            <View key={idx} className="flex-1 bg-surface rounded-lg p-2.5 items-center">
              <Text className="text-xs text-text-tertiary" style={{ fontFamily: 'Inter_500Medium' }}>
                {stat.label}
              </Text>
              <Text className="text-sm text-text-primary mt-1" style={{ fontFamily: 'Inter_700Bold' }}>
                {stat.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Revenue Trend */}
        <View className="mx-5 mb-5 bg-surface rounded-xl p-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
              Revenue Trend (Last 7 Days)
            </Text>
          </View>
          <View className="flex-row items-end justify-between h-24" style={{ gap: 4 }}>
            {[40, 65, 55, 80, 70, 90, 75].map((height, idx) => (
              <View key={idx} className="flex-1 items-center">
                <View
                  className="w-full rounded-t-md bg-primary"
                  style={{ height: `${height}%`, opacity: idx === 5 ? 1 : 0.6 }}
                />
                <Text className="text-xs text-text-tertiary mt-1" style={{ fontFamily: 'Inter_400Regular' }}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Best Selling Items — real from order data */}
        <View className="mx-5 mb-8 bg-surface rounded-xl p-4">
          <Text className="text-sm text-text-primary mb-4" style={{ fontFamily: 'Inter_700Bold' }}>
            Top Selling Items
          </Text>
          {topSellers.length === 0 ? (
            <Text className="text-sm text-text-tertiary" style={{ fontFamily: 'Inter_400Regular' }}>
              No order data yet
            </Text>
          ) : (
            topSellers.map((item, idx) => (
              <View key={idx} className="flex-row items-center mb-3">
                <Text className="w-24 text-sm text-text-secondary" style={{ fontFamily: 'Inter_400Regular' }} numberOfLines={1}>
                  {item.name}
                </Text>
                <View className="flex-1 h-5 bg-white rounded-full overflow-hidden mx-3">
                  <View
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(item.sold / maxSold) * 100}%` }}
                  />
                </View>
                <Text className="text-sm text-primary w-8 text-right" style={{ fontFamily: 'Inter_700Bold' }}>
                  {item.sold}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
