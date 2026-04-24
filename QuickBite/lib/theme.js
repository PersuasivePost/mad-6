/**
 * QuickBite Design Tokens
 * Extracted from Figma design file
 * @see https://www.figma.com/design/zmaKZQdE00vWji2dzNU3iD/
 */

export const colors = {
  // Primary
  primary: '#F58220',
  primaryDark: '#E5741A',
  primaryLight: '#FFF3E6',
  primaryFaded: '#FDE8D0',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  background: '#FFFFFF',
  surface: '#F8F8F8',
  surfaceAlt: '#F5F5F5',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',

  // Status
  success: '#4CAF50',
  successLight: '#E8F5E9',
  error: '#F44336',
  errorLight: '#FFEBEE',
  warning: '#FF9800',
  warningLight: '#FFF3E0',
  info: '#2196F3',
  infoLight: '#E3F2FD',

  // Borders
  border: '#E0E0E0',
  borderLight: '#EEEEEE',
  borderFocus: '#F58220',

  // Overlay
  overlay: 'rgba(0,0,0,0.5)',
  overlayLight: 'rgba(0,0,0,0.3)',

  // Misc
  vegBadge: '#4CAF50',
  nonVegBadge: '#F44336',
  starRating: '#FFB800',
  skeleton: '#E0E0E0',
};

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 999,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

/** Consistent icon sizes */
export const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
};

/** Status colors map for order tracking */
export const orderStatusColors = {
  pending: colors.warning,
  confirmed: colors.info,
  preparing: colors.primary,
  ready: colors.success,
  picked_up: colors.success,
  cancelled: colors.error,
};

export const orderStatusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  picked_up: 'Picked Up',
  cancelled: 'Cancelled',
};
