import { ENHANCED_COLORS } from '@/app/utils/constant';
import { AnimationUtils } from '@/utils/animations';
import { responsiveSize, responsiveSpacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface FloatingActionButtonProps {
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
  animated?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = 'add',
  size = 24,
  color = ENHANCED_COLORS.text.inverse,
  backgroundColor = ENHANCED_COLORS.secondary[500],
  style,
  animated = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      // Entrance animation
      AnimationUtils.scaleIn(scaleAnim, 400).start();
      
      // Subtle pulse animation
      const pulseAnimation = AnimationUtils.pulse(pulseAnim, 2000);
      setTimeout(() => {
        pulseAnimation.start();
      }, 1000);
    }
  }, [animated]);

  const handlePressIn = () => {
    if (animated) {
      AnimationUtils.spring(scaleAnim, 0.9, {
        tension: 300,
        friction: 10,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (animated) {
      AnimationUtils.spring(scaleAnim, 1, {
        tension: 300,
        friction: 10,
      }).start();
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: scaleAnim },
            { scale: pulseAnim },
          ],
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor,
            width: responsiveSize(56),
            height: responsiveSize(56),
            borderRadius: responsiveSize(28),
          },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Ionicons
          name={icon}
          size={size}
          color={color}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: responsiveSpacing(100),
    right: responsiveSpacing(20),
    zIndex: 1000,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    // Enhanced shadow
    shadowColor: ENHANCED_COLORS.secondary[500],
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
    borderWidth: 2,
    borderColor: ENHANCED_COLORS.background.primary,
  },
});

export default FloatingActionButton;
