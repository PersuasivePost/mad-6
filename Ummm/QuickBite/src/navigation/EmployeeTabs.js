import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import NewOrdersScreen from "../screens/employee/NewOrdersScreen";
import PreparingScreen from "../screens/employee/PreparingScreen";
import ReadyScreen from "../screens/employee/ReadyScreen";

const Tab = createBottomTabNavigator();

export default function EmployeeTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="New Orders" component={NewOrdersScreen} />
      <Tab.Screen name="Preparing" component={PreparingScreen} />
      <Tab.Screen name="Ready" component={ReadyScreen} />
    </Tab.Navigator>
  );
}
