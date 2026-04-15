import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PieChart } from "react-native-chart-kit";
import { useUser } from "@/lib/UserContext";
import { useRouter } from "expo-router";

const screenWidth = Dimensions.get("window").width;

export default function Stats() {
  const { user } = useUser();
  const router = useRouter();
 

  const [stats, setStats] = useState({
    wins: 0,
    losses: 0,
    draws: 0,
  });

  const loadStats = async () => {
    if (!user) return;

    try {
      const statsKey = `game_stats_${user.id}`;
      const savedStats = await AsyncStorage.getItem(statsKey);

      const parsed = savedStats
        ? JSON.parse(savedStats)
        : { wins: 0, losses: 0, draws: 0 };

      setStats(parsed);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  useEffect(() => {
    loadStats();
  }, [user]);

  const totalGames = stats.wins + stats.losses + stats.draws;

  const chartData = [
    {
      name: "Wins",
      population: stats.wins,
      color: "#24b500",
      legendFontColor: "#1a1a1a",
      legendFontSize: 13,
    },
    {
      name: "Losses",
      population: stats.losses,
      color: "#d53232",
      legendFontColor: "#1a1a1a",
      legendFontSize: 13,
    },
    {
      name: "Draws",
      population: stats.draws,
      color: "#B0B0B0",
      legendFontColor: "#1a1a1a",
      legendFontSize: 13,
    },
  ];

  const hasData = stats.wins > 0 || stats.losses > 0 || stats.draws > 0;

  return (
    <SafeAreaView style={styles.container}>

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/tictacmenu")} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stats</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* PIE CHART */}
      <View style={styles.chartContainer}>
        {!hasData ? (
          <Text style={styles.emptyText}>No games played yet</Text>
        ) : (
          <PieChart
            data={chartData}
            width={screenWidth}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="20"
            absolute
          />
        )}
      </View>

      {/* STATS CARDS */}
      <View style={styles.cards}>
        <View style={styles.card}>
          <Text style={styles.cardValue}>{totalGames}</Text>
          <Text style={styles.cardLabel}>Games</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardValue}>{stats.wins}</Text>
          <Text style={styles.cardLabel}>Wins</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardValue}>{stats.losses}</Text>
          <Text style={styles.cardLabel}>Losses</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardValue}>{stats.draws}</Text>
          <Text style={styles.cardLabel}>Draws</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF8",
    paddingHorizontal: 24,
    paddingTop: 20,
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
    fontSize: 30,
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: 1,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "300",
    color: "#1a1a1a",
    letterSpacing: 2,
    marginBottom: 20,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
  },
  cards: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 6,
    paddingVertical: 20,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  cardLabel: {
    marginTop: 6,
    fontSize: 13,
    color: "#888",
    letterSpacing: 1,
  },
});
