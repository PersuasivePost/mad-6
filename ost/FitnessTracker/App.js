// import default
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

// import navigation
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// import screens
import HomeScreen from "../TaxPractice/screens/HomeScreen";
import HistoryScreen from "./screens/HistoryScreen";
import WorkoutLoggerScreen from "./screens/WorkoutLoggerScreen";

// create stack and tab navigators
const stack = createStackNavigator();
const tab = createBottomTabNavigator();

// createstack function
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      {/* <Stack.Screen name="History" component={HistoryScreen} /> */}
      <Stack.Screen name="WorkoutLogger" component={WorkoutLoggerScreen} />
    </Stack.Navigator>
  );
}

// bottom tab navigator
function MyTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="WorkoutLogger" component={WorkoutLoggerScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    // <View style={styles.container}>
    //   <Text>Fitness tracker mobile application react native</Text>
    //   <StatusBar style="auto" />
    // </View>
    <NavigationContainer>
      <MyTabs />  
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
