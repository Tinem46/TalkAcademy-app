import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = { score: number; message: string };

export default function ResultCard({ score, message }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.score}>
        <Text style={styles.scoreNum}>{`${Math.round(score)}%`}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.msg}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    backgroundColor: "#F6F8FA",
    borderWidth: 1,
    borderColor: "#D9E2EA",
    padding: 14,
  },
  score: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#DBEEFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 6,
    borderColor: "#8FD0FF",
  },
  scoreNum: { fontSize: 20, fontWeight: "900", color: "#0F3D57" },
  msg: { color: "#4F6877", lineHeight: 18 },
});
