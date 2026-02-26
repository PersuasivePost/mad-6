import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import EventCard from "../components/EventCard";

const events = [
  {
    id: "1",
    title: "Community Meetup",
    date: "Mar 12, 2026",
    location: "Town Hall",
  },
  {
    id: "2",
    title: "Workshop: RN Basics",
    date: "Apr 2, 2026",
    location: "Tech Center",
  },
  {
    id: "3",
    title: "Music Night",
    date: "May 20, 2026",
    location: "Central Park",
  },
];

const HomeScreen: React.FC<any> = ({ navigation }) => {
  const [studentName, setStudentName] = useState("");

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
