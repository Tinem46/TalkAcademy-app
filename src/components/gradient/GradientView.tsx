import { ENHANCED_COLORS } from '@/app/utils/constant';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface GradientViewProps {
  colors?: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: ViewStyle;
  children?: React.ReactNode;
}

const GradientView: React.FC<GradientViewProps> = ({
  colors = [ENHANCED_COLORS.secondary[50], ENHANCED_COLORS.background.primary],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  style,
  children,
}) => {
  // Since React Native doesn't have built-in gradient support,
  // we'll create a gradient effect using multiple overlapping views
  const gradientLayers = colors.map((color, index) => {
    const opacity = 1 - (index * 0.3); // Decreasing opacity for gradient effect
    return (
      <View
        key={index}
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: color,
            opacity: opacity,
          },
        ]}
      />
    );
  });

  return (
    <View style={[styles.container, style]}>
      {gradientLayers}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
});

export default GradientView;
