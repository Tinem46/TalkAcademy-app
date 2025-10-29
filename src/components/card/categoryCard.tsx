import { ENHANCED_COLORS } from "@/app/utils/constant";
import { AnimationUtils } from "@/utils/animations";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

interface CategoryCardProps {
  category: {
    id: number;
    name: string;
    description: string;
  completedUsers: {
    id: number;
    email: string;
    avatar: string | null;
  }[];
    isFinished: boolean;
    isUnlocked: boolean;
  };
  onPress?: () => void;
  style?: ViewStyle;
}

const CategoryCard = ({ category, onPress, style }: CategoryCardProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      AnimationUtils.fadeIn(opacityAnim, 400),
      AnimationUtils.slideInFromBottom(translateYAnim, 400),
    ]).start();
  }, [opacityAnim, translateYAnim]);

  const handlePressIn = () => {
    if (!category.isUnlocked) return;
    AnimationUtils.spring(scaleAnim, 0.95, {
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    if (!category.isUnlocked) return;
    AnimationUtils.spring(scaleAnim, 1, {
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePress = () => {
  
      // Navigate to reading screen
      router.push(`/reading?categoryId=${category.id}&categoryName=${encodeURIComponent(category.name)}`);
    
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
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!category.isUnlocked}
        style={({ pressed }) => [
          styles.card,
          !category.isUnlocked && styles.lockedCard,
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
            <Ionicons 
              name={!category.isUnlocked ? "lock-closed" : "image-outline"} 
              size={18} 
              color={!category.isUnlocked ? "#9CA3AF" : ENHANCED_COLORS.secondary[600]} 
            />
          </View>
        </View>

        {/* Texts + Read more */}
        <View style={styles.content}>
          <Text style={[
            styles.title,
            !category.isUnlocked && styles.lockedTitle
          ]}>
            {category.name}
          </Text>
          <Text style={[
            styles.desc,
            !category.isUnlocked && styles.lockedDesc
          ]} numberOfLines={2}>
            {category.description}
          </Text>

          <View style={[
            styles.readMore,
            !category.isUnlocked && styles.lockedReadMore
          ]}>
            <Text style={[
              styles.readMoreText,
              !category.isUnlocked && styles.lockedReadMoreText
            ]}>
              {!category.isUnlocked ? "Locked" : "Read more"}
            </Text>
            <Ionicons 
              name={!category.isUnlocked ? "lock-closed" : "arrow-forward"} 
              size={16} 
              color={!category.isUnlocked ? "#9CA3AF" : ENHANCED_COLORS.secondary[500]} 
            />
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
    paddingBottom : 16,
  },

  lockedCard: { 
    borderColor: "#9CA3AF",
    shadowColor: "#9CA3AF",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },

  // Gradient background effect
  gradientBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    backgroundColor: BLUE_LIGHT,
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
  lockedTitle: {
    color: "#9CA3AF",
  },
  desc: {
    fontSize: 16,
    lineHeight: 24,
    color: ENHANCED_COLORS.text.secondary,
    marginRight: 10,
  },
  lockedDesc: {
    color: "#9CA3AF",
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
  lockedReadMore: {
    borderColor: "#9CA3AF",
    shadowColor: "#9CA3AF",
    shadowOpacity: 0.05,
  },
  readMoreText: { 
    color: BLUE, 
    fontWeight: "800",
    fontSize: 14,
  },
  lockedReadMoreText: {
    color: "#9CA3AF",
  },
});

export default CategoryCard;
