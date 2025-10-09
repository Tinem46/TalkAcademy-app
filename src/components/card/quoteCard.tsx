import {
  isLargeScreen,
  isSmallScreen,
  responsiveBorderRadius,
  responsiveFontSize,
  responsiveIconSize,
  responsiveSize,
  responsiveSpacing
} from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { useMascotManager } from "../mascotWithBubble/MascotManager";

interface QuoteCardProps {
  text: string;
  style?: ViewStyle;      // override container (margin, minHeight…)
  textStyle?: TextStyle;  // override question text
  showMicIcon?: boolean;
  colors?: {
    background?: string;
    border?: string;
    quoteMark?: string;
    question?: string;
    micBg?: string;
    micIcon?: string;
  };
}

const DEFAULTS = {
  background: "#E5E7EA",
  border: "transparent",
  quoteMark: "#1B7A6C",
  question: "#30414A",
  micBg: "#E7F4FF",
  micIcon: "#49A0D7",
};

const QuoteCard: React.FC<QuoteCardProps> = ({
  text,
  style,
  textStyle,
  showMicIcon = true,
  colors,
}) => {
  const c = { ...DEFAULTS, ...(colors || {}) };
  const { getMascotByType } = useMascotManager();
  const mascot = getMascotByType('logoFB');

  return (
    <View style={[styles.card, { backgroundColor: c.background, borderColor: c.border }, style]}>
      <View style ={{marginTop: 20}}></View>
      <Text style={[styles.question, { color: c.question }, textStyle]}>{text}</Text>

      {showMicIcon && (
        <View style={[styles.cardMic]}>
          <Image source={mascot.source} style={{ width: 44, height: 44 }} resizeMode="contain" />
         
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: responsiveSize(120), // Giảm thêm từ 140 xuống 120
    borderRadius: responsiveBorderRadius(14),
    paddingTop: responsiveSpacing(8), // Giảm thêm từ 12 xuống 8
    paddingBottom: responsiveSpacing(16), // Giảm thêm từ 20 xuống 16
    paddingHorizontal: responsiveSpacing(14), // Giảm thêm từ 16 xuống 14
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quoteMark: {
    fontSize: responsiveFontSize(24), // Giảm từ 32 xuống 28
    marginBottom: responsiveSpacing(0), // Giảm từ 8 xuống 4
    lineHeight: responsiveFontSize(24),
  },
  question: {
    fontSize: responsiveFontSize(22), // Giảm từ 24 xuống 22
    textAlign: "center",
    marginBottom: responsiveSpacing(36), // Giảm từ 28 xuống 16
    lineHeight: responsiveFontSize(28), // Giảm từ 32 xuống 28
  },
  cardMic: {
    position: "absolute",
    left: responsiveSpacing(12), // Giảm từ 16 xuống 12
    bottom: responsiveSpacing(8), // Giảm từ 12 xuống 8
    width: responsiveSize(28), // Giảm từ 32 xuống 28
    height: responsiveSize(28),
    borderRadius: responsiveSize(14),
    alignItems: "center",
    justifyContent: "center",
  },
});

export default QuoteCard;
