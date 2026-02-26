import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import AppNavigator from "./src/navigation";
import { store } from "./src/redux/store";
// import { EventProvider } from "./src/context/EventContext"; // Phase 1 - Context API

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </Provider>
  );
}
