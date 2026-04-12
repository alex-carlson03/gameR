import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "./supabase";

const USER_UUID_KEY = "user_uuid";

export type User = {
  id: string;
  display_name: string;
  avatar_color: string;
  created_at: string;
};

type UserContextType = {
  user: User | null;
  isLoading: boolean;
  updateUser: (fields: { display_name?: string; avatar_color?: string }) => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  updateUser: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initUser();
  }, []);

  async function initUser() {
    try {
      const storedUuid = await AsyncStorage.getItem(USER_UUID_KEY);

      if (storedUuid) {
        // Fetch existing user from Supabase
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", storedUuid)
          .single();

        if (data && !error) {
          setUser(data as User);
          return;
        }
        // If fetch failed (e.g. row was deleted), fall through to create a new user
      }

      // Create a new user row in Supabase
      const { data, error } = await supabase
        .from("users")
        .insert({ display_name: "Player", avatar_color: "#6C63FF" })
        .select()
        .single();

      if (error || !data) {
        console.error("Failed to create user:", error);
        return;
      }

      await AsyncStorage.setItem(USER_UUID_KEY, data.id);
      setUser(data as User);
    } catch (err) {
      console.error("Error initializing user:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const updateUser = useCallback(
    async (fields: { display_name?: string; avatar_color?: string }) => {
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .update(fields)
        .eq("id", user.id)
        .select()
        .single();

      if (error || !data) {
        console.error("Failed to update user:", error);
        throw error;
      }

      setUser(data as User);
    },
    [user]
  );

  return (
    <UserContext.Provider value={{ user, isLoading, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
