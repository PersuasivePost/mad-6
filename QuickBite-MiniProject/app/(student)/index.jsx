/**
 * Student Home Dashboard
 * Dynamic data: vendors, categories, wallet balance all from Supabase
 */
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchVendors, fetchMenuItems, fetchProfile } from '../../lib/supabase';
import useStore from '../../lib/store';
import VendorCard from '../../components/VendorCard';
import { colors, APP_CONSTANTS } from '../../lib/theme';

export default function StudentHomeScreen() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const session = useStore((s) => s.session);
  const setProfile = useStore((s) => s.setProfile);
  const activeOrder = useStore((s) => s.activeOrder);
  const cartItemCount = useStore((s) => s.getCartItemCount);
  const cartTotal = useStore((s) => s.getCartTotal);
  const cartItems = useStore((s) => s.cartItems);

  const [vendors, setVendors] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const vendorsData = await fetchVendors();
      setVendors(vendorsData);

      // Refresh profile for latest wallet_balance
      if (session?.user?.id) {
        const freshProfile = await fetchProfile(session.user.id);
        if (freshProfile) setProfile(freshProfile);
      }

      // Fetch popular items from first few vendors
      if (vendorsData.length > 0) {
        const allItems = [];
        for (const vendor of vendorsData.slice(0, 3)) {
          const items = await fetchMenuItems(vendor.id);
          allItems.push(
            ...items.map((item) => ({
              ...item,
              vendorName: vendor.name,
            }))
          );
        }
        setPopularItems(allItems);

        // Extract unique categories from items
        const uniqueCats = [...new Set(allItems.map((i) => i.category).filter(Boolean))];
        setCategories(['All', ...uniqueCats]);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const firstName = profile?.name?.split(' ')[0] || 'Student';

  // Filter items by selected category
  const filteredItems =
    selectedCategory === 'All'
      ? popularItems
      : popularItems.filter(
          (item) => item.category === selectedCategory
        );

  // Filter items by search query
  const searchedItems = searchQuery.trim()
    ? filteredItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredItems;

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-text-secondary mt-4" style={{ fontFamily: 'Inter_400Regular' }}>
          Loading your campus canteens...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View className="bg-white px-5 pt-14 pb-4">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity>
              <Ionicons name="menu" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text
              className="text-xl text-primary"
              style={{ fontFamily: 'Inter_700Bold' }}
            >
              QuickBite
            </Text>
            <View className="flex-row items-center" style={{ gap: 12 }}>
              <TouchableOpacity onPress={() => router.push('/(student)/notifications')}>
                <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/(student)/wallet')}>
                <Ionicons name="wallet-outline" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Greeting */}
          <Text
            className="text-2xl text-text-primary mb-1"
            style={{ fontFamily: 'Inter_700Bold' }}
          >
            Hi, {firstName}! 👋
          </Text>
          <Text
            className="text-sm text-text-secondary mb-4"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            {APP_CONSTANTS.collegeName}
          </Text>

          {/* Wallet & Active Order Cards */}
          <View className="flex-row mb-5" style={{ gap: 12 }}>
            {/* Wallet Card */}
            <TouchableOpacity
              className="flex-1 bg-surface rounded-lg p-3"
              onPress={() => router.push('/(student)/wallet')}
              activeOpacity={0.7}
            >
              <Text className="text-xs text-text-tertiary mb-1" style={{ fontFamily: 'Inter_500Medium' }}>
                WALLET
              </Text>
              <Text className="text-xl text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
                ₹{Number(profile?.wallet_balance || 0).toFixed(2)}
              </Text>
              <Text className="text-xs text-primary mt-1" style={{ fontFamily: 'Inter_500Medium' }}>
                ↑ Top-up
              </Text>
            </TouchableOpacity>

            {/* Active Order Card */}
            {activeOrder ? (
              <TouchableOpacity
                className="flex-1 bg-primary rounded-lg p-3"
                onPress={() => router.push({ pathname: '/(student)/order-tracking', params: { orderId: activeOrder.id, token: activeOrder.pickup_token } })}
                activeOpacity={0.7}
              >
                <Text className="text-xs text-white/80 mb-1" style={{ fontFamily: 'Inter_500Medium' }}>
                  ACTIVE ORDER
                </Text>
                <Text className="text-xl text-white" style={{ fontFamily: 'Inter_700Bold' }}>
                  Token {activeOrder.pickup_token || '--'}
                </Text>
                <Text className="text-xs text-white/80 mt-1" style={{ fontFamily: 'Inter_500Medium' }}>
                  ⏱ {(activeOrder.status || 'pending').toUpperCase()}
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-1 bg-surface rounded-lg p-3 items-center justify-center">
                <Ionicons name="receipt-outline" size={24} color={colors.textTertiary} />
                <Text className="text-xs text-text-tertiary mt-1" style={{ fontFamily: 'Inter_500Medium' }}>
                  No Active Order
                </Text>
              </View>
            )}
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center bg-surface rounded-lg px-4 py-3 mb-4">
            <Ionicons name="search-outline" size={20} color={colors.textTertiary} />
            <TextInput
              className="flex-1 ml-3 text-base text-text-primary"
              style={{ fontFamily: 'Inter_400Regular' }}
              placeholder="Search for dishes, snacks..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Category Pills — dynamic from DB */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                className={`px-4 py-2 rounded-full border ${
                  selectedCategory === cat
                    ? 'bg-primary border-primary'
                    : 'bg-white border-border'
                }`}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  className={`text-sm ${
                    selectedCategory === cat ? 'text-white' : 'text-text-secondary'
                  }`}
                  style={{ fontFamily: 'Inter_500Medium' }}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular Stalls Section */}
        <View className="mt-2">
          <View className="flex-row items-center justify-between px-5 mb-3">
            <Text
              className="text-lg text-text-primary"
              style={{ fontFamily: 'Inter_700Bold' }}
            >
              Popular Stalls
            </Text>
            <TouchableOpacity>
              <Text className="text-sm text-primary" style={{ fontFamily: 'Inter_500Medium' }}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            data={vendors}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <VendorCard
                vendor={item}
                onPress={() => router.push(`/(student)/vendor/${item.id}`)}
              />
            )}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={
              <Text className="text-text-tertiary text-sm px-2" style={{ fontFamily: 'Inter_400Regular' }}>
                No vendors available right now
              </Text>
            }
          />
        </View>

        {/* Recommended For You — filtered by category */}
        <View className="mt-6 px-5 pb-6">
          <Text
            className="text-lg text-text-primary mb-3"
            style={{ fontFamily: 'Inter_700Bold' }}
          >
            {selectedCategory === 'All' ? 'All Items' : selectedCategory}
          </Text>

          {searchedItems.length === 0 ? (
            <View className="items-center py-8">
              <Ionicons name="restaurant-outline" size={48} color={colors.textTertiary} />
              <Text className="text-text-tertiary text-sm mt-3" style={{ fontFamily: 'Inter_400Regular' }}>
                No items in this category
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {searchedItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  className="bg-white rounded-lg overflow-hidden"
                  style={{
                    width: '47%',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                  onPress={() => router.push(`/(student)/vendor/${item.vendor_id}`)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{
                      uri: item.image_url || `https://picsum.photos/seed/${item.id}/300/200`,
                    }}
                    className="w-full h-28"
                    resizeMode="cover"
                  />
                  {/* Veg badge */}
                  <View
                    className="absolute top-2 left-2 w-4 h-4 rounded-sm border items-center justify-center bg-white"
                    style={{ borderColor: colors.vegBadge }}
                  >
                    <View
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: colors.vegBadge }}
                    />
                  </View>
                  {/* Jain tag */}
                  {item.dietary_tags?.includes('jain-available') && (
                    <View className="absolute top-2 right-2 bg-white/90 px-1.5 py-0.5 rounded">
                      <Text className="text-xs text-success" style={{ fontFamily: 'Inter_600SemiBold' }}>
                        Jain
                      </Text>
                    </View>
                  )}
                  <View className="p-3">
                    <Text
                      className="text-sm text-text-primary"
                      style={{ fontFamily: 'Inter_600SemiBold' }}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <View className="flex-row items-center justify-between mt-1">
                      <Text
                        className="text-sm text-primary"
                        style={{ fontFamily: 'Inter_700Bold' }}
                      >
                        ₹{item.price}
                      </Text>
                      <Text
                        className="text-xs text-text-tertiary"
                        style={{ fontFamily: 'Inter_400Regular' }}
                      >
                        {item.category || ''}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Cart Bar */}
      {cartItems.length > 0 && (
        <TouchableOpacity
          className="absolute bottom-20 left-5 right-5 bg-primary rounded-lg py-4 px-5 flex-row items-center justify-between"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 10,
            elevation: 8,
          }}
          onPress={() => router.push('/(student)/cart')}
          activeOpacity={0.9}
        >
          <View>
            <Text className="text-white/80 text-xs" style={{ fontFamily: 'Inter_500Medium' }}>
              {cartItemCount()} ITEMS
            </Text>
            <Text className="text-white text-lg" style={{ fontFamily: 'Inter_700Bold' }}>
              ₹{cartTotal()}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-white text-sm mr-2" style={{ fontFamily: 'Inter_600SemiBold' }}>
              VIEW CART
            </Text>
            <Ionicons name="cart" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}
