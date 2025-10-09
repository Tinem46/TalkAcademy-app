import { ENHANCED_COLORS } from "@/app/utils/constant";
import { AnimationUtils } from "@/utils/animations";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

interface PathCardProps {
  title: string;
  desc: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

const PathCard: React.FC<PathCardProps> = ({
  title,
  desc,
  selected,
  onPress,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      AnimationUtils.fadeIn(opacityAnim, 400),
      AnimationUtils.slideInFromBottom(translateYAnim, 400),
    ]).start();
  }, []);

  const handlePressIn = () => {
    AnimationUtils.spring(scaleAnim, 0.95, {
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    AnimationUtils.spring(scaleAnim, 1, {
      tension: 300,
      friction: 10,
    }).start();
  };

  return (
    <Animated.View
      style={[
        {
          opacity: opacityAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim }
          ],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.card,
          selected && styles.cardActive,
          style,
        ]}
      >
        {/* Gradient background effect */}
        <View style={styles.gradientBg} />
        
        {/* Khối trang trí loang phía sau icon */}
        <View style={styles.softBg} />

        {/* Icon tile */}
        <View style={styles.iconWrap}>
          <View style={styles.iconInner}>
            <Ionicons name="image-outline" size={18} color={ENHANCED_COLORS.secondary[600]} />
          </View>
        </View>

        {/* Texts + Read more */}
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.desc} numberOfLines={2}>
            {desc}
          </Text>

          <View style={styles.readMore}>
            <Text style={styles.readMoreText}>Read more</Text>
            <Ionicons name="arrow-forward" size={16} color={ENHANCED_COLORS.secondary[500]} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const CARD_BORDER = ENHANCED_COLORS.border.light;
const BLUE = ENHANCED_COLORS.secondary[500];
const BLUE_LIGHT = ENHANCED_COLORS.secondary[50];

const styles = StyleSheet.create({
  card: {
    position: "relative",
    flexDirection: "row",
    gap: 19,
    padding: 16,
    borderRadius: 20,
    backgroundColor: ENHANCED_COLORS.background.primary,
    borderWidth: 1,
    borderColor: CARD_BORDER,

    // Enhanced shadow
    shadowColor: ENHANCED_COLORS.secondary[500],
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  cardActive: { 
    borderColor: ENHANCED_COLORS.secondary[500],
    shadowColor: ENHANCED_COLORS.secondary[500],
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },

  // Gradient background effect
  gradientBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    backgroundColor: `linear-gradient(135deg, ${ENHANCED_COLORS.secondary[50]} 0%, ${ENHANCED_COLORS.background.primary} 100%)`,
    opacity: 0.3,
  },

  // nền loang (fake dot gradient) bên trái
  softBg: {
    position: "absolute",
    left: 8,
    top: 10,
    width: 74,
    height: 84,
    borderRadius: 16,
    backgroundColor: BLUE_LIGHT,
    opacity: 0.6,
    // Enhanced shadow effect
    shadowColor: ENHANCED_COLORS.secondary[300],
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: ENHANCED_COLORS.secondary[50],
    borderWidth: 1,
    borderColor: ENHANCED_COLORS.secondary[200],
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    // Enhanced shadow
    shadowColor: ENHANCED_COLORS.secondary[300],
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  iconInner: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: ENHANCED_COLORS.background.primary,
    borderWidth: 1,
    borderColor: ENHANCED_COLORS.secondary[200],
    alignItems: "center",
    justifyContent: "center",
    // Subtle shadow
    shadowColor: ENHANCED_COLORS.secondary[400],
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },

  content: { flex: 1, paddingRight: 4 },
  title: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
    color: ENHANCED_COLORS.text.primary,
    marginBottom: 16,
  },
  desc: {
    fontSize: 16,
    lineHeight: 24,
    color: ENHANCED_COLORS.text.secondary,
    marginRight: 10,
  },

  readMore: {
    alignSelf: "flex-end",
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: "transparent",
    borderColor: ENHANCED_COLORS.secondary[500],
    // Subtle shadow
    shadowColor: ENHANCED_COLORS.secondary[500],
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  readMoreText: { 
    color: BLUE, 
    fontWeight: "800",
    fontSize: 14,
  },
});

export default PathCard;
