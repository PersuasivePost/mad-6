import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button } from "react-native";

export default function Home({ navigation }) {
  return (
    <View style={styles.container}>
      <Text>Welcome to the Home Screen!</Text>
      <Text>THis is home page hehe :)</Text>
      <StatusBar style="auto" />
      <Button
        title="Go to Tax Calculator"
        onPress={() => navigation.navigate("TaxCalculator")}
      />
    </View>
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
