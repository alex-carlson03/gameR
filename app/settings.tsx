import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "../lib/UserContext";

const AVATAR_COLORS = [
  "#6C63FF",
  "#FF6584",
  "#43B97F",
  "#F5A623",
  "#4A90E2",
  "#E94E77",
  "#50C9CE",
  "#FF8C42",
];

export default function Settings() {
  const router = useRouter();
  const { user, isLoading, updateUser, signOut } = useUser();
  const [displayName, setDisplayName] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name);
      setSelectedColor(user.avatar_color ?? AVATAR_COLORS[0]);
    }
  }, [user]);

  async function handleSave() {
    if (!displayName.trim()) {
      Alert.alert("Invalid name", "Display name cannot be empty.");
      return;
    }
    setIsSaving(true);
    try {
      await updateUser({
        display_name: displayName.trim(),
        avatar_color: selectedColor,
      });
      Alert.alert("Saved", "Your profile has been updated.");
    } catch {
      Alert.alert("Error", "Failed to save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAF8" />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/menu")}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Display Name</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Enter display name"
          placeholderTextColor="#888"
          maxLength={24}
        />

        <Text style={styles.label}>Avatar Color</Text>
        <View style={styles.colorGrid}>
          {AVATAR_COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorSwatch,
                { backgroundColor: color },
                selectedColor === color && styles.colorSwatchSelected,
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>

        <View style={styles.previewRow}>
          <View
            style={[styles.avatarPreview, { backgroundColor: selectedColor }]}
          >
            <Text style={styles.avatarInitial}>
              {displayName.trim().charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
          <Text style={styles.previewName}>{displayName || "Player"}</Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
  centered: {
    flex: 1,
    backgroundColor: "#FAFAF8",
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 26,
    fontWeight: "300",
    color: "#1a1a1a",
    letterSpacing: 2,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
  },
  label: {
    color: "#555",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    color: "#1a1a1a",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: "#1a1a1a",
    transform: [{ scale: 1.15 }],
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 40,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarPreview: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  previewName: {
    color: "#1a1a1a",
    fontSize: 18,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    paddingHorizontal: 40,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#1a1a1a",
    fontSize: 16,
    fontWeight: "600",
  },
  signOutButton: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 8,
  },
  signOutText: {
    color: "#E94E77",
    fontSize: 16,
    fontWeight: "600",
  },
});
