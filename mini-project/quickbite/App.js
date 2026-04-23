import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import StallDetailScreen from "./src/screens/StallDetailScreen";
import CartScreen from "./src/screens/CartScreen";
import PaymentScreen from "./src/screens/PaymentScreen";
import OrderConfirmationScreen from "./src/screens/OrderConfirmationScreen";
import OrderTrackingScreen from "./src/screens/OrderTrackingScreen";
import OrderHistoryScreen from "./src/screens/OrderHistoryScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import EmployeeTabs from "./src/navigation/EmployeeTabs";
import ManagerDashboard from "./src/screens/manager/ManagerDashboard";
import MenuManagementScreen from "./src/screens/manager/MenuManagementScreen";

import { CartProvider } from "./src/context/CartContext";
import { LoadingProvider } from "./src/context/LoadingContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { registerForPushNotificationsAsync } from "./src/services/notifications";
import * as Notifications from "expo-notifications";
import colors from "./src/styles/colors";

// Setup global fetch interceptor equivalent
const originalFetch = global.fetch;
global.fetch = async (url, options = {}) => {
  try {
    const userStr = await AsyncStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.id) {
        options.headers = {
          ...options.headers,
          "X-User-Id": String(user.id),
        };
      }
    }
  } catch (e) {
    // Ignore async storage errors silently for fetch wrapper
  }
  return originalFetch(url, options);
};

const Stack = createStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simulate initial splash/loading logic
    const prepare = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user?.id) {
            // Attempt notification registration locally on mount
            await registerForPushNotificationsAsync(user.id);
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      } finally {
        setIsReady(true);
      }
    };
    prepare();

    // Listen for incoming notifications while app is in foreground
    const sub = Notifications.addNotificationReceivedListener((n) => {
      console.log("Notification received:", n);
    });

    return () => {
      sub.remove();
    };
  }, []);

  if (!isReady) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <LoadingProvider>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="StallDetail" component={StallDetailScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen
              name="OrderConfirmation"
              component={OrderConfirmationScreen}
            />
            <Stack.Screen
              name="OrderTracking"
              component={OrderTrackingScreen}
            />
            <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="EmployeeTabs" component={EmployeeTabs} />
            <Stack.Screen
              name="ManagerDashboard"
              component={ManagerDashboard}
            />
            <Stack.Screen
              name="MenuManagement"
              component={MenuManagementScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </LoadingProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
});
