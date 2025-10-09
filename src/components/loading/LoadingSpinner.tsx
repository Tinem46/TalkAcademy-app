import { ENHANCED_COLORS } from '@/app/utils/constant';
import { AnimationUtils } from '@/utils/animations';
import { responsiveSize } from '@/utils/responsive';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
  animated?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  color = ENHANCED_COLORS.secondary[500],
  style,
  animated = true,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      // Entrance animation
      Animated.parallel([
        AnimationUtils.fadeIn(opacityAnim, 300),
        AnimationUtils.scaleIn(scaleAnim, 300),
      ]).start();

      // Rotation animation
      const rotationAnimation = AnimationUtils.rotate(rotateAnim, 1000);
      rotationAnimation.start();
    }
  }, [animated]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [
            { scale: scaleAnim },
            { rotate: spin },
          ],
        },
        style,
      ]}
    >
      <View
        style={[
          styles.spinner,
          {
            width: responsiveSize(size),
            height: responsiveSize(size),
            borderRadius: responsiveSize(size / 2),
            borderColor: color,
            borderTopColor: color,
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
            borderLeftColor: 'transparent',
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    borderWidth: 3,
    // Subtle shadow
    shadowColor: ENHANCED_COLORS.secondary[500],
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});

export default LoadingSpinner;
