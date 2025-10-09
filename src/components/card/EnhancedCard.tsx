import { ENHANCED_COLORS } from '@/app/utils/constant';
import { AnimationUtils } from '@/utils/animations';
import { responsiveBorderRadius, responsiveSpacing } from '@/utils/responsive';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface EnhancedCardProps {
  children?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  animated?: boolean;
  elevation?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'elevated' | 'outlined';
}

const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  onPress,
  style,
  animated = true,
  elevation = 'md',
  variant = 'default',
}) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (animated) {
      // Entrance animation
      Animated.parallel([
        AnimationUtils.fadeIn(opacityAnim, 400),
        AnimationUtils.scaleIn(scaleAnim, 400),
        AnimationUtils.slideInFromBottom(translateYAnim, 400),
      ]).start();
    }
  }, [animated]);

  const handlePressIn = () => {
    if (animated && onPress) {
      AnimationUtils.spring(scaleAnim, 0.98, {
        tension: 300,
        friction: 10,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (animated && onPress) {
      AnimationUtils.spring(scaleAnim, 1, {
        tension: 300,
        friction: 10,
      }).start();
    }
  };

  const getElevationStyle = () => {
    const elevationStyles = {
      sm: {
        shadowColor: ENHANCED_COLORS.secondary[500],
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
      },
      md: {
        shadowColor: ENHANCED_COLORS.secondary[500],
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
      },
      lg: {
        shadowColor: ENHANCED_COLORS.secondary[500],
        shadowOpacity: 0.16,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 12,
      },
      xl: {
        shadowColor: ENHANCED_COLORS.secondary[500],
        shadowOpacity: 0.2,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 16,
      },
    };
    return elevationStyles[elevation];
  };

  const getVariantStyle = () => {
    const variantStyles = {
      default: {
        backgroundColor: ENHANCED_COLORS.background.primary,
        borderWidth: 0,
      },
      elevated: {
        backgroundColor: ENHANCED_COLORS.background.primary,
        borderWidth: 1,
        borderColor: ENHANCED_COLORS.secondary[100],
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: ENHANCED_COLORS.secondary[300],
      },
    };
    return variantStyles[variant];
  };

  const CardContent = (
    <Animated.View
      style={[
        styles.card,
        getElevationStyle(),
        getVariantStyle(),
        {
          opacity: opacityAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim },
          ],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: responsiveBorderRadius(16),
    padding: responsiveSpacing(16),
    marginVertical: responsiveSpacing(8),
  },
});

export default EnhancedCard;
