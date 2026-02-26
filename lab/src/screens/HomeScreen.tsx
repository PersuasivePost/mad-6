import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import EventCard from "../components/EventCard";
import { useAppSelector } from "../redux/hooks";

const HomeScreen: React.FC<any> = ({ navigation }) => {
  const [studentName, setStudentName] = useState("");
  // Redux: Get events from Redux store
  const events = useAppSelector((state) => state.events.events);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.welcome}>
        Welcome {studentName ? studentName : "student"}
      </Text>
      <TextInput
        placeholder="Enter your name"
        value={studentName}
        onChangeText={setStudentName}
        style={styles.input}
      />

      {events.map((e) => (
        <TouchableOpacity
          key={e.id}
          onPress={() => navigation.navigate("EventDetails", e)}
        >
          <EventCard title={e.title} date={e.date} location={e.location} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff" },
  welcome: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
});

export default HomeScreen;
