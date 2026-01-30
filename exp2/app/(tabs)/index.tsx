import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

type GreetingProps = {
  name: string;
};

function Greeting({ name }: GreetingProps) {
  return <Text style={styles.greeting}>Hello, {name}</Text>;
}

export default function HomeScreen() {
  const [name, setName] = useState<string>("");
  const [count, setCount] = useState<number>(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Experiment 02</Text>

      <TextInput
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <Greeting name={name} />

      <Text style={styles.counter}>Button Click Count: {count}</Text>

      <Button title="Increase Count" onPress={() => setCount(count + 1)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    padding: 8,
    marginVertical: 10,
  },
  greeting: {
    fontSize: 18,
    marginVertical: 10,
  },
  counter: {
    marginVertical: 10,
    fontSize: 16,
  },
});
  