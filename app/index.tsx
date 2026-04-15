import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {Animated, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Landing() {
  const router = useRouter();

  // Subtle fade-in for the whole screen on first load
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleStart = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      router.replace("/menu");
    });
  };

  return (
     <Pressable style={{ flex: 1 }} onPress={handleStart}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAF8" />

        <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
          {/* Logo area */}
          <View style={styles.logoArea}>
            <Text style={styles.logoText}>gameR</Text>
          </View>
            <Text style={styles.subtitle}>Tap anywhere to get started</Text>
        </Animated.View>
      </SafeAreaView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF8",
  },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 52,
  },
  logoArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  logoText: {
    fontSize: 52,
    fontWeight: "300",
    color: "#1a1a1a",
    letterSpacing: 4,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6C63FF",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 10,
    fontWeight: "500",
    color: "#555",
    letterSpacing: 1,
  },
});
