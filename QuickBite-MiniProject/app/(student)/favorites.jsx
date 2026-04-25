/**
 * Search / Explore Screen
 * Real data: fetches vendors from Supabase, search & filter, navigate to vendor detail
 */
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchVendors } from '../../lib/supabase';
import { colors } from '../../lib/theme';

export default function FavoritesScreen() {
  const router = useRouter();
  const [vendors, setVendors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');

  const FILTERS = ['All', 'Open Now', 'Top Rated'];

  const loadVendors = useCallback(async () => {
    try {
      const data = await fetchVendors();
      setVendors(data);
    } catch (err) {
      console.error('Error loading vendors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadVendors();
    setRefreshing(false);
  }, [loadVendors]);

  // Filter and search vendors
  const filteredVendors = vendors.filter((vendor) => {
    // Text search
    const matchesSearch =
      !searchQuery.trim() ||
      vendor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.cuisine_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.location?.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter tabs
    let matchesFilter = true;
    if (selectedFilter === 'Open Now') {
      matchesFilter = vendor.is_open === true;
    } else if (selectedFilter === 'Top Rated') {
      matchesFilter = (vendor.rating || 0) >= 4.0;
    }

    return matchesSearch && matchesFilter;
  });

  const renderStallCard = ({ item }) => (
    <View
      className="bg-white rounded-xl overflow-hidden mb-4 mx-5"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View className="relative">
        <Image
          source={{
            uri: item.image_url || `https://picsum.photos/seed/${item.id}/400/200`,
          }}
          className="w-full h-40"
          resizeMode="cover"
        />
        {/* Open/Closed badge */}
        <View
          className={`absolute top-3 right-3 px-2 py-1 rounded-full ${
            item.is_open ? 'bg-success' : 'bg-error'
          }`}
        >
          <Text className="text-white text-xs" style={{ fontFamily: 'Inter_600SemiBold' }}>
            {item.is_open ? 'OPEN' : 'CLOSED'}
          </Text>
        </View>
      </View>
      <View className="p-4">
        <Text className="text-base text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
          {item.name}
        </Text>
        <View className="flex-row items-center mt-1 mb-3">
          <Ionicons name="star" size={14} color={colors.starRating} />
          <Text
            className="text-sm text-text-secondary ml-1"
            style={{ fontFamily: 'Inter_500Medium' }}
          >
            {item.rating || '0.0'}
          </Text>
          <Text className="text-text-tertiary mx-2">•</Text>
          <Text
            className="text-sm text-text-tertiary"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            {item.cuisine_type || 'Multi-Cuisine'}
          </Text>
        </View>
        {item.location && (
          <View className="flex-row items-center mb-3">
            <Ionicons name="location-outline" size={14} color={colors.textTertiary} />
            <Text
              className="text-xs text-text-tertiary ml-1"
              style={{ fontFamily: 'Inter_400Regular' }}
              numberOfLines={1}
            >
              {item.location}
            </Text>
          </View>
        )}
        <TouchableOpacity
          className={`rounded-md py-3 items-center flex-row justify-center ${
            item.is_open ? 'bg-primary' : 'bg-text-tertiary'
          }`}
          onPress={() => router.push(`/(student)/vendor/${item.id}`)}
          activeOpacity={0.8}
          disabled={!item.is_open}
        >
          <Text
            className="text-white text-sm mr-2"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {item.is_open ? 'ORDER NOW' : 'CURRENTLY CLOSED'}
          </Text>
          {item.is_open && <Ionicons name="arrow-forward" size={16} color="#fff" />}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          className="text-text-secondary mt-4"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          Loading stalls...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-14 pb-3">
        <Text
          className="text-xl text-text-primary mb-4"
          style={{ fontFamily: 'Inter_700Bold' }}
        >
          Explore Stalls
        </Text>

        {/* Search Bar */}
        <View className="flex-row items-center bg-surface rounded-lg px-4 py-3 mb-3">
          <Ionicons name="search-outline" size={20} color={colors.textTertiary} />
          <TextInput
            className="flex-1 ml-3 text-base text-text-primary"
            style={{ fontFamily: 'Inter_400Regular' }}
            placeholder="Search stalls, cuisine..."
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

        {/* Filter Tabs */}
        <View className="flex-row" style={{ gap: 8 }}>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              className={`px-4 py-2 rounded-full border ${
                selectedFilter === filter
                  ? 'bg-primary border-primary'
                  : 'bg-white border-border'
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
        </View>
      </View>

      {/* Results count */}
      <View className="px-5 pb-2">
        <Text
          className="text-xs text-text-tertiary"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          {filteredVendors.length} stall{filteredVendors.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      <FlatList
        data={filteredVendors}
        keyExtractor={(item) => item.id}
        renderItem={renderStallCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View className="items-center py-20">
            <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
            <Text
              className="text-text-secondary mt-3"
              style={{ fontFamily: 'Inter_500Medium' }}
            >
              {searchQuery ? 'No stalls match your search' : 'No stalls available'}
            </Text>
            <Text
              className="text-text-tertiary mt-1 text-center px-8"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {searchQuery
                ? 'Try a different search term'
                : 'Pull down to refresh'}
            </Text>
          </View>
        }
      />
    </View>
  );
}
