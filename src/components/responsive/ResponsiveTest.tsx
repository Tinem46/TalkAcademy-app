import {
    getResponsiveMargin,
    getResponsivePadding,
    getScreenSize,
    isLargeScreen,
    isSmallScreen,
    isTablet,
    responsiveFontSize,
    responsiveHeight,
    responsiveSize,
    responsiveSpacing,
    responsiveWidth
} from '@/utils/responsive';
import React from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

const ResponsiveTest: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const screenSize = getScreenSize();
  const padding = getResponsivePadding();
  const margin = getResponsiveMargin();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Responsive Design Test</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Screen Information</Text>
          <Text style={styles.infoText}>Width: {width}px</Text>
          <Text style={styles.infoText}>Height: {height}px</Text>
          <Text style={styles.infoText}>Screen Size: {screenSize}</Text>
          <Text style={styles.infoText}>Is Small Screen: {isSmallScreen() ? 'Yes' : 'No'}</Text>
          <Text style={styles.infoText}>Is Large Screen: {isLargeScreen() ? 'Yes' : 'No'}</Text>
          <Text style={styles.infoText}>Is Tablet: {isTablet() ? 'Yes' : 'No'}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Responsive Values</Text>
          <Text style={styles.infoText}>Padding Horizontal: {padding.horizontal}px</Text>
          <Text style={styles.infoText}>Padding Vertical: {padding.vertical}px</Text>
          <Text style={styles.infoText}>Margin Horizontal: {margin.horizontal}px</Text>
          <Text style={styles.infoText}>Margin Vertical: {margin.vertical}px</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Responsive Sizing</Text>
          <Text style={styles.infoText}>Responsive Width (50%): {responsiveWidth(50)}px</Text>
          <Text style={styles.infoText}>Responsive Height (20%): {responsiveHeight(20)}px</Text>
          <Text style={styles.infoText}>Responsive Size (100): {responsiveSize(100)}px</Text>
          <Text style={styles.infoText}>Responsive Font Size (16): {responsiveFontSize(16)}px</Text>
          <Text style={styles.infoText}>Responsive Spacing (20): {responsiveSpacing(20)}px</Text>
        </View>

        <View style={styles.testBox}>
          <Text style={styles.testText}>Test Box with Responsive Sizing</Text>
        </View>

        <View style={styles.testBox2}>
          <Text style={styles.testText2}>Another Test Box</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: getResponsivePadding().horizontal,
    paddingTop: getResponsivePadding().vertical,
  },
  title: {
    fontSize: responsiveFontSize(24),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: responsiveSpacing(20),
    color: '#333',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: responsiveSize(12),
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: '600',
    marginBottom: responsiveSpacing(8),
    color: '#333',
  },
  infoText: {
    fontSize: responsiveFontSize(14),
    marginBottom: responsiveSpacing(4),
    color: '#666',
  },
  testBox: {
    backgroundColor: '#4CAF50',
    borderRadius: responsiveSize(8),
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(12),
    width: responsiveWidth(90),
    alignSelf: 'center',
  },
  testText: {
    color: '#fff',
    fontSize: responsiveFontSize(16),
    textAlign: 'center',
    fontWeight: '500',
  },
  testBox2: {
    backgroundColor: '#2196F3',
    borderRadius: responsiveSize(8),
    padding: responsiveSpacing(20),
    marginBottom: responsiveSpacing(12),
    width: responsiveWidth(80),
    alignSelf: 'center',
  },
  testText2: {
    color: '#fff',
    fontSize: responsiveFontSize(18),
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default ResponsiveTest;
