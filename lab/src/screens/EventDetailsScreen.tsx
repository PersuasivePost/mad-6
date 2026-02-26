import React from "react";
import { View, Text, StyleSheet } from "react-native";

const EventDetailsScreen: React.FC<any> = ({ route }) => {
  const { title, date, location } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title || "Event"}</Text>
      <Text style={styles.meta}>Date: {date || "TBD"}</Text>
      <Text style={styles.meta}>Location: {location || "TBD"}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  meta: { fontSize: 16, color: "#333", marginBottom: 4 },
});

export default EventDetailsScreen;
 