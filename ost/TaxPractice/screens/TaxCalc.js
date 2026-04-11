import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TextInput, Button } from "react-native";
import React, { useState } from "react";

export default function TaxCalc() {
  // state to store user input
  const [income, setIncome] = useState("");
  const [tax, setTax] = useState(0);

  // tax calc function
  const calculateTax = () => {
    const incomeNum = parseFloat(income) || 0;
    const calculated = incomeNum * 0.1; // 10% tax calculation
    setTax(calculated);
  };

  // return tax
  return (
    <View style={styles.container}>
      <Text>Welcome to the Tax Calculator!</Text>
      <Text>This is the tax calculation page.</Text>
      {/* input field */}
      <TextInput
        style={styles.input}
        placeholder="Enter income"
        keyboardType="numeric"
        value={income}
        onChangeText={setIncome}
      />

      {/* calculate button */}
      <Button title="Calculate Tax" onPress={calculateTax} />

      {/* show result */}
      <Text style={styles.result}>Tax to pay: ${tax.toFixed(2)}</Text>

      <StatusBar style="auto" />
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
  input: {
    width: "80%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 8,
    marginVertical: 8,
  },
  result: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
  },
});
