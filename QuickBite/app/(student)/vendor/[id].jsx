/**
 * Vendor Menu Screen (Stall Detail)
 * Matches Figma: hero image, vendor info, category tabs, menu items list
 */
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase, fetchMenuItems } from '../../../lib/supabase';
import useStore from '../../../lib/store';
import MenuItemCard from '../../../components/MenuItemCard';
import { colors } from '../../../lib/theme';

const CATEGORIES = ['Recommended', 'Breakfast', 'Lunch', 'Snacks', 'Drinks'];

export default function VendorMenuScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const cartItems = useStore((s) => s.cartItems);
  const addToCart = useStore((s) => s.addToCart);
  const updateQuantity = useStore((s) => s.updateQuantity);
  const getCartItemCount = useStore((s) => s.getCartItemCount);
  const getCartTotal = useStore((s) => s.getCartTotal);

  const [vendor, setVendor] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Recommended');
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadVendorData();
  }, [id]);

  const loadVendorData = async () => {
    try {
      // Fetch vendor
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', id)
        .single();
      setVendor(vendorData);

      // Fetch menu items
      const items = await fetchMenuItems(id);
      setMenuItems(items);
    } catch (err) {
      console.error('Error loading vendor:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems =
    selectedCategory === 'Recommended'
      ? menuItems
      : menuItems.filter(
          (item) =>
            item.category?.toLowerCase() === selectedCategory.toLowerCase()
        );

  const getItemQuantity = (itemId) => {
    const cartItem = cartItems.find((ci) => ci.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAdd = (item) => {
    addToCart(
      {
        id: item.id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
        food_type: item.food_type,
      },
      id,
      vendor?.name || 'Vendor'
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Hero Image */}
      <View className="relative">
        <Image
          source={{
            uri: vendor?.image_url || `https://picsum.photos/seed/${id}/800/400`,
          }}
          className="w-full h-56"
          resizeMode="cover"
        />
        {/* Overlay buttons */}
        <View className="absolute top-12 left-4 right-4 flex-row justify-between">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-white/90 items-center justify-center"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View className="flex-row" style={{ gap: 8 }}>
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-white/90 items-center justify-center"
              onPress={() => {}}
            >
              <Ionicons name="share-outline" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-white/90 items-center justify-center"
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? colors.error : colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Vendor Info */}
      <View className="px-5 pt-4 pb-2 bg-white">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
            {vendor?.name || 'Vendor'}
          </Text>
          <View
            className={`px-2 py-1 rounded-full ${
              vendor?.is_open ? 'bg-success-light' : 'bg-error-light'
            }`}
          >
            <Text
              className={`text-xs ${
                vendor?.is_open ? 'text-success' : 'text-error'
              }`}
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {vendor?.is_open ? 'OPEN' : 'CLOSED'}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center mt-1 mb-1">
          <Ionicons name="star" size={14} color={colors.starRating} />
          <Text className="text-sm text-text-secondary ml-1" style={{ fontFamily: 'Inter_500Medium' }}>
            {vendor?.rating || '4.5'}
          </Text>
          <Text className="text-text-tertiary mx-2">•</Text>
          <Text
            className="text-sm text-text-secondary"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            Open Now
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="location-outline" size={14} color={colors.textTertiary} />
          <Text className="text-xs text-text-tertiary ml-1" style={{ fontFamily: 'Inter_400Regular' }}>
            {vendor?.location || 'Campus Location'}
          </Text>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-surface rounded-lg px-4 py-2.5 my-3">
          <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
          <Text className="flex-1 ml-2 text-sm text-text-tertiary" style={{ fontFamily: 'Inter_400Regular' }}>
            Search for dishes, snacks...
          </Text>
        </View>

        {/* Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === cat
                  ? 'bg-primary'
                  : 'bg-surface'
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

      {/* Menu Items */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MenuItemCard
            item={item}
            quantity={getItemQuantity(item.id)}
            onAdd={() => handleAdd(item)}
            onIncrease={() => updateQuantity(item.id, getItemQuantity(item.id) + 1)}
            onDecrease={() => updateQuantity(item.id, getItemQuantity(item.id) - 1)}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text className="text-lg text-text-primary pt-4 pb-2" style={{ fontFamily: 'Inter_700Bold' }}>
            Popular Items
          </Text>
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <Ionicons name="restaurant-outline" size={48} color={colors.textTertiary} />
            <Text className="text-text-tertiary mt-3" style={{ fontFamily: 'Inter_400Regular' }}>
              No items in this category
            </Text>
          </View>
        }
      />

      {/* Cart Bar */}
      {cartItems.length > 0 && (
        <TouchableOpacity
          className="absolute bottom-6 left-5 right-5 bg-primary rounded-lg py-4 px-5 flex-row items-center justify-between"
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
              {getCartItemCount()} ITEMS
            </Text>
            <Text className="text-white text-lg" style={{ fontFamily: 'Inter_700Bold' }}>
              ₹{getCartTotal()}
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
