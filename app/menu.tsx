import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


type GameOption = {
  label: string;
  sublabel: string;
  route: string;
  accent: string;
};

const GAME_OPTIONS: GameOption[] = [
  {
    label: "X n O's",
    sublabel: "Tic-tac-toe · Online & local",
    route: "/tictacmenu",
    accent: "#6C63FF",
  },
  {
    label: "2048",
    sublabel: "Future game coming soon!",
    route: "/2048menu",
    accent: "#4A90E2",
  },
  {
    label: "Profile",
    sublabel: "View and edit profile",
    route: "/settings",
    accent: "#4A90E2",
  },
];

export default function Menu() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAF8" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>gameR</Text>
        <TouchableOpacity
          onPress={() => router.push("/settings")}
          style={styles.settingsBtn}
        >
          <Ionicons name="settings-outline" size={24} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      {/* Game options */}
      <View style={styles.content}>
      <View style={styles.optionList}>
        {GAME_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.label}
            style={styles.optionItem}
            onPress={() => router.push(option.route as any)}
            activeOpacity={0.7}
          >
            <View style={styles.optionText}>
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Text style={styles.optionSublabel}>{option.sublabel}</Text>
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
  headerSpacer: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "300",
    color: "#1a1a1a",
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  settingsBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  optionList: {
    gap: 15,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000",
    paddingVertical: 28,
    paddingHorizontal: 16,
    gap: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    flex: 1,
    gap: 5,
    alignItems: "center",
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  optionSublabel: {
    fontSize: 13,
    color: "#999",
  },
});
