import { Stack } from "expo-router";
import { UserProvider } from "../lib/UserContext";

export default function RootLayout() {
  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="lobbies" />
        <Stack.Screen name="settings" />
      </Stack>
    </UserProvider>
  );
}
