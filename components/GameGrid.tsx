import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

type GameGridProps = {
  lobbyId: string;
  board: number[];
  onTilePress: (index: number) => void;
};


const GameGrid = ({ lobbyId, board, onTilePress }: GameGridProps) => {
  const { width } = useWindowDimensions();
  const tileSize = width / 3;

  return (
    <View style={styles.grid}>
      {board.map((cell, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.tile,
            { width: tileSize, height: tileSize },
            cell === 1 && styles.tileClient,
            cell === 2 && styles.tileOpponent,
          ]}
          onPress={() => onTilePress(index)}
          activeOpacity={0.7}
        />
      ))}
    </View>
  );
};

export default GameGrid;

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tile: {
    borderWidth: 2,
    borderColor: "#333",
  },
  tileClient: {
    backgroundColor: "#4A90E2",
  },
  tileOpponent: {
    backgroundColor: "#E24A4A",
  },
});
