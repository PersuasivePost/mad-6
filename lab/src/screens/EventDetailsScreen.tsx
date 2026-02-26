import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { incrementRSVP } from "../redux/eventSlice";

const EventDetailsScreen: React.FC<any> = ({ route }) => {
  const { id, title, date, location } = route.params || {};

  // Redux: Get events from store and dispatch actions
  const events = useAppSelector((state) => state.events.events);
  const dispatch = useAppDispatch();

  const event = events.find((e) => e.id === id);

  const handleRSVP = () => {
    if (id) {
      dispatch(incrementRSVP(id));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title || "Event"}</Text>
      <Text style={styles.meta}>Date: {date || "TBD"}</Text>
      <Text style={styles.meta}>Location: {location || "TBD"}</Text>
      <Text style={styles.meta}>RSVP Count: {event?.rsvpCount || 0}</Text>

      <TouchableOpacity style={styles.button} onPress={handleRSVP}>
        <Text style={styles.buttonText}>RSVP</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  meta: { fontSize: 16, color: "#333", marginBottom: 4 },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EventDetailsScreen;
