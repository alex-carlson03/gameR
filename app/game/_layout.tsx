import { UserProvider } from "@/lib/UserContext";
import { Stack } from "expo-router";

export default function GameLayout() {
  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="matchmaking"
          options={{
            headerShown: false,
            title: "Matchmaking",
            headerStyle: { backgroundColor: "#1a1a2e" },
            headerTintColor: "#fff",
          }}
        />
      </Stack>
    </UserProvider>
  );
}
