/**
 * VendorCard Component
 * Displays vendor info in a horizontal scrollable card
 * Matches Figma: image, name, rating, cuisine type
 *
 * @param {object} props
 * @param {object} props.vendor - Vendor data from Supabase
 * @param {Function} props.onPress - Press handler
 * @param {object} [props.style] - Style overrides
 */
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../lib/theme';

export default function VendorCard({ vendor, onPress, style }) {
  return (
    <TouchableOpacity
      className="bg-white rounded-lg overflow-hidden mr-4"
      style={[
        {
          width: 160,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={{
          uri: vendor.image_url || `https://picsum.photos/seed/${vendor.id}/320/200`,
        }}
        className="w-full h-24"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text
          className="text-sm text-text-primary mb-1"
          style={{ fontFamily: 'Inter_600SemiBold' }}
          numberOfLines={1}
        >
          {vendor.name}
        </Text>
        <View className="flex-row items-center">
          <Ionicons name="star" size={12} color={colors.starRating} />
          <Text
            className="text-xs text-text-secondary ml-1"
            style={{ fontFamily: 'Inter_500Medium' }}
          >
            {vendor.rating || '4.5'}
          </Text>
        </View>
        <Text
          className="text-xs text-text-tertiary mt-1"
          style={{ fontFamily: 'Inter_400Regular' }}
          numberOfLines={1}
        >
          {vendor.cuisine_type || 'Multi-Cuisine'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
