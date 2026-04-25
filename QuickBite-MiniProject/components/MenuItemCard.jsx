/**
 * MenuItemCard Component
 * Displays a food item in a list/grid format
 * Matches Figma: image, name, description, price, veg/non-veg badge, ADD/qty controls
 *
 * @param {object} props
 * @param {object} props.item - Menu item data from Supabase
 * @param {Function} props.onAdd - Add to cart handler
 * @param {number} [props.quantity] - Current quantity in cart
 * @param {Function} [props.onIncrease] - Increase quantity handler
 * @param {Function} [props.onDecrease] - Decrease quantity handler
 * @param {object} [props.style] - Style overrides
 */
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../lib/theme';

export default function MenuItemCard({
  item,
  onAdd,
  quantity = 0,
  onIncrease,
  onDecrease,
  style,
}) {
  return (
    <View
      className="flex-row bg-white py-4 border-b border-border-light"
      style={style}
    >
      {/* Info */}
      <View className="flex-1 pr-3">
        {/* Veg badge — all items are veg */}
        <View className="flex-row items-center mb-1">
          <View
            className="w-4 h-4 border rounded-sm items-center justify-center mr-2"
            style={{ borderColor: colors.vegBadge }}
          >
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: colors.vegBadge }}
            />
          </View>
          {item.dietary_tags?.includes('jain-available') && (
            <View className="bg-success/10 px-1.5 py-0.5 rounded mr-2">
              <Text className="text-xs text-success" style={{ fontFamily: 'Inter_600SemiBold' }}>
                Jain
              </Text>
            </View>
          )}
          {item.is_available === false && (
            <Text
              className="text-xs text-error"
              style={{ fontFamily: 'Inter_500Medium' }}
            >
              Out of Stock
            </Text>
          )}
        </View>

        <Text
          className="text-base text-text-primary mb-1"
          style={{ fontFamily: 'Inter_600SemiBold' }}
          numberOfLines={1}
        >
          {item.name}
        </Text>

        <Text
          className="text-xs text-text-secondary mb-2"
          style={{ fontFamily: 'Inter_400Regular' }}
          numberOfLines={2}
        >
          {item.description || 'Delicious food item'}
        </Text>

        <Text
          className="text-base text-text-primary"
          style={{ fontFamily: 'Inter_700Bold' }}
        >
          ₹{item.price}
        </Text>
      </View>

      {/* Image + Add Button */}
      <View className="items-center">
        <Image
          source={{
            uri: item.image_url || `https://picsum.photos/seed/${item.id}/200/200`,
          }}
          className="w-28 h-24 rounded-lg"
          resizeMode="cover"
        />

        {/* Add / Quantity control */}
        {quantity > 0 ? (
          <View
            className="flex-row items-center bg-primary rounded-md px-1 py-1 -mt-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <TouchableOpacity
              className="w-8 h-8 items-center justify-center"
              onPress={onDecrease}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={18} color="#fff" />
            </TouchableOpacity>
            <Text
              className="text-white text-sm mx-2 min-w-[20px] text-center"
              style={{ fontFamily: 'Inter_700Bold' }}
            >
              {quantity}
            </Text>
            <TouchableOpacity
              className="w-8 h-8 items-center justify-center"
              onPress={onIncrease}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            className="bg-white border border-primary rounded-md px-6 py-2 -mt-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={onAdd}
            activeOpacity={0.7}
            disabled={item.is_available === false}
          >
            <Text
              className="text-primary text-sm"
              style={{ fontFamily: 'Inter_700Bold' }}
            >
              ADD +
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
