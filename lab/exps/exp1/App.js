import { View, Text, Image, StyleSheet } from "react-native";

export default function App() {
  return (
    <View style={styles.screen}>
      {/* Top Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Welcome</Text>
        <Text style={styles.bannerSubtitle}>React Native Lab</Text>
      </View>

      {/* Content Card */}
      <View style={styles.card}>
        <Image
          source={{ uri: "https://reactnative.dev/img/tiny_logo.png" }}
          style={styles.logo}
        />

        <Text style={styles.cardTitle}>Application Development</Text>
        <Text style={styles.cardText}>
          This mobile application is built by ashvatth joshi using React Native
          and Expo. It demonstrates usage of core components and Flexbox-based
          layout.
        </Text>

        <View style={styles.tags}>
          <Text style={styles.tag}>Expo</Text>
          <Text style={styles.tag}>React Native</Text>
          <Text style={styles.tag}>Semester VI</Text>
        </View>
      </View>

      {/* Bottom Info */}
      <View style={styles.bottom}>
        <Text style={styles.bottomText}>Computer Engineering • 2025–26</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  banner: {
    flex: 2,
    backgroundColor: "#222831",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  bannerTitle: {
    fontSize: 26,
    color: "#ffffff",
    fontWeight: "bold",
  },
  bannerSubtitle: {
    fontSize: 16,
    color: "#cccccc",
    marginTop: 4,
  },
  card: {
    flex: 5,
    margin: 20,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    justifyContent: "center",
  },
  logo: {
    width: 50,
    height: 50,
    alignSelf: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: "#555555",
    textAlign: "center",
    lineHeight: 20,
  },
  tags: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#eeeeee",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 4,
    fontSize: 12,
  },
  bottom: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomText: {
    fontSize: 12,
    color: "#777777",
  },
});
