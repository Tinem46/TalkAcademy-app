import { ENHANCED_COLORS } from "@/app/utils/constant";
import { AnimationUtils } from "@/utils/animations";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface Props {
  score: number; // 0..100
  title?: string; // "Tốt lắm"
  message?: string; // mô tả ngắn
}

const LatestEvaluationCard: React.FC<Props> = ({
  score,
  title = "Tốt lắm",
  message = "Hãy cố gắng nhé, Cố lên Hãy cố gắng nhé, Cố lên Hãy cố gắng nhé, Cố lên",
}) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;
  const scoreScaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation with stagger
    const entranceAnimation = Animated.stagger(100, [
      AnimationUtils.fadeIn(opacityAnim, 500),
      AnimationUtils.scaleIn(scaleAnim, 500),
      AnimationUtils.slideInFromBottom(translateYAnim, 500),
    ]);

    // Score animation with bounce
    const scoreAnimation = AnimationUtils.bounce(scoreScaleAnim, 800);

    // Start animations
    entranceAnimation.start();
    
    // Delay score animation slightly
    setTimeout(() => {
      scoreAnimation.start();
    }, 300);

    // Subtle pulse animation for the score circle
    const pulseAnimation = AnimationUtils.pulse(pulseAnim, 2000);
    setTimeout(() => {
      pulseAnimation.start();
    }, 1000);
  }, []);

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim }
          ],
        },
      ]}
    >
      <Text style={styles.sectionTitle}>Đánh giá mới nhất</Text>

      <View style={styles.row}>
        {/* Vòng tròn điểm với animation */}
        <Animated.View 
          style={[
            styles.circleOuter,
            {
              transform: [
                { scale: scoreScaleAnim },
                { scale: pulseAnim }
              ],
            },
          ]}
        >
          <View style={styles.circleRing}>
            <View style={styles.circleInner}>
              <Text style={styles.score}>{score}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Khối nội dung với enhanced styling */}
        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>{title}</Text>
          <Text style={styles.noteText} numberOfLines={3}>
            {message}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const CARD_BG = ENHANCED_COLORS.secondary[50]; // nền thẻ
const NOTE_BG = ENHANCED_COLORS.neutral[100]; // nền khối ghi chú
const TEXT_DARK = ENHANCED_COLORS.text.primary;
const TEXT_BODY = ENHANCED_COLORS.text.secondary;
const BLUE = ENHANCED_COLORS.secondary[500];
const BLUE_RING = ENHANCED_COLORS.secondary[200];

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    backgroundColor: CARD_BG,
    padding: 24,
    // Enhanced shadow
    shadowColor: ENHANCED_COLORS.secondary[500],
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    borderWidth: 1,
    borderColor: ENHANCED_COLORS.secondary[100],
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_DARK,
    marginBottom: 32,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },

  // Vòng tròn điểm với enhanced styling
  circleOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: ENHANCED_COLORS.secondary[100],
    alignItems: "center",
    justifyContent: "center",
    // Enhanced shadow
    shadowColor: ENHANCED_COLORS.secondary[500],
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  circleRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
    // Gradient-like effect with shadow
    shadowColor: BLUE,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  circleInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: ENHANCED_COLORS.background.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: BLUE_RING,
    // Subtle inner shadow
    shadowColor: ENHANCED_COLORS.secondary[400],
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  score: {
    fontSize: 26,
    fontWeight: "900",
    color: TEXT_DARK,
    letterSpacing: 1,
  },

  // Khối nội dung với enhanced styling
  noteBox: {
    marginLeft: 16,
    flex: 1,
    backgroundColor: NOTE_BG,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    // Enhanced shadow
    shadowColor: ENHANCED_COLORS.neutral[400],
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
    borderColor: ENHANCED_COLORS.neutral[200],
  },
  noteTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT_DARK,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  noteText: {
    fontSize: 16,
    lineHeight: 24,
    color: TEXT_BODY,
    letterSpacing: 0.2,
  },
});

export default LatestEvaluationCard;
