import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import EventDetailsScreen from "../screens/EventDetailsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={{ title: "Home", headerShown: false }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState<"Main" | "Settings">("Main");

  return (
    <SafeAreaView style={styles.root}>
      {/* Drawer overlay */}
      {drawerOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setDrawerOpen(false)}
        >
          <View style={styles.drawer}>
            <Text style={styles.drawerTitle}>Menu</Text>
            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => {
                setActiveScreen("Main");
                setDrawerOpen(false);
              }}
            >
              <Text style={styles.drawerItemText}>Main</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => {
                setActiveScreen("Settings");
                setDrawerOpen(false);
              }}
            >
              <Text style={styles.drawerItemText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* Header with hamburger */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDrawerOpen(true)}>
          <Text style={styles.hamburger}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeScreen === "Main" ? "Main" : "Settings"}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeScreen === "Main" ? <MainTabs /> : <SettingsScreen />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 10,
    flexDirection: "row",
  },
  drawer: {
    width: 250,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 24,
  },
  drawerItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  drawerItemText: { fontSize: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#6200ee",
  },
  hamburger: { fontSize: 24, color: "#fff", marginRight: 16 },
  headerTitle: { fontSize: 18, color: "#fff", fontWeight: "600" },
  content: { flex: 1 },
});
