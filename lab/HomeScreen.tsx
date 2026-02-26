import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  ScrollView,
} from "react-native";
import EventCard from "./EventCard";

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

const HomeScreen: React.FC = () => {
  const [studentName, setStudentName] = useState<string>("");

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
        <EventCard
          key={e.id}
          title={e.title}
          date={e.date}
          location={e.location}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#ffffff",
    justifyContent: "flex-start",
  },
  welcome: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#f7f7f8",
  },
  image: {
    width: 48,
    height: 48,
    marginRight: 12,
    borderRadius: 6,
    resizeMode: "cover",
  },
  cardContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    color: "#666666",
  },
});

export default HomeScreen;
