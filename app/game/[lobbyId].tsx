import GameGrid from "@/components/GameGrid";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useUser } from "../../lib/UserContext";
import { checkWin } from "../../lib/gameLogic";
import { supabase } from "../../lib/supabase";

type BoardState = {
  cells: number[];
  current_turn: string;
};

export default function Game() {
  const { lobbyId } = useLocalSearchParams<{ lobbyId: string }>();
  const { user } = useUser();
  const [board_state, setBoardState] = useState<BoardState | null>(null);
  const [currentTurn, setCurrentTurn] = useState<string>("");
  const router = useRouter();
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string>("");
  const [clientPlayerNumber, setClientPlayerNumber] = useState<number>(0);

  // Fetch initial lobby state on mount
  useEffect(() => {
    if (!lobbyId) return;

    const fetchLobbyState = async () => {
      const { data: lobby, error } = await supabase
        .from("lobbies")
        .select("player1_id, player2_id, board_state")
        .eq("id", lobbyId)
        .eq("status", "active")
        .single();

      if (error || !lobby) {
        console.error("Failed to fetch lobby state:", error);
        return;
      }

      setBoardState(lobby.board_state as BoardState);
      setClientPlayerNumber(lobby.player1_id === user?.id ? 1 : 2);
      // always starts with player 1's turn, if current_turn is -1 we know it's the first move of the game and we can set it to player 1's id
      setCurrentTurn(lobby.player1_id);
    };

    fetchLobbyState();
  }, [lobbyId]);

  // Subscribe to real-time updates for this lobby
  useEffect(() => {
    if (!lobbyId) return;

    const subscription = supabase
      .channel(`lobby-${lobbyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lobbies",
          filter: `id=eq.${lobbyId}`,
        },
        (payload) => {
          const newRecord = payload.new as {
            id: string;
            board_state: BoardState;
          };
          if (payload.eventType === "DELETE") {
            // Lobby was deleted (probably because opponent left), navigate back to matchmaking
            router.push("/");
          } else {
            setBoardState(newRecord.board_state);
            setCurrentTurn(newRecord.board_state.current_turn);
            // check win conditions
            if (user) {
              let newWinner = "";
              if (checkWin(newRecord.board_state.cells, clientPlayerNumber)) {
                newWinner = "You";
              } else if (
                checkWin(
                  newRecord.board_state.cells,
                  clientPlayerNumber === 1 ? 2 : 1,
                )
              ) {
                newWinner = "Opponent";
              } else if (
                newRecord.board_state.cells.every((cell) => cell !== 0)
              ) {
                newWinner = "Draw";
              }

              if (newWinner !== "") {
                setWinner(newWinner);
                setGameOver(true);
              }
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [lobbyId, clientPlayerNumber]);

  //  Handle tile press
  const handleTilePress = async (index: number) => {
    if (!user) return;

    // Fetch current lobby state
    const { data: lobby, error: fetchError } = await supabase
      .from("lobbies")
      .select("player1_id, player2_id, board_state")
      .eq("id", lobbyId)
      .eq("status", "active")
      .single();

    if (fetchError || !lobby) {
      console.error("Lobby not found:", fetchError);
      return;
    }

    const board_state = lobby.board_state as BoardState;

    // Check it's the client's turn
    const effectiveTurn =
      board_state.current_turn === "-1"
        ? lobby.player1_id
        : board_state.current_turn;
    if (effectiveTurn !== user.id) {
      console.warn("Not your turn");
      return;
    }

    // Check tile is empty
    if (board_state.cells[index] !== 0) {
      console.warn("Tile already occupied");
      return;
    }

    // Determine player number and next turn
    const playerNumber = lobby.player1_id === user.id ? 1 : 2;
    const nextTurn =
      lobby.player1_id === user.id ? lobby.player2_id : lobby.player1_id;

    const updatedCells = [...board_state.cells];
    updatedCells[index] = playerNumber;
    const newBoardState: BoardState = {
      cells: updatedCells,
      current_turn: nextTurn,
    };

    const { error: updateError } = await supabase
      .from("lobbies")
      .update({ board_state: newBoardState })
      .eq("id", lobbyId);

    if (updateError) {
      console.error("Failed to update board:", updateError);
    } else {
      setBoardState(newBoardState);
    }
  };

  // handle leaving the lobby. should delete the lobby from the database which will trigger a real-time update for the opponent and return them to the matchmaking screen
  const leaveLobby = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("lobbies")
      .delete()
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
      .eq("status", "active");

    if (error) {
      console.error("Failed to leave lobby:", error);
    } else {
      router.push("/");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>{lobbyId}</Text>
      <Text>
        {user && currentTurn === user.id ? "Your turn" : "Opponent's turn"}
      </Text>
      <TouchableOpacity onPress={leaveLobby} style={{ marginBottom: 20 }}>
        <Text style={{ color: "#E24A4A" }}>Leave Lobby</Text>
      </TouchableOpacity>
      {gameOver && (
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
          {winner === "You"
            ? "You win!"
            : winner === "Opponent"
              ? "Opponent wins!"
              : "It's a draw!"}
        </Text>
      )}
      <GameGrid
        lobbyId={lobbyId}
        board={board_state?.cells || Array(9).fill(0)}
        onTilePress={gameOver ? () => {} : handleTilePress}
      />
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
  subtitle: {
    color: "#888",
    fontSize: 16,
  },
});
