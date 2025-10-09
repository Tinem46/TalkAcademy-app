import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  text: string;
  variant?: "default" | "success" | "warning" | "error";
};

export default function PromptCard({ text, variant = "default" }: Props) {
  const theme =
    variant === "success"
      ? { bg: "#F2FBEF", border: "#8AD16A", text: "#3B6C2D" }
      : variant === "warning"
      ? { bg: "#FFF9E8", border: "#F2C46D", text: "#5E4B11" }
      : variant === "error"
      ? { bg: "#FFF1F1", border: "#EE8A8A", text: "#7A2A2A" }
      : { bg: "#F7F9FB", border: "#C9D3DB", text: "#2C3E50" };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.bg, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.text, { color: theme.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 8,
  },
  text: { lineHeight: 20 },
});
