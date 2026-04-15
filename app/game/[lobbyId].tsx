import GameGrid from "@/components/GameGrid";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  const [statsSaved, setStatsSaved] = useState(false);

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
      setStatsSaved(false);
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
            router.push("/tictacmenu");
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
              } else {
                newWinner = "";
              }

              if (newWinner !== "") {
                setWinner(newWinner);
                setGameOver(true);
                saveGameResult(newWinner);
              } else {
                setGameOver(false);
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

  const saveGameResult = async (result: string) => {
    if (!user || statsSaved) return;

    try {
      const statsKey = `game_stats_${user.id}`;
      const savedStats = await AsyncStorage.getItem(statsKey);

      const stats = savedStats
        ? JSON.parse(savedStats)
        : { wins: 0, losses: 0, draws: 0 };

      if (result === "You") {
        stats.wins += 1;
      } else if (result === "Opponent") {
        stats.losses += 1;
      } else if (result === "Draw") {
        stats.draws += 1;
      } else {
        return;
      }

      await AsyncStorage.setItem(statsKey, JSON.stringify(stats));
      setStatsSaved(true);
    } catch (error) {
      console.error("Failed to save game stats:", error);
    }
  };

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

  // play again button. just resets the board state to an empty board state (all zeros)
  // and set winner and game over back to initial values. only the player who is player 1 in the lobby can reset the game since they are the ones who "hosted" the lobby
  const handlePlayAgain = async () => {
    if (!user) return;
    if (clientPlayerNumber !== 1) {
      console.warn("Only Player 1 can reset the game");
      return;
    }

    const newBoardState: BoardState = {
      cells: Array(9).fill(0),
      current_turn: currentTurn, // reset to the last turns player to keep alternating who starts first
    };

    const { error: updateError } = await supabase
      .from("lobbies")
      .update({ board_state: newBoardState })
      .eq("id", lobbyId);

    if (updateError) {
      console.error("Failed to reset board:", updateError);
      return;
    }

    setBoardState(newBoardState);
    setGameOver(false);
    setWinner("");
    setStatsSaved(false);
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
      router.push("/tictacmenu");
    }
  };

  const isMyTurn = user && currentTurn === user.id;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAF8" />

      {/* Header with leave lobby as back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={leaveLobby} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>X n O</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {gameOver ? (
          <Text style={styles.resultText}>
            {winner === "You"
              ? "You win!"
              : winner === "Opponent"
                ? "Opponent wins!"
                : "It's a draw!"}
          </Text>
        ) : (
          <Text style={styles.turnText}>
            {isMyTurn ? "Your turn" : "Opponent's turn"}
          </Text>
        )}

        <GameGrid
          lobbyId={lobbyId}
          board={board_state?.cells || Array(9).fill(0)}
          onTilePress={gameOver ? () => {} : handleTilePress}
          clientPlayerNumber={clientPlayerNumber}
        />
        {gameOver && clientPlayerNumber === 1 && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handlePlayAgain}
          >
            <Text style={styles.resetText}>Play Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF8",
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 32,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "300",
    color: "#1a1a1a",
    letterSpacing: 2,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  turnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  resultText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  resetButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    paddingHorizontal: 40,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  resetText: {
    color: "#1a1a1a",
    fontSize: 16,
    fontWeight: "600",
  },
});
