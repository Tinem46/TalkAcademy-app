import React from "react";
import { StyleSheet, Text, View } from "react-native";

type LevelProgressBarProps = {
  currentLevel: number;
  completedPercentage: number; // 0-100
};

const LevelProgressBar: React.FC<LevelProgressBarProps> = ({
  currentLevel,
  completedPercentage,
}) => {
  const levels = [
    { name: "BEGINNER", min: 0, max: 3, color: "#10B981" },
    { name: "INTERMEDIATE", min: 3, max: 6, color: "#F59E0B" },
    { name: "ADVANCED", min: 6, max: 10, color: "#8B5CF6" },
  ];

  const getCurrentLevelInfo = () => {
    if (currentLevel < 3) return { ...levels[0] };
    if (currentLevel < 6) return { ...levels[1] };
    return { ...levels[2] };
  };

  const currentLevelInfo = getCurrentLevelInfo();

  return (
    <View style={styles.container}>
      <View style={styles.levelProgressContainer}>
        <View style={styles.levelProgressBar}>
          <View
            style={[
              styles.levelProgressFill,
              {
                width: `${Math.min(100, Math.max(0, completedPercentage))}%`,
                backgroundColor: currentLevelInfo.color,
              },
            ]}
          />
        </View>
        <Text style={[styles.levelProgressText, { color: currentLevelInfo.color }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          Level {currentLevel} - {completedPercentage.toFixed(1)}% hoàn thành
        </Text>
      </View>

      <View style={styles.levelMilestones}>
        {levels.map((level) => (
          <View key={level.name} style={styles.levelMilestone}>
            <View
              style={[
                styles.levelMilestoneDot,
                currentLevel >= level.min
                  ? { backgroundColor: level.color }
                  : { backgroundColor: "#E5E7EB" },
              ]}
            />
            <Text
              style={[
                styles.levelMilestoneText,
                currentLevel >= level.min
                  ? { color: level.color }
                  : { color: "#9CA3AF" },
              ]}
              numberOfLines={1}
            >
              {level.name}
            </Text>
            <Text
              style={[
                styles.levelMilestoneRange,
                currentLevel >= level.min
                  ? { color: level.color }
                  : { color: "#9CA3AF" },
              ]}
            >
              {level.min}-{level.max}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  levelProgressContainer: {
    marginBottom: 12,
  },
  levelProgressBar: {
    height: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  levelProgressFill: {
    height: "100%",
    borderRadius: 8,
  },
  levelProgressText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  levelMilestones: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  levelMilestone: {
    alignItems: "center",
    flex: 1,
  },
  levelMilestoneDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  levelMilestoneText: {
    fontSize: 9,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 2,
  },
  levelMilestoneRange: {
    fontSize: 8,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default LevelProgressBar;


