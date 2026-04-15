import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  const { user, isLoading, updateUser } = useUser();
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
      <Text style={styles.title}>Settings</Text>

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
        <View style={[styles.avatarPreview, { backgroundColor: selectedColor }]}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    padding: 24,
  },
  centered: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 32,
  },
  label: {
    color: "#aaa",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#2a2a4a",
    color: "#fff",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#3a3a5a",
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
    borderColor: "#fff",
    transform: [{ scale: 1.15 }],
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 40,
    backgroundColor: "#2a2a4a",
    padding: 16,
    borderRadius: 12,
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
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#6C63FF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
