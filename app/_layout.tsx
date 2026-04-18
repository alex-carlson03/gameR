import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { UserProvider, useUser } from "../lib/UserContext";

function AuthGate() {
  const { user, isLoading } = useUser();
  const segments = useSegments();
  const router = useRouter();

  // Redirect based on auth state and current route
  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = (segments[0] as string) === "(auth)";
    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      router.replace("/");
    }
  }, [user, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="lobbies" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      {/* Handles auth state and redirects if no user is logged in */}
      <AuthGate />
    </UserProvider>
  );
}
