// basic default import
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

// import navigation components
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// import screens
import Home from "./screens/HomeScreen";
import TaxCalc from "./screens/TaxCalc";
import Summary from "./screens/Summary";

// create navigator objects
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeMain" component={Home} />
      <Stack.Screen name="TaxCalculator" component={TaxCalc} />
      {/* <Stack.Screen name="SummaryMain" component={Summary} /> */}
    </Stack.Navigator>
  );
}

function MyTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="HomeTab" component={HomeStack} />
      <Tab.Screen name="CalculatorTab" component={TaxCalc} />
      <Tab.Screen name="SummaryTab" component={Summary} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
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
