import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";

export interface SpeechBubbleProps {
  text: string;
  containerStyle?: StyleProp<ViewStyle>; // absolute pos for the bubble block
  bubbleStyle?: StyleProp<ViewStyle>; // box style
  textStyle?: StyleProp<TextStyle>;
  tail?: boolean; // two-dot tail
  tailBigOffset?: Partial<Record<"left" | "right" | "top" | "bottom", number>>;
  tailSmallOffset?: Partial<
    Record<"left" | "right" | "top" | "bottom", number>
  >;
  bgColor?: string;
  borderColor?: string;
  radius?: number;
  numberOfLines?: number; // optional clamp text lines
  responsive?: boolean; // Thêm prop để bật/tắt responsive
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  text,
  containerStyle,
  bubbleStyle,
  textStyle,
  tail = true,
  tailBigOffset = { left: 20, bottom: -10 },
  tailSmallOffset = { left: 10, bottom: -20 },
  bgColor = "#E9F4FF",
  borderColor = "#9CCEF6",
  radius = 16,
  numberOfLines,
  responsive = true,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Tính toán kích thước và vị trí responsive
  const getResponsiveStyles = () => {
    if (!responsive) {
      return {
        container: containerStyle,
        bubble: bubbleStyle,
        text: textStyle,
        tailBig: tailBigOffset,
        tailSmall: tailSmallOffset,
      };
    }

    // Kích thước bubble dựa trên màn hình
    const maxWidth = Math.min(screenWidth * 0.8, 320);
    const minWidth = Math.max(screenWidth * 0.6, 200);
    
    // Font size responsive
    const baseFontSize = Math.max(12, Math.min(16, screenWidth * 0.04));
    const lineHeight = baseFontSize * 1.4;

    // Padding responsive
    const horizontalPadding = Math.max(12, screenWidth * 0.04);
    const verticalPadding = Math.max(18, screenHeight * 0.015);

    // Border radius responsive
    const responsiveRadius = Math.max(12, Math.min(20, screenWidth * 0.04));

    // Tail size responsive
    const tailSize = Math.max(16, Math.min(16, screenWidth * 0.035));

    return {
      container: [
        {
          maxWidth,
          minWidth,
        },
        containerStyle,
      ],
      bubble: [
        {
          paddingHorizontal: horizontalPadding,
          paddingVertical: verticalPadding,
          borderRadius: responsiveRadius,
        },
        bubbleStyle,
      ],
      text: [
        {
          fontSize: baseFontSize,
          lineHeight: lineHeight,
        },
        textStyle,
      ],
      tailBig: {
        ...tailBigOffset,
        width: tailSize,
        height: tailSize,
        borderRadius: tailSize / 2,
      },
      tailSmall: {
        ...tailSmallOffset,
        width: tailSize * 0.6,
        height: tailSize * 0.6,
        borderRadius: (tailSize * 0.6) / 2,
      },
    };
  };

  const responsiveStyles = getResponsiveStyles();

  return (
    <View style={[styles.wrap, responsiveStyles.container]}>
      <View
        style={[
          styles.bubble,
          { backgroundColor: bgColor, borderColor, borderRadius: radius },
          responsiveStyles.bubble,
        ]}
      >
        <Text
          style={[styles.msg, responsiveStyles.text]}
          numberOfLines={numberOfLines}
          ellipsizeMode="tail"
        >
          {text}
        </Text>
      </View>

      {tail && (
        <>
          <View
            style={[
              styles.tailBig,
              { backgroundColor: bgColor, borderColor },
              responsiveStyles.tailBig,
            ]}
          />
          <View
            style={[
              styles.tailSmall,
              { backgroundColor: bgColor, borderColor },
              responsiveStyles.tailSmall,
            ]}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { 
    position: "absolute", 
    maxWidth: 270,
    zIndex: 33, // Đảm bảo bubble hiển thị trên mascot
  },
  bubble: {
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#64B5F6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  msg: { 
    color: "#1565C0", 
    fontSize: 15, 
    lineHeight: 21, 
    textAlign: "left",
    flexWrap: "wrap",
    fontWeight: "600",
    textShadowColor: "rgba(255, 255, 255, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tailBig: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    zIndex: 4,
    shadowColor: "#64B5F6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tailSmall: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    zIndex: 5,
    shadowColor: "#64B5F6",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default SpeechBubble;
