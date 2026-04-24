/**
 * Notifications Screen
 * Matches Figma: tabs (All/Orders/Offers/System), notification cards
 */
import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';

const TABS = ['All', 'Orders', 'Offers', 'System'];

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'order',
    title: 'Order Ready!',
    message: 'Your order from Canteen A is ready for pickup! Show your QR code at counter 4.',
    time: '2 mins ago',
    read: false,
    icon: 'checkmark-circle',
    iconColor: colors.success,
  },
  {
    id: '2',
    type: 'order',
    title: 'Order Preparing',
    message: "Chef is working on your meal. Estimated wait time is 10-12 minutes.",
    time: '15 mins ago',
    read: false,
    icon: 'flame',
    iconColor: colors.primary,
  },
  {
    id: '3',
    type: 'offer',
    title: 'Special Offer!',
    message: 'Get 20% off your next coffee at Student Hub! Valid for today only.',
    time: '1 hour ago',
    read: true,
    icon: 'pricetag',
    iconColor: colors.warning,
  },
  {
    id: '4',
    type: 'system',
    title: 'Payment Successful',
    message: 'Payment for Order #5432 confirmed via Campus Wallet. View receipt.',
    time: '3 hours ago',
    read: true,
    icon: 'card',
    iconColor: colors.success,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('All');

  const filtered = selectedTab === 'All'
    ? MOCK_NOTIFICATIONS
    : MOCK_NOTIFICATIONS.filter((n) => n.type === selectedTab.toLowerCase());

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      className={`flex-row p-4 border-b border-border-light ${
        !item.read ? 'bg-primary-light/30' : 'bg-white'
      }`}
      activeOpacity={0.7}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: item.iconColor + '20' }}
      >
        <Ionicons name={item.icon} size={20} color={item.iconColor} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-sm text-text-primary flex-1" style={{ fontFamily: 'Inter_600SemiBold' }}>
            {item.title}
          </Text>
          <Text className="text-xs capitalizedtext-text-tertiary" style={{ fontFamily: 'Inter_400Regular' }}>
            {item.type}
          </Text>
        </View>
        <Text className="text-xs text-text-secondary mb-1" style={{ fontFamily: 'Inter_400Regular' }} numberOfLines={2}>
          {item.message}
        </Text>
        <Text className="text-xs text-text-tertiary" style={{ fontFamily: 'Inter_400Regular' }}>
          {item.time}
        </Text>
      </View>
      {!item.read && <View className="w-2 h-2 rounded-full bg-primary self-center ml-2" />}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-14 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-lg text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
          Notifications
        </Text>
        <TouchableOpacity>
          <Ionicons name="checkmark-done" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 pb-3" style={{ gap: 8 }}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`px-4 py-2 rounded-full ${
              selectedTab === tab ? 'bg-primary' : 'bg-surface'
            }`}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              className={`text-xs ${
                selectedTab === tab ? 'text-white' : 'text-text-secondary'
              }`}
              style={{ fontFamily: 'Inter_500Medium' }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Ionicons name="notifications-off-outline" size={48} color={colors.textTertiary} />
            <Text className="text-text-tertiary mt-3" style={{ fontFamily: 'Inter_400Regular' }}>
              No notifications yet
            </Text>
          </View>
        }
      />
    </View>
  );
}
