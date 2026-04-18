import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { supabase } from "../../lib/supabase";

const signupSchema = z
  .object({
    displayName: z
      .string()
      .min(1, "Display name is required")
      .max(24, "Display name must be 24 characters or less"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFields = {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type SignupErrors = Partial<SignupFields>;

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState<SignupFields>({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<SignupErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  function update(field: keyof SignupFields) {
    return (value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSignup() {
    const result = signupSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: SignupErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SignupErrors;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: result.data.email,
        password: result.data.password,
      });

      if (error) {
        Alert.alert("Sign up failed", error.message);
        return;
      }

      if (data.user) {
        await supabase.from("users").insert({
          id: data.user.id,
          display_name: result.data.displayName,
          avatar_color: "#6C63FF",
        });
      }

      // Email confirmation is required, session will be null until confirmed
      if (!data.session) {
        Alert.alert(
          "Check your email",
          "We sent you a confirmation link. Please verify your email before signing in.",
          [{ text: "OK", onPress: () => router.replace("/(auth)/login") }],
        );
      }
      // If no email confirmation, onAuthStateChange in UserContext picks up the session
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAF8" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>gameR</Text>
          <Text style={styles.subtitle}>Create an account</Text>

          <View style={styles.form}>
            <TextInput
              style={[styles.input, errors.displayName && styles.inputError]}
              placeholder="Display Name"
              placeholderTextColor="#888"
              value={form.displayName}
              onChangeText={update("displayName")}
              maxLength={24}
            />
            {errors.displayName && (
              <Text style={styles.errorText}>{errors.displayName}</Text>
            )}

            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Email"
              placeholderTextColor="#888"
              value={form.email}
              onChangeText={update("email")}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Password"
              placeholderTextColor="#888"
              value={form.password}
              onChangeText={update("password")}
              secureTextEntry
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            <TextInput
              style={[
                styles.input,
                errors.confirmPassword && styles.inputError,
              ]}
              placeholder="Confirm Password"
              placeholderTextColor="#888"
              value={form.confirmPassword}
              onChangeText={update("confirmPassword")}
              secureTextEntry
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.replace("/(auth)/login")}
            >
              <Text style={styles.linkText}>
                Already have an account?{" "}
                <Text style={styles.linkAccent}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAF8" },
  inner: { flex: 1, paddingHorizontal: 24 },
  title: {
    fontSize: 42,
    fontWeight: "300",
    color: "#1a1a1a",
    letterSpacing: 4,
    textAlign: "center",
    marginTop: 48,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginBottom: 48,
  },
  form: { gap: 12, paddingBottom: 40 },
  input: {
    backgroundColor: "#fff",
    color: "#1a1a1a",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: { borderColor: "#E94E77" },
  errorText: { color: "#E94E77", fontSize: 13, marginTop: -4 },
  button: {
    backgroundColor: "#6C63FF",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  linkButton: { alignItems: "center", paddingVertical: 8 },
  linkText: { color: "#888", fontSize: 14 },
  linkAccent: { color: "#6C63FF", fontWeight: "600" },
});
