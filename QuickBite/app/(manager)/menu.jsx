/**
 * Menu Management Screen
 * Matches Figma: search, category filters, menu items with edit/delete/availability toggle
 */
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchVendors, fetchMenuItems, supabase } from '../../lib/supabase';
import { colors } from '../../lib/theme';

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Snacks'];

export default function MenuManagementScreen() {
  const router = useRouter();
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await fetchVendors();
    setVendors(data);
    if (data.length > 0) {
      setSelectedVendor(data[0]);
      const items = await fetchMenuItems(data[0].id);
      setMenuItems(items);
    }
    setLoading(false);
  };

  const loadMenuItems = async (vendorId) => {
    const items = await fetchMenuItems(vendorId);
    setMenuItems(items);
  };

  const toggleAvailability = async (itemId, currentValue) => {
    const { error } = await supabase
      .from('menu_items')
      .update({ is_available: !currentValue })
      .eq('id', itemId);

    if (!error) {
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, is_available: !currentValue } : item
        )
      );
    }
  };

  const handleDelete = (itemId, itemName) => {
    Alert.alert('Delete Item', `Remove "${itemName}" from menu?`, [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('menu_items').delete().eq('id', itemId);
          setMenuItems((prev) => prev.filter((item) => item.id !== itemId));
        },
      },
    ]);
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      item.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderMenuItem = ({ item }) => (
    <View className="bg-white rounded-xl p-3 mb-3 mx-5"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
      <View className="flex-row">
        <Image
          source={{ uri: item.image_url || `https://picsum.photos/seed/${item.id}/200/200` }}
          className="w-16 h-16 rounded-lg"
          resizeMode="cover"
        />
        <View className="flex-1 ml-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-base text-text-primary" style={{ fontFamily: 'Inter_600SemiBold' }}>
              {item.name}
            </Text>
            <Text className="text-base text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
              ₹{item.price}
            </Text>
          </View>
          <Text className="text-xs text-text-tertiary mt-0.5" style={{ fontFamily: 'Inter_400Regular' }}>
            {item.category} • {item.food_type === 'veg' ? 'Veg' : 'Non-Veg'}
          </Text>
          <View className="flex-row items-center mt-1">
            <View
              className="flex-row items-center px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: item.is_available ? colors.successLight : colors.errorLight,
              }}
            >
              <View
                className="w-1.5 h-1.5 rounded-full mr-1"
                style={{
                  backgroundColor: item.is_available ? colors.success : colors.error,
                }}
              />
              <Text
                className="text-xs"
                style={{
                  fontFamily: 'Inter_500Medium',
                  color: item.is_available ? colors.success : colors.error,
                }}
              >
                {item.is_available ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Row */}
      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border-light">
        <View className="flex-row" style={{ gap: 8 }}>
          <TouchableOpacity className="w-8 h-8 rounded-md bg-primary-light items-center justify-center">
            <Ionicons name="pencil" size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-8 h-8 rounded-md bg-error-light items-center justify-center"
            onPress={() => handleDelete(item.id, item.name)}
          >
            <Ionicons name="trash" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center">
          <Text className="text-xs text-text-tertiary mr-2" style={{ fontFamily: 'Inter_500Medium' }}>
            AVAILABILITY
          </Text>
          <Switch
            value={item.is_available}
            onValueChange={() => toggleAvailability(item.id, item.is_available)}
            trackColor={{ false: colors.border, true: colors.primary + '60' }}
            thumbColor={item.is_available ? colors.primary : colors.textTertiary}
          />
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-surface-alt">
      {/* Header */}
      <View className="bg-white px-5 pt-14 pb-4 border-b border-border-light">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text className="text-lg text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
            Menu Management
          </Text>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-surface rounded-lg px-4 py-2.5 mb-3">
          <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
          <TextInput
            className="flex-1 ml-2 text-sm text-text-primary"
            style={{ fontFamily: 'Inter_400Regular' }}
            placeholder="Search menu items..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Filters */}
        <View className="flex-row" style={{ gap: 8 }}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === cat ? 'bg-primary' : 'bg-surface'
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
        </View>
      </View>

      {/* Menu Items List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderMenuItem}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Ionicons name="restaurant-outline" size={48} color={colors.textTertiary} />
            <Text className="text-text-secondary mt-3" style={{ fontFamily: 'Inter_500Medium' }}>
              No menu items found
            </Text>
          </View>
        }
      />

      {/* Add New Item FAB */}
      <TouchableOpacity
        className="absolute bottom-24 right-5 w-14 h-14 rounded-full bg-primary items-center justify-center"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
