import React from "react";
import { Text, View } from "react-native";

interface IProps {
  color?: string;
  paddingHorizontal?: number;
  text?: string;
}
const TextBetweenLine = (props: IProps) => {
  const { color, paddingHorizontal, text } = props;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          height: 1,
          backgroundColor: "#ccc",
          paddingHorizontal: paddingHorizontal ? paddingHorizontal : 78,
        }}
      />
      <Text
        style={{
          paddingHorizontal: 10,
          textAlign: "center",
          fontWeight: "800",
          color: color ? color : "white",
          fontSize: 16,
        }}
      >
        {text ? text : "or"}
      </Text>
      <View
        style={{
          height: 1,
          backgroundColor: "#ccc",
          paddingHorizontal: paddingHorizontal ? paddingHorizontal : 78,
        }}
      />
    </View>
  );
};

export default TextBetweenLine;
