import { RealtimeChannel } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useUser } from "../../lib/UserContext";
import { supabase } from "../../lib/supabase";

type MatchStatus = "idle" | "searching" | "matched";

export default function Matchmaking() {
  const { user } = useUser();
  const router = useRouter();
  const [status, setStatus] = useState<MatchStatus>("idle");
  const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const subscriptionRef = useRef<RealtimeChannel | null>(null);

  const joinQueue = async () => {
    setStatus("searching");

    if (!user) {
      console.error("User not authenticated");
      setStatus("idle");
      return;
    }

    // add player to queue
    const { error } = await supabase
      .from("matchmaking_players")
      .insert({ user_id: user.id });

    if (error) {
      console.error("Error joining matchmaking queue:", error);
      setStatus("idle");
      leaveQueue(); // Ensure we clean up any partial state
      router.replace("/"); // Navigate back to home on error
      return;
    }

    startPolling();

    subscribeToMatchmaking();

    // Safety timeout: after 30 seconds, check if we're stuck
    setTimeout(async () => {
      if (status === "searching") {
        const { data: lobby } = await supabase
          .from("lobbies")
          .select("id")
          .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
          .eq("status", "active")
          .maybeSingle();

        if (lobby) {
          handleMatchFound(lobby.id);
        }
      }
    }, 30000);
  };

  const startPolling = () => {
    pollingInterval.current = setInterval(async () => {
      if (user) {
        // check if we a re already in a lobby (in case we missed the realtime event)
        const { data: existingLobby } = await supabase
          .from("lobbies")
          .select("id")
          .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingLobby) {
          handleMatchFound(existingLobby.id);
          return;
        }
      }

      const { data, error } = await supabase.rpc("match_players");

      if (data) {
        handleMatchFound(data);
      }
    }, 3000);
  };

  const subscribeToMatchmaking = () => {
    if (!user) return;

    subscriptionRef.current = supabase
      .channel("matchmaking-channel")
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "matchmaking_players",
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          // We got removed from queue, find our lobby
          const { data: lobby } = await supabase
            .from("lobbies")
            .select("id")
            .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (lobby) {
            handleMatchFound(lobby.id);
          }
        },
      )
      .subscribe();
  };

  const handleMatchFound = (lobbyId: string) => {
    setStatus("matched");
    cleanup();

    // Navigate to game screen
    setTimeout(() => {
      router.replace({ pathname: "/game/[lobbyId]", params: { lobbyId } });
    }, 1000); // Small delay to show "Match Found!" message
  };

  const leaveQueue = async () => {
    if (!user) return;

    await supabase.from("matchmaking_players").delete().eq("user_id", user.id);

    cleanup();
    setStatus("idle");
    router.replace("/"); // Navigate back to home
  };

  const cleanup = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }

    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }
  };

  // Join queue once the user is available
  useEffect(() => {
    if (user) {
      joinQueue();
    }
  }, [user?.id]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      cleanup();
      // Best-effort remove from queue — safe no-op if row doesn't exist
      if (user) {
        supabase.from("matchmaking_players").delete().eq("user_id", user.id);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => {
          leaveQueue();
        }}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Finding a Match...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  cancelButton: {
    position: "absolute",
    top: 40,
    backgroundColor: "#6C63FF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
