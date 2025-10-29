import {
  getAssessmentsAPI,
  getCategoriesProgressAPI,
} from "@/app/utils/apiall";
import AssessmentCard from "@/components/card/assessmentCard";
import CategoryCard from "@/components/card/categoryCard";
import SafeAreaTabWrapper from "@/components/layout/SafeAreaTabWrapper";
import CustomFlatList from "@/components/refresh/CustomFlatList";
import {
  getResponsivePadding,
  responsiveFontSize,
  responsiveSize,
  responsiveSpacing,
} from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-root-toast";

// Interface cho Category
interface Category {
  id: number;
  name: string;
  description: string;
  completedUsers: {
    id: number;
    email: string;
    avatar: string | null;
  }[];
  isFinished: boolean;
  isUnlocked?: boolean; // Optional để hỗ trợ API
  isLock?: boolean; // Optional để hỗ trợ API với field khác
}

// Interface cho Assessment
interface Assessment {
  id: number;
  title: string;
  description: string;
  level: string;
  passages: {
    id: number;
    title: string;
    content: string;
    level: string;
    createdAt: string;
    isActive: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesScreen() {
  const padding = getResponsivePadding();
  const { tab } = useLocalSearchParams<{ tab?: string }>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"learning" | "assessment">(
    "learning"
  );

  // Function để load categories từ API mới
  const loadCategories = useCallback(async () => {
    try {
      console.log("📚 Loading categories with progress...");

      // Gọi API mới để lấy categories với trạng thái hoàn thành
      const response = await getCategoriesProgressAPI();
      console.log("📚 Categories Progress API response:", response);

      if (response && Array.isArray(response)) {
        console.log(
          "📚 Raw API response before sorting:",
          response.map((item) => ({
            id: item.id,
            name: item.name,
            isUnlocked: item.isUnlocked,
            isLock: item.isLock,
          }))
        );

        // Sắp xếp categories: unlocked trước, locked sau
        const sortedCategories = response.sort((a, b) => {
          // Kiểm tra cả isUnlocked và isLock (API có thể dùng field khác)
          const aUnlocked =
            a.isUnlocked !== undefined ? a.isUnlocked : !a.isLock;
          const bUnlocked =
            b.isUnlocked !== undefined ? b.isUnlocked : !b.isLock;

          // Nếu cả hai đều unlocked hoặc cả hai đều locked, giữ nguyên thứ tự
          if (aUnlocked === bUnlocked) {
            return 0;
          }
          // Unlocked items (true) sẽ có priority cao hơn locked items (false)
          return aUnlocked ? -1 : 1;
        });

        console.log(
          "📚 Sorted categories after sorting:",
          sortedCategories.map((item) => ({
            id: item.id,
            name: item.name,
            isUnlocked: item.isUnlocked,
          }))
        );

        setCategories(sortedCategories);
        await AsyncStorage.setItem(
          "userCategories",
          JSON.stringify(sortedCategories)
        );
        console.log(
          "📚 Categories loaded and sorted from API:",
          sortedCategories.length,
          "items"
        );
      }
    } catch (error: any) {
      console.error("❌ Error loading categories:", error);
      console.log("🔄 Using mock categories data due to API error");
      console.log("🔍 Error details:", error?.response?.status, error?.message);

      // Sử dụng mock data khi API lỗi
      const mockCategories: Category[] = [
        {
          id: 1,
          name: "English Pronunciation",
          description: "Bài luyện phát âm tiếng Anh cơ bản",
          completedUsers: [],
          isFinished: false,
          isUnlocked: true,
        },
        {
          id: 2,
          name: "Luyện phản xạ",
          description: "Bài luyện phát phản xạ",
          completedUsers: [],
          isFinished: false,
          isUnlocked: false, // Locked để test sorting
        },
        {
          id: 3,
          name: "Luyện phát âm",
          description: "Bài luyện phát âm",
          completedUsers: [],
          isFinished: false,
          isUnlocked: true,
        },
      ];

      // Sắp xếp mock categories: unlocked trước, locked sau
      const sortedMockCategories = mockCategories.sort((a, b) => {
        // Nếu cả hai đều unlocked hoặc cả hai đều locked, giữ nguyên thứ tự
        if (a.isUnlocked === b.isUnlocked) {
          return 0;
        }
        // Unlocked items (true) sẽ có priority cao hơn locked items (false)
        return a.isUnlocked ? -1 : 1;
      });

      console.log(
        "📚 Mock categories sorted:",
        sortedMockCategories.map((item) => ({
          id: item.id,
          name: item.name,
          isUnlocked: item.isUnlocked,
        }))
      );

      setCategories(sortedMockCategories);
      await AsyncStorage.setItem(
        "userCategories",
        JSON.stringify(sortedMockCategories)
      );
      console.log(
        "📚 Mock categories loaded and sorted:",
        sortedMockCategories.length,
        "items"
      );
    }
  }, []);

  // Function để load assessments từ API
  const loadAssessments = useCallback(async () => {
    try {
      console.log("📝 Loading assessments...");

      // Gọi API để lấy assessments
      const response = await getAssessmentsAPI();
      console.log("📝 Assessments API response:", response);

      if (response && Array.isArray(response)) {
        setAssessments(response);
        console.log(
          "📝 Assessments loaded from API:",
          response.length,
          "items"
        );
      }
    } catch (error: any) {
      console.error("❌ Error loading assessments:", error);
      Toast.show("Không thể tải bài kiểm tra", {
        position: Toast.positions.TOP,
      });
    }
  }, []);

  // Function để xử lý pull-to-refresh
  const onRefresh = useCallback(async () => {
    console.log("🔄 onRefresh called");
    setRefreshing(true);
    try {
      await Promise.all([loadCategories(), loadAssessments()]);
      console.log("✅ Refresh completed successfully");
    } catch (error) {
      console.error("❌ Error refreshing data:", error);
    } finally {
      setRefreshing(false);
      console.log("🔄 Refresh finished");
    }
  }, [loadCategories, loadAssessments]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Clear AsyncStorage để force reload từ API
        await AsyncStorage.removeItem("userCategories");
        console.log("🗑️ Cleared userCategories from AsyncStorage");

        await Promise.all([loadCategories(), loadAssessments()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [loadCategories, loadAssessments]);

  // Effect để xử lý tham số tab từ URL
  useEffect(() => {
    if (tab === "assessment") {
      setActiveTab("assessment");
    }
  }, [tab]);

  const renderCategory = ({ item }: { item: Category }) => (
    <CategoryCard
      category={item}
      onPress={() => {
        // Kiểm tra cả isUnlocked và isLock
        const isUnlocked =
          item.isUnlocked !== undefined ? item.isUnlocked : !item.isLock;
        if (isUnlocked) {
          router.push(
            `/(exercise)/reading?categoryId=${
              item.id
            }&categoryName=${encodeURIComponent(item.name)}`
          );
        }
      }}
    />
  );

  const renderAssessment = ({ item }: { item: Assessment }) => (
    <AssessmentCard
      assessment={item}
      onPress={() => {
        // Navigate directly to first passage of assessment
        console.log("Assessment pressed:", item.title);
        console.log("Assessment passages:", item.passages);

        if (item.passages && item.passages.length > 0) {
          const firstPassage = item.passages[0];
          console.log("Navigating to first passage:", firstPassage);

          // Navigate directly to passage detail
          router.push({
            pathname: "/(exercise)/passage-detail",
            params: {
              id: firstPassage.id.toString(),
              title: encodeURIComponent(firstPassage.title),
              categoryId: `assessment_${item.id}`,
              assessmentId: item.id.toString(),
              assessmentTitle: encodeURIComponent(item.title),
              assessmentLevel: item.level,
              isAssessment: "true",
            },
          });
        } else {
          Toast.show("Bài kiểm tra này chưa có bài đọc nào!", {
            position: Toast.positions.TOP,
          });
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
          <Ionicons
            name="arrow-back"
            size={responsiveSize(24)}
            color="#2FA6F3"
          />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Khám phá thêm</Text>
          <Text style={styles.headerSubtitle}>
            {activeTab === "learning"
              ? `${categories.length} danh mục học tập`
              : `${assessments.length} bài kiểm tra`}
          </Text>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === "learning" && styles.activeTab]}
          onPress={() => setActiveTab("learning")}
        >
          <Ionicons
            name="book-outline"
            size={responsiveSize(20)}
            color={activeTab === "learning" ? "#FFFFFF" : "#2FA6F3"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "learning" && styles.activeTabText,
            ]}
          >
            Danh mục học tập
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === "assessment" && styles.activeTab]}
          onPress={() => setActiveTab("assessment")}
        >
          <Ionicons
            name="clipboard-outline"
            size={responsiveSize(20)}
            color={activeTab === "assessment" ? "#FFFFFF" : "#2FA6F3"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "assessment" && styles.activeTabText,
            ]}
          >
            Bài kiểm tra
          </Text>
        </Pressable>
      </View>

      {/* Content based on active tab */}
      <View style={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2FA6F3" />
            <Text style={styles.loadingText}>
              Đang tải {activeTab === "learning" ? "danh mục" : "bài kiểm tra"}
              ...
            </Text>
          </View>
        ) : // Content based on active tab
        activeTab === "learning" ? (
          // Learning Categories
          categories.length > 0 ? (
            <View
              onLayout={() => {
                console.log(
                  "📱 Final categories displayed:",
                  categories.map((item) => ({
                    id: item.id,
                    name: item.name,
                    isUnlocked: item.isUnlocked,
                    isLock: item.isLock,
                  }))
                );
              }}
            >
              {categories.map((item, index) => (
                <View key={item.id.toString()}>
                  {renderCategory({ item })}
                  {index < categories.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="book-outline"
                  size={responsiveSize(80)}
                  color="#E8F4FD"
                />
              </View>
              <Text style={styles.emptyTitle}>Chưa có danh mục</Text>
              <Text style={styles.emptySubtitle}>
                Hiện tại chưa có danh mục nào. Hãy liên hệ với quản trị viên để
                được cấp quyền truy cập các danh mục học tập.
              </Text>
            </View>
          )
        ) : // Assessments
        assessments.length > 0 ? (
          <View>
            {assessments.map((item, index) => (
              <View key={item.id.toString()}>
                {renderAssessment({ item })}
                {index < assessments.length - 1 && (
                  <View style={styles.separator} />
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="clipboard-outline"
                size={responsiveSize(80)}
                color="#E8F4FD"
              />
            </View>
            <Text style={styles.emptyTitle}>Chưa có bài kiểm tra</Text>
            <Text style={styles.emptySubtitle}>
              Hiện tại chưa có bài kiểm tra nào. Hãy liên hệ với quản trị viên
              để được cấp quyền truy cập các bài kiểm tra.
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaTabWrapper style={styles.safe}>
      <CustomFlatList
        data={[1]} // Dummy data để render một item
        renderItem={renderContent}
        keyExtractor={() => "categories-content"}
        refreshing={refreshing}
        onRefresh={onRefresh}
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveSpacing(40),
  },
  loadingText: {
    marginTop: responsiveSpacing(16),
    fontSize: responsiveFontSize(17),
    color: "#2FA6F3",
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveSpacing(24),
    marginTop: responsiveSpacing(20), // Increased top margin for status bar
  },
  backButton: {
    width: responsiveSize(44),
    height: responsiveSize(44),
    borderRadius: responsiveSize(22),
    alignItems: "center",
    justifyContent: "center",
    marginRight: responsiveSpacing(12),
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: responsiveFontSize(26),
    fontWeight: "800",
    color: "#2C5530",
    letterSpacing: 0.55,
  },
  headerSubtitle: {
    fontSize: responsiveFontSize(14),
    color: "#2FA6F3",
    marginTop: responsiveSpacing(4),
    fontWeight: "600",
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveSpacing(40),
    paddingVertical: responsiveSpacing(80),
  },
  emptyIconContainer: {
    width: responsiveSize(140),
    height: responsiveSize(140),
    borderRadius: responsiveSize(70),
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
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
    textAlign: "center",
    lineHeight: responsiveSize(26),
    fontWeight: "600",
  },
  // Tab styles
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: responsiveSize(12),
    padding: responsiveSize(4),
    marginBottom: responsiveSpacing(20),
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: responsiveSpacing(12),
    paddingHorizontal: responsiveSpacing(16),
    borderRadius: responsiveSize(8),
  },
  activeTab: {
    backgroundColor: "#2FA6F3",
  },
  tabText: {
    fontSize: responsiveFontSize(14),
    fontWeight: "600",
    color: "#2FA6F3",
    marginLeft: responsiveSpacing(6),
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  // Content container
  contentContainer: {
    flex: 1,
  },
});
