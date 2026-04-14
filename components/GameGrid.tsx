import React, { useState } from "react";
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
  clientPlayerNumber?: number;
  onTilePress: (index: number) => void;
};

const GameGrid = ({
  lobbyId,
  board,
  clientPlayerNumber,
  onTilePress,
}: GameGridProps) => {
  const { width } = useWindowDimensions();
  const tileSize = width / 3;
  const { user } = useUser();
  const [clientColor, setClientColor] = useState<string>("");

  // Set client color based on player number
  React.useEffect(() => {
    if (user) {
      setClientColor(user.avatar_color);
    }
  }, [user]);

  return (
    <View style={styles.grid}>
      {board.map((cell, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.tile,
            { width: tileSize, height: tileSize },
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
  },
  tile: {
    borderWidth: 2,
    borderColor: "#333",
  },
  tileP1: {
    backgroundColor: "#4A90E2",
  },
  tileP2: {
    backgroundColor: "#E24A4A",
  },
});
