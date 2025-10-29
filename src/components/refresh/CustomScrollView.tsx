import React, { useCallback, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import CustomRefreshControl from './CustomRefreshControl';

interface CustomScrollViewProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void> | void;
  refreshing?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  refreshMessage?: string;
  [key: string]: any; // For other ScrollView props
}

const CustomScrollView: React.FC<CustomScrollViewProps> = ({
  children,
  onRefresh,
  refreshing = false,
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  showsHorizontalScrollIndicator = false,
  refreshMessage = 'Đang làm mới dữ liệu...',
  ...props
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh || isRefreshing) return;

    try {
      setIsRefreshing(true);
      await onRefresh();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing]);

  const isRefreshActive = refreshing || isRefreshing;

  return (
        <CustomRefreshControl
          refreshing={isRefreshActive}
          onRefresh={handleRefresh}
          refreshMessage={refreshMessage}
        >
      <ScrollView
        style={[styles.scrollView, style]}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshActive} // Use our custom refresh state
                onRefresh={handleRefresh}
                enabled={!!onRefresh}
              />
            }
        {...props}
      >
        {children}
      </ScrollView>
    </CustomRefreshControl>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});

export default CustomScrollView;
