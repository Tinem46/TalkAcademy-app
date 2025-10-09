import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string; // "Bài 2"
  headline?: string; // "Đọc"
  subline?: string; // "/naɪt/"
  onBack?: () => void;
};

export default function HeaderBar({ title, headline, subline, onBack }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable onPress={onBack} hitSlop={14} style={styles.back}>
        <Ionicons name="chevron-back" size={22} color="#111" />
      </Pressable>

      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
        {!!headline && <Text style={styles.headline}>{headline}</Text>}
        {!!subline && <Text style={styles.subline}>{subline}</Text>}
      </View>

      <View style={{ width: 36 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingTop: 2,
    paddingBottom: 6,
  },
  back: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  center: { flex: 1, alignItems: "center" },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1B7A6C",
    letterSpacing: 0.2,
  },
  headline: { color: "#0F3D57", fontWeight: "900", fontSize: 28, marginTop: 2 },
  subline: { color: "#6C7A86", fontSize: 12, marginTop: 2 },
});
