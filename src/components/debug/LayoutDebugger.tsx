import {
    getResponsiveMargin,
    getResponsivePadding,
    isLargeScreen,
    isSmallScreen,
    isTablet,
    responsiveFontSize,
    responsiveSpacing
} from '@/utils/responsive';
import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

interface LayoutDebuggerProps {
  children: React.ReactNode;
  title?: string;
}

const LayoutDebugger: React.FC<LayoutDebuggerProps> = ({ children, title = "Layout Debug" }) => {
  const { width, height } = useWindowDimensions();
  const padding = getResponsivePadding();
  const margin = getResponsiveMargin();

  return (
    <View style={styles.container}>
      <View style={styles.debugInfo}>
        <Text style={styles.debugTitle}>{title}</Text>
        <Text style={styles.debugText}>Screen: {width}x{height}</Text>
        <Text style={styles.debugText}>Small: {isSmallScreen() ? 'Yes' : 'No'}</Text>
        <Text style={styles.debugText}>Large: {isLargeScreen() ? 'Yes' : 'No'}</Text>
        <Text style={styles.debugText}>Tablet: {isTablet() ? 'Yes' : 'No'}</Text>
        <Text style={styles.debugText}>Padding: {padding.horizontal}x{padding.vertical}</Text>
        <Text style={styles.debugText}>Margin: {margin.horizontal}x{margin.vertical}</Text>
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  debugInfo: {
    backgroundColor: '#333',
    padding: responsiveSpacing(8),
    paddingHorizontal: getResponsivePadding().horizontal,
  },
  debugTitle: {
    color: '#fff',
    fontSize: responsiveFontSize(14),
    fontWeight: 'bold',
    marginBottom: responsiveSpacing(4),
  },
  debugText: {
    color: '#ccc',
    fontSize: responsiveFontSize(12),
    marginBottom: responsiveSpacing(2),
  },
  content: {
    flex: 1,
  },
});

export default LayoutDebugger;
