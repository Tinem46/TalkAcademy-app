import { ENHANCED_COLORS } from '@/app/utils/constant';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  style,
  backgroundColor = ENHANCED_COLORS.background.secondary,
  edges = ['left', 'right'], // Removed 'top' and 'bottom' for full screen
}) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }, style]} edges={edges}>
      <View style={[styles.content, { paddingTop: 50 }]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    // Ensure content doesn't get cut off
    minHeight: '100%',
  },
});

export default SafeAreaWrapper;
