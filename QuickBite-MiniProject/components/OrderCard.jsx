/**
 * OrderCard Component
 * Displays order info for employee queue and order history
 * Matches Figma: token number, items, status badge, action buttons
 *
 * @param {object} props
 * @param {object} props.order - Order data with items and vendor
 * @param {Function} [props.onAccept] - Accept order handler (employee)
 * @param {Function} [props.onReject] - Reject order handler (employee)
 * @param {Function} [props.onViewDetails] - View details handler
 * @param {'student'|'employee'} [props.variant] - Display variant
 * @param {object} [props.style] - Style overrides
 */
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, orderStatusColors, orderStatusLabels } from '../lib/theme';

export default function OrderCard({
  order,
  onAccept,
  onReject,
  onViewDetails,
  variant = 'student',
  style,
}) {
  const statusColor = orderStatusColors[order.status] || colors.textTertiary;
  const statusLabel = orderStatusLabels[order.status] || order.status;
  const timeAgo = getTimeAgo(order.created_at);

  return (
    <View
      className="bg-white rounded-lg p-4 mb-3"
      style={[
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 2,
        },
        style,
      ]}
    >
      {/* Header Row */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Text
            className="text-lg text-text-primary mr-3"
            style={{ fontFamily: 'Inter_700Bold' }}
          >
            TOKEN {order.pickup_token || '#--'}
          </Text>
          <View
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: statusColor + '20' }}
          >
            <Text
              className="text-xs uppercase"
              style={{
                fontFamily: 'Inter_600SemiBold',
                color: statusColor,
              }}
            >
              {statusLabel}
            </Text>
          </View>
        </View>

        {variant === 'employee' && order.payment_method && (
          <View className="bg-primary-light px-2 py-1 rounded-md">
            <Text
              className="text-xs text-primary uppercase"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {order.payment_method === 'wallet' ? 'PREPAID' : 'COD'}
            </Text>
          </View>
        )}
      </View>

      {/* Time */}
      <Text
        className="text-xs text-text-tertiary mb-3"
        style={{ fontFamily: 'Inter_400Regular' }}
      >
        Ordered {timeAgo} • {order.order_items?.length || 0} item(s)
      </Text>

      {/* Items List */}
      {order.order_items?.slice(0, 3).map((orderItem, idx) => (
        <View key={idx} className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center flex-1">
            <Text
              className="text-xs text-text-tertiary w-5"
              style={{ fontFamily: 'Inter_500Medium' }}
            >
              {orderItem.quantity}
            </Text>
            <Text
              className="text-sm text-text-primary flex-1"
              style={{ fontFamily: 'Inter_400Regular' }}
              numberOfLines={1}
            >
              {orderItem.menu_item?.name || 'Item'}
            </Text>
          </View>
          <Text
            className="text-sm text-text-secondary"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            ₹{orderItem.price}
          </Text>
        </View>
      ))}

      {order.order_items?.length > 3 && (
        <Text
          className="text-xs text-text-tertiary mt-1"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          +{order.order_items.length - 3} more items
        </Text>
      )}

      {/* Special Instructions */}
      {variant === 'employee' && order.special_instructions && (
        <View className="bg-warning-light rounded-md p-2 mt-2 flex-row items-start">
          <Ionicons name="information-circle" size={16} color={colors.warning} style={{ marginTop: 1 }} />
          <Text
            className="text-xs text-text-secondary ml-2 flex-1"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            {order.special_instructions}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View className="flex-row mt-3 pt-3 border-t border-border-light">
        {variant === 'employee' && order.status === 'pending' ? (
          <>
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center py-2 mr-2 rounded-md border border-error"
              onPress={onReject}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={16} color={colors.error} />
              <Text
                className="text-error text-sm ml-1"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                REJECT
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center py-2 ml-2 rounded-md bg-success"
              onPress={onAccept}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text
                className="text-white text-sm ml-1"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                ACCEPT
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-between"
            onPress={onViewDetails}
            activeOpacity={0.7}
          >
            <Text
              className="text-sm text-text-primary"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              ₹{order.total}
            </Text>
            <View className="flex-row items-center">
              <Text
                className="text-sm text-primary mr-1"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                View Details
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

/** Helper to format time ago */
function getTimeAgo(dateString) {
  if (!dateString) return 'just now';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} mins ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
