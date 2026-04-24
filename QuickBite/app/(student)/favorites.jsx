/**
 * Favorites Screen
 * Matches Figma: tabs (Stalls/Items), vendor cards with ORDER NOW
 */
import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';

const MOCK_FAV_STALLS = [
  {
    id: '1',
    name: 'South Kitchen',
    image_url: 'https://picsum.photos/seed/fav1/400/200',
    rating: 4.5,
    is_open: true,
    cuisine_type: '~15 mins',
  },
  {
    id: '2',
    name: 'Green Garden',
    image_url: 'https://picsum.photos/seed/fav2/400/200',
    rating: 4.2,
    is_open: true,
    cuisine_type: '~10 mins',
  },
];

export default function FavoritesScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('Stalls');

  const renderStallCard = ({ item }) => (
    <View className="bg-white rounded-xl overflow-hidden mb-4 mx-5"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }}>
      <View className="relative">
        <Image
          source={{ uri: item.image_url }}
          className="w-full h-40"
          resizeMode="cover"
        />
        <TouchableOpacity className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white items-center justify-center">
          <Ionicons name="heart" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
      <View className="p-4">
        <Text className="text-base text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
          {item.name}
        </Text>
        <View className="flex-row items-center mt-1 mb-3">
          <Ionicons name="star" size={14} color={colors.starRating} />
          <Text className="text-sm text-text-secondary ml-1" style={{ fontFamily: 'Inter_500Medium' }}>
            {item.rating}
          </Text>
          <Text className="text-text-tertiary mx-2">•</Text>
          <Text className={`text-sm ${item.is_open ? 'text-success' : 'text-error'}`} style={{ fontFamily: 'Inter_500Medium' }}>
            {item.is_open ? 'Open Now' : 'Closed'}
          </Text>
          <Text className="text-text-tertiary mx-2">•</Text>
          <Text className="text-sm text-text-tertiary" style={{ fontFamily: 'Inter_400Regular' }}>
            {item.cuisine_type}
          </Text>
        </View>
        <TouchableOpacity
          className="bg-primary rounded-md py-3 items-center flex-row justify-center"
          onPress={() => router.push(`/(student)/vendor/${item.id}`)}
          activeOpacity={0.8}
        >
          <Text className="text-white text-sm mr-2" style={{ fontFamily: 'Inter_600SemiBold' }}>
            ORDER NOW
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-14 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="flex-1 text-lg text-text-primary text-center mr-10" style={{ fontFamily: 'Inter_700Bold' }}>
          My Favorites
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row mx-5 bg-surface rounded-md p-1 mb-4">
        {['Stalls', 'Items'].map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`flex-1 py-2.5 rounded-md items-center ${
              selectedTab === tab ? 'bg-primary' : ''
            }`}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              className={`text-sm ${selectedTab === tab ? 'text-white' : 'text-text-secondary'}`}
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={MOCK_FAV_STALLS}
        keyExtractor={(item) => item.id}
        renderItem={renderStallCard}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Ionicons name="heart-outline" size={48} color={colors.textTertiary} />
            <Text className="text-text-tertiary mt-3" style={{ fontFamily: 'Inter_400Regular' }}>
              No favorites yet
            </Text>
          </View>
        }
      />
    </View>
  );
}
