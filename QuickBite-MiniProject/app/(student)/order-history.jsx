/**
 * Order History Screen
 * Matches Figma: filter tabs, order cards with token, vendor, status
 */
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchStudentOrders } from '../../lib/supabase';
import useStore from '../../lib/store';
import OrderCard from '../../components/OrderCard';
import { colors } from '../../lib/theme';

const FILTER_TABS = ['All', 'Completed', 'Cancelled', 'Last 30 Days'];

export default function OrderHistoryScreen() {
  const router = useRouter();
  const session = useStore((s) => s.session);
  const [orders, setOrders] = useState([]);
  const [selectedTab, setSelectedTab] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    try {
      const data = await fetchStudentOrders(session.user.id);
      setOrders(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (selectedTab === 'All') return true;
    if (selectedTab === 'Completed') return order.status === 'picked_up';
    if (selectedTab === 'Cancelled') return order.status === 'cancelled';
    if (selectedTab === 'Last 30 Days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(order.created_at) >= thirtyDaysAgo;
    }
    return true;
  });

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-14 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-lg text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
          Order History
        </Text>
        <TouchableOpacity>
          <Ionicons name="search" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View className="px-4 pb-3">
        <FlatList
          horizontal
          data={FILTER_TABS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`px-4 py-2 rounded-full mr-2 ${
                selectedTab === item ? 'bg-primary' : 'bg-surface'
              }`}
              onPress={() => setSelectedTab(item)}
            >
              <Text
                className={`text-xs ${
                  selectedTab === item ? 'text-white' : 'text-text-secondary'
                }`}
                style={{ fontFamily: 'Inter_500Medium' }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Orders List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              variant="student"
              onViewDetails={() =>
                router.push({
                  pathname: '/(student)/order-tracking',
                  params: { orderId: item.id, token: item.pickup_token },
                })
              }
              style={{ marginHorizontal: 20 }}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Ionicons name="receipt-outline" size={48} color={colors.textTertiary} />
              <Text className="text-text-secondary mt-3 text-center" style={{ fontFamily: 'Inter_500Medium' }}>
                No orders yet
              </Text>
              <Text className="text-text-tertiary mt-1 text-center" style={{ fontFamily: 'Inter_400Regular' }}>
                Your order history will appear here
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
