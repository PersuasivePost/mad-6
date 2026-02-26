import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";

type EventCardProps = {
  title: string;
  date: string;
  location: string;
};

const EventCard: React.FC<EventCardProps> = ({ title, date, location }) => {
  const [rsvpCount, setRsvpCount] = useState<number>(0);

  const handleRsvp = () => setRsvpCount((c) => c + 1);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.meta}>{date}</Text>
      <Text style={styles.meta}>{location}</Text>

      <View style={styles.footer}>
        <Button title="RSVP" onPress={handleRsvp} />
        <Text style={styles.rsvpText}>RSVPs: {rsvpCount}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
    backgroundColor: "#fff",
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android shadow
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  meta: {
    fontSize: 14,
    color: "#555",
  },
  footer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rsvpText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 12,
  },
});

export default EventCard;
