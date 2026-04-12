import { useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Game() {
  const { lobbyId } = useLocalSearchParams<{ lobbyId: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game</Text>
      <Text style={styles.subtitle}>{lobbyId}</Text>
    </View>
  );
}

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
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#888",
    fontSize: 16,
  },
});
