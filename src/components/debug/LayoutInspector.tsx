import {
    isLargeScreen,
    isSmallScreen,
    isTablet,
    responsiveFontSize,
    responsiveSize,
    responsiveSpacing
} from '@/utils/responsive';
import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

interface LayoutInspectorProps {
  children: React.ReactNode;
  showDebug?: boolean;
}

const LayoutInspector: React.FC<LayoutInspectorProps> = ({ children, showDebug = false }) => {
  const { width, height } = useWindowDimensions();

  if (!showDebug) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.debugOverlay}>
        <Text style={styles.debugText}>Screen: {width}x{height}</Text>
        <Text style={styles.debugText}>Small: {isSmallScreen() ? 'Yes' : 'No'}</Text>
        <Text style={styles.debugText}>Large: {isLargeScreen() ? 'Yes' : 'No'}</Text>
        <Text style={styles.debugText}>Tablet: {isTablet() ? 'Yes' : 'No'}</Text>
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  debugOverlay: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: responsiveSpacing(8),
    borderRadius: responsiveSize(4),
    zIndex: 9999,
  },
  debugText: {
    color: '#fff',
    fontSize: responsiveFontSize(10),
    marginBottom: responsiveSpacing(2),
  },
});

export default LayoutInspector;

