import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const index = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tic Tac Toe</Text>
      <Text style={styles.subtitle}>Play online with friends</Text>

      <TouchableOpacity
        style={styles.playButton}
        onPress={() => router.push("../game/matchmaking")}
      >
        <Text style={styles.playButtonText}>Play</Text>
      </TouchableOpacity>
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#888",
    fontSize: 16,
    marginBottom: 20,
  },
  playButton: {
    marginTop: 12,
    backgroundColor: "#6C63FF",
    paddingVertical: 16,
    paddingHorizontal: 64,
    borderRadius: 12,
  },
  playButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});
