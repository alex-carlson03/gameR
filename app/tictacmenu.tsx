import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {StatusBar, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MenuItem = {
  label: string;
  sublabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  accent: string;
};

const MENU_ITEMS: MenuItem[] = [
  {
    label: "Online",
    sublabel: "Play against the world",
    icon: "globe-outline",
    route: "/game/matchmaking",
    accent: "#463fc5",
  },
  {
    label: "Local Game",
    sublabel: "PvP on the same device",
    icon: "people-outline",
    route: "/lobbies",
    accent: "#43B97F",
  },
  {
    label: "Match History",
    sublabel: "Review your past games",
    icon: "time-outline",
    route: "/referencetictac", // swap for /match-history once built
    accent: "#F5A623",
  },
];

export default function TicTacMenu() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAF8" />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>X n O</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Menu items */}
      <View style={styles.menuContainer}>
        <Text style={styles.subtitle}>Classic Tic-Tac-Toe. P1 is X, P2 is O.</Text>
        <Text style={styles.vs}>Play</Text>
      <View style={styles.menuList}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >          
            <Ionicons name={item.icon} size={45} color={item.accent} />
            <View style={styles.menuText}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuSublabel}>{item.sublabel}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF8",
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 32,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: 1,
  },
    headerSpacer: {
    width: 40,
    height: 40,
  },
  menuContainer:{
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#cecece",
    borderRadius: 2,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: -1, height: -1 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
    subtitle: {
    textAlign: "center",
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
    paddingBottom: 50,
  },
  vs: {
    textAlign: "center",
    fontSize: 30,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 24,
  },
  menuList: {
    gap: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eeeeee",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  iconBox: {
    width: 55,
    height: 55,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    flex: 1,
    gap: 2,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  menuSublabel: {
    fontSize: 13,
    color: "#999",
  },
});
