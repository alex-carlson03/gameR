import GameGrid from "@/components/GameGrid";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { checkWin } from "../lib/gameLogic";

export default function LocalGame() {
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
    <View style={styles.container}>
      <Text style={styles.title}>Local Game</Text>

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
      />

      {gameOver && (
        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Text style={styles.resetText}>Play Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  turnText: {
    color: "#aaa",
    fontSize: 16,
  },
  resultText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  resetButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
