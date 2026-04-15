import { Stack } from "expo-router";
import { UserProvider } from "../lib/UserContext";

export default function RootLayout() {
  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="menu" />
        <Stack.Screen name="tictacmenu" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="game" />
        <Stack.Screen name="lobbies" />
        <Stack.Screen name="settings" />
      </Stack>
    </UserProvider>
  );
}
