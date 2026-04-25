/**
 * Root Index — Redirects based on auth state
 * The root layout handles the actual redirect logic.
 * This is just a placeholder that shows while redirect happens.
 */
import { View, Text, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import useStore from '../lib/store';
import { colors } from '../lib/theme';

export default function RootIndex() {
  const session = useStore((s) => s.session);
  const role = useStore((s) => s.role);
  const isAuthLoading = useStore((s) => s.isAuthLoading);

  if (isAuthLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary }}>
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 20 }}>
          QuickBite
        </Text>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  switch (role) {
    case 'employee':
      return <Redirect href="/(employee)/queue" />;
    case 'manager':
      return <Redirect href="/(manager)/dashboard" />;
    default:
      return <Redirect href="/(student)/" />;
  }
}
