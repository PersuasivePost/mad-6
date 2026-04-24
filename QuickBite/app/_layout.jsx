/**
 * Root Layout — QuickBite
 * Handles font loading, auth state, and redirects based on user role.
 */
import '../global.css';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { supabase, fetchProfile } from '../lib/supabase';
import useStore from '../lib/store';
import { colors } from '../lib/theme';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const session = useStore((s) => s.session);
  const profile = useStore((s) => s.profile);
  const role = useStore((s) => s.role);
  const isAuthLoading = useStore((s) => s.isAuthLoading);
  const setSession = useStore((s) => s.setSession);
  const setProfile = useStore((s) => s.setProfile);
  const setAuthLoading = useStore((s) => s.setAuthLoading);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);

        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id);
          if (userProfile) {
            setProfile(userProfile);
          }
        } else {
          setProfile(null);
        }

        setAuthLoading(false);
      }
    );

    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const userProfile = await fetchProfile(session.user.id);
        if (userProfile) {
          setProfile(userProfile);
        }
      }
      setAuthLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Hide splash when fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Route protection & role-based redirect
  useEffect(() => {
    if (isAuthLoading || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session) {
      // Not logged in → go to login
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else if (session && !profile?.name) {
      // Logged in but no profile yet → complete profile
      if (segments[1] !== 'complete-profile') {
        router.replace('/(auth)/complete-profile');
      }
    } else if (session && profile) {
      // Logged in with profile → redirect based on role
      if (inAuthGroup) {
        switch (role) {
          case 'employee':
            router.replace('/(employee)/queue');
            break;
          case 'manager':
            router.replace('/(manager)/dashboard');
            break;
          default:
            router.replace('/(student)/');
            break;
        }
      }
    }
  }, [session, profile, role, isAuthLoading, fontsLoaded, segments]);

  // Show loading screen while fonts/auth loading
  if (!fontsLoaded || isAuthLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.primary,
        }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: 20,
          }}
        >
          QuickBite
        </Text>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(student)" options={{ headerShown: false }} />
        <Stack.Screen name="(employee)" options={{ headerShown: false }} />
        <Stack.Screen name="(manager)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
