/**
 * Manager Analytics Dashboard
 * Matches Figma: stall selector, date filters, revenue/orders stats,
 * trend charts, top sellers
 */
import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';

const DATE_FILTERS = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days'];

const MOCK_TOP_SELLERS = [
  { name: 'Masala Dosa', sold: 24, color: colors.primary },
  { name: 'Paneer Roll', sold: 18, color: colors.primary },
  { name: 'Filter Coffee', sold: 15, color: colors.primary },
  { name: 'Vegetable Biryani', sold: 12, color: colors.primary },
  { name: 'Mango Shake', sold: 8, color: colors.primary },
];

export default function ManagerDashboardScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('Today');
  const [showStallPicker, setShowStallPicker] = useState(false);

  const maxSold = Math.max(...MOCK_TOP_SELLERS.map((i) => i.sold));

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-14 pb-3">
        <TouchableOpacity>
          <Ionicons name="menu" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-lg text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
          Manager Dashboard
        </Text>
        <TouchableOpacity>
          <Ionicons name="person-circle-outline" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Stall Selector */}
        <View className="px-5 mb-4">
          <Text className="text-xs text-text-tertiary uppercase mb-2" style={{ fontFamily: 'Inter_600SemiBold' }}>
            Select Stall
          </Text>
          <TouchableOpacity
            className="flex-row items-center justify-between border border-border rounded-lg px-4 py-3"
            onPress={() => setShowStallPicker(!showStallPicker)}
          >
            <Text className="text-base text-text-primary" style={{ fontFamily: 'Inter_500Medium' }}>
              Main Canteen - Block A
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

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

        {/* Stats Cards */}
        <View className="flex-row px-5 mb-5" style={{ gap: 12 }}>
          {/* Revenue */}
          <View className="flex-1 bg-primary-light rounded-xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="cash-outline" size={16} color={colors.primary} />
              <Text className="text-xs text-text-secondary ml-1" style={{ fontFamily: 'Inter_500Medium' }}>
                Revenue
              </Text>
            </View>
            <Text className="text-xl text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
              ₹12,450
            </Text>
            <Text className="text-xs text-success mt-1" style={{ fontFamily: 'Inter_500Medium' }}>
              ↑ +12.5%
            </Text>
          </View>

          {/* Total Orders */}
          <View className="flex-1 bg-info-light rounded-xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="receipt-outline" size={16} color={colors.info} />
              <Text className="text-xs text-text-secondary ml-1" style={{ fontFamily: 'Inter_500Medium' }}>
                Total Orders
              </Text>
            </View>
            <Text className="text-xl text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
              78
            </Text>
            <Text className="text-xs text-success mt-1" style={{ fontFamily: 'Inter_500Medium' }}>
              ↑ +5.2%
            </Text>
          </View>
        </View>

        {/* Secondary Stats */}
        <View className="flex-row px-5 mb-5" style={{ gap: 12 }}>
          {[
            { label: 'Avg. Value', value: '₹160', change: '↑ +2.1%' },
            { label: 'New Users', value: '14', change: '' },
            { label: 'Cancelled', value: '3', change: '' },
            { label: 'Avg. Time', value: '4.2 min', change: '' },
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
            <TouchableOpacity>
              <Text className="text-xs text-primary" style={{ fontFamily: 'Inter_500Medium' }}>
                Details →
              </Text>
            </TouchableOpacity>
          </View>
          {/* Simple bar chart visualization */}
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

        {/* Orders by Time Heatmap */}
        <View className="mx-5 mb-5 bg-surface rounded-xl p-4">
          <Text className="text-sm text-text-primary mb-3" style={{ fontFamily: 'Inter_700Bold' }}>
            Orders by Time Heatmap
          </Text>
          <View className="flex-row mb-2" style={{ gap: 4 }}>
            {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((label) => (
              <Text key={label} className="flex-1 text-xs text-text-tertiary text-center" style={{ fontFamily: 'Inter_400Regular' }}>
                {label}
              </Text>
            ))}
          </View>
          {/* Heatmap grid */}
          {[0, 1].map((row) => (
            <View key={row} className="flex-row mb-1" style={{ gap: 4 }}>
              {[0.3, 0.7, 0.5, 0.2, 0.8, 0.9, 0.4, 0.6].slice(row * 4, row * 4 + 4).map((opacity, idx) => (
                <View
                  key={idx}
                  className="flex-1 h-12 rounded-md"
                  style={{ backgroundColor: colors.primary, opacity }}
                />
              ))}
            </View>
          ))}
          <View className="flex-row justify-between mt-2">
            <Text className="text-xs text-text-tertiary" style={{ fontFamily: 'Inter_400Regular' }}>
              Low Volume
            </Text>
            <View className="flex-row items-center" style={{ gap: 2 }}>
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((op, i) => (
                <View key={i} className="w-4 h-3 rounded-sm" style={{ backgroundColor: colors.primary, opacity: op }} />
              ))}
            </View>
            <Text className="text-xs text-text-tertiary" style={{ fontFamily: 'Inter_400Regular' }}>
              High Volume
            </Text>
          </View>
        </View>

        {/* Top 5 Best Selling Items */}
        <View className="mx-5 mb-8 bg-surface rounded-xl p-4">
          <Text className="text-sm text-text-primary mb-4" style={{ fontFamily: 'Inter_700Bold' }}>
            Top 5 Best Selling Items
          </Text>
          {MOCK_TOP_SELLERS.map((item, idx) => (
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
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
