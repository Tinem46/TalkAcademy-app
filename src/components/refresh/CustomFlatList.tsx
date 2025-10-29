import { useCallback, useState } from 'react';
import {
    FlatList,
    ListRenderItem,
    RefreshControl,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import CustomRefreshControl from './CustomRefreshControl';

interface CustomFlatListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  onRefresh?: () => Promise<void> | void;
  refreshing?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  refreshMessage?: string;
  [key: string]: any; // For other FlatList props
}

const CustomFlatList = <T,>({
  data,
  renderItem,
  onRefresh,
  refreshing = false,
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  showsHorizontalScrollIndicator = false,
  refreshMessage = 'Đang làm mới dữ liệu...',
  ...props
}: CustomFlatListProps<T>) => {
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
      <FlatList
        data={data}
        renderItem={renderItem}
        style={[styles.flatList, style]}
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
      />
    </CustomRefreshControl>
  );
};

const styles = StyleSheet.create({
  flatList: {
    flex: 1,
  },
});

export default CustomFlatList;
