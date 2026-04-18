import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "./supabase";

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
  signOut: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  updateUser: async () => {},
  signOut: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(authUserId: string) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUserId)
        .single();

      if (data && !error) {
        setUser(data as User);
        return;
      }

      // No profile yet, create one with defaults
      const { data: newProfile, error: createError } = await supabase
        .from("users")
        .insert({ id: authUserId, display_name: "Player", avatar_color: "#6C63FF" })
        .select()
        .single();

      if (createError || !newProfile) {
        console.error("Failed to create user profile:", createError);
        return;
      }

      setUser(newProfile as User);
    } catch (err) {
      console.error("Error loading profile:", err);
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

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, updateUser, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
