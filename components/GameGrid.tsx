import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useUser } from "../lib/UserContext";

type GameGridProps = {
  lobbyId: string;
  board: number[];
  onTilePress: (index: number) => void;
  clientPlayerNumber: number;
};

const GameGrid = ({
  lobbyId,
  clientPlayerNumber,
  board,
  onTilePress,
}: GameGridProps) => {
  const { user } = useUser();
  const clientColor = user?.avatar_color || "#4A90E2";
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.grid, { width: width - 48 }]}>
      {board.map((cell, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.tile,
            cell === 1 &&
              styles.tileP1 && {
                backgroundColor:
                  clientPlayerNumber === 1 ? clientColor : "#E24A4A",
              },
            cell === 2 &&
              styles.tileP2 && {
                backgroundColor:
                  clientPlayerNumber === 2 ? clientColor : "#E24A4A",
              },
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
    aspectRatio: 1,
  },
  tile: {
    width: "33.333%",
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: "#1a1a1a",
  },
  tileP1: {
    backgroundColor: "#4A90E2",
  },
  tileP2: {
    backgroundColor: "#E24A4A",
  },
});
