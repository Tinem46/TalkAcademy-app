import { getCategoriesByAccountAPI } from "@/app/utils/apiall";
import CategoryCard from "@/components/card/categoryCard";
import SafeAreaTabWrapper from "@/components/layout/SafeAreaTabWrapper";
import {
  getResponsivePadding,
  responsiveFontSize,
  responsiveSize,
  responsiveSpacing
} from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-root-toast";

// Interface cho Category
interface Category {
  id: number;
  name: string;
  description: string;
  isLock: boolean;
}

export default function CategoriesScreen() {
  const padding = getResponsivePadding();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Function để load categories từ API bằng userId từ AsyncStorage
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      
      // Lấy userId từ AsyncStorage
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.log('❌ No userId found in AsyncStorage');
        Toast.show("Không tìm thấy thông tin người dùng", { position: Toast.positions.TOP });
        return;
      }
      
      console.log('📚 Loading categories for userId:', userId);
      
      // Gọi API để lấy categories
      const response = await getCategoriesByAccountAPI(parseInt(userId));
      console.log('📚 Categories API response:', response);
      
      if (response && Array.isArray(response)) {
        setCategories(response);
        await AsyncStorage.setItem("userCategories", JSON.stringify(response));
        console.log('📚 Categories loaded from API:', response.length, 'items');
      }
    } catch (error: any) {
      console.error('❌ Error loading categories:', error);
      Toast.show("Không thể tải danh mục học tập", { position: Toast.positions.TOP });
    } finally {
      setLoading(false);
    }
  }, []);

  // Function để xử lý pull-to-refresh
  const onRefresh = useCallback(async () => {
    console.log('🔄 onRefresh called');
    setRefreshing(true);
    try {
      await loadCategories();
      console.log('✅ Refresh completed successfully');
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    } finally {
      setRefreshing(false);
      console.log('🔄 Refresh finished');
    }
  }, [loadCategories]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const renderCategory = ({ item }: { item: Category }) => (
    <CategoryCard
      category={item}
      onPress={() => {
        if (!item.isLock) {
          router.push(`/(exercise)/reading?categoryId=${item.id}&categoryName=${encodeURIComponent(item.name)}`);
        }
      }}
    />
  );

  const renderContent = () => (
    <View style={{ paddingHorizontal: padding.horizontal }}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={responsiveSize(24)} color="#2FA6F3" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            Danh mục học tập
          </Text>
          <Text style={styles.headerSubtitle}>
            {categories.length} danh mục có sẵn
          </Text>
        </View>
      </View>

      {/* Categories List */}
      <View style={styles.categoriesContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2FA6F3" />
            <Text style={styles.loadingText}>Đang tải danh mục...</Text>
          </View>
        ) : categories.length > 0 ? (
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="book-outline" size={responsiveSize(80)} color="#E8F4FD" />
            </View>
            <Text style={styles.emptyTitle}>Chưa có danh mục</Text>
            <Text style={styles.emptySubtitle}>
              Hiện tại chưa có danh mục nào. Hãy liên hệ với quản trị viên để được cấp quyền truy cập các danh mục học tập.
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaTabWrapper style={styles.safe}>
      <FlatList
        data={[1]} // Dummy data để render một item
        renderItem={renderContent}
        keyExtractor={() => 'categories-content'}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2FA6F3"]}
            tintColor="#2FA6F3"
            progressBackgroundColor="#FFFFFF"
            title="Kéo để làm mới"
            titleColor="#2FA6F3"
          />
        }
      />
    </SafeAreaTabWrapper>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(40),
  },
  loadingText: {
    marginTop: responsiveSpacing(16),
    fontSize: responsiveFontSize(17),
    color: '#2FA6F3',
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveSpacing(24),
    marginTop: responsiveSpacing(8),
  },
  backButton: {
    width: responsiveSize(44),
    height: responsiveSize(44),
    borderRadius: responsiveSize(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: responsiveSpacing(12),
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: responsiveFontSize(26),
    fontWeight: "800",
    color: "#2C5530",
    letterSpacing: 0.55
  },
  headerSubtitle: {
    fontSize: responsiveFontSize(14),
    color: "#2FA6F3",
    marginTop: responsiveSpacing(4),
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingTop: responsiveSpacing(20),
  },
  listContainer: {
    paddingBottom: responsiveSpacing(100),
  },
  separator: {
    height: responsiveSpacing(16),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(40),
    paddingVertical: responsiveSpacing(80),
  },
  emptyIconContainer: {
    width: responsiveSize(140),
    height: responsiveSize(140),
    borderRadius: responsiveSize(70),
    backgroundColor: "#F9FAFB",
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: responsiveSpacing(24),
  },
  emptyTitle: {
    fontSize: responsiveFontSize(24),
    fontWeight: "800",
    color: "#2C5530",
    marginBottom: responsiveSpacing(12),
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: responsiveFontSize(16),
    color: "#2FA6F3",
    textAlign: 'center',
    lineHeight: responsiveSize(26),
    fontWeight: '600',
  },
});
