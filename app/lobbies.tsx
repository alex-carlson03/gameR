import GameGrid from "@/components/GameGrid";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { checkWin } from "../lib/gameLogic";

export default function LocalGame() {
  const router = useRouter();
  const [board, setBoard] = useState<number[]>(Array(9).fill(0));
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string>("");

  const handleTilePress = (index: number) => {
    if (gameOver || board[index] !== 0) return;

    const updatedBoard = [...board];
    updatedBoard[index] = currentPlayer;

    let newWinner = "";
    if (checkWin(updatedBoard, currentPlayer)) {
      newWinner = currentPlayer === 1 ? "Player 1" : "Player 2";
    } else if (updatedBoard.every((cell) => cell !== 0)) {
      newWinner = "Draw";
    }

    setBoard(updatedBoard);

    if (newWinner !== "") {
      setWinner(newWinner);
      setGameOver(true);
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(0));
    setCurrentPlayer(1);
    setGameOver(false);
    setWinner("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAF8" />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/tictacmenu")} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Local Game</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {!gameOver ? (
          <Text style={styles.turnText}>
            {currentPlayer === 1 ? "Player 1's turn" : "Player 2's turn"}
          </Text>
        ) : (
          <Text style={styles.resultText}>
            {winner === "Draw" ? "It's a draw!" : `${winner} wins!`}
          </Text>
        )}

        <GameGrid
          lobbyId="local"
          board={board}
          onTilePress={gameOver ? () => {} : handleTilePress}
          clientPlayerNumber={1}
        />

        {gameOver && (
          <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
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
    color: "#555",
    fontSize: 16,
    fontWeight: "600",
  },
  resultText: {
    color: "#1a1a1a",
    fontSize: 22,
    fontWeight: "700",
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
