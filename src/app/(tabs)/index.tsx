import {
  getCategoriesProgressAPI,
  getUserOverviewAPI,
  getUserProfileAPI,
  getUserSurveyAPI,
} from "@/app/utils/apiall";
import CategoryCard from "@/components/card/categoryCard";
import LatestEvaluationCard from "@/components/card/evaluationCard";
import ProgressBar from "@/components/onboarding/progressBar";
import CustomFlatList from "@/components/refresh/CustomFlatList";
import {
  getResponsivePadding,
  responsiveFontSize,
  responsiveSize,
  responsiveSpacing,
} from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Toast from "react-native-root-toast";
import { SafeAreaView } from "react-native-safe-area-context";

// Interface cho User Profile
interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar: string | null;
  googleId: string | null;
  password: string;
  refreshToken: string;
  voiceTests: any[];
  practices: any[];
  userPackages: any[];
  level?: number;
}

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
  isUnlocked: boolean;
}

const HomeScreen = ({ navigation }: any) => {
  const padding = getResponsivePadding();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [refreshing] = useState(false);
  // const [latestvoiceLevel, setLatestvoiceLevel] = useState<number>(0);
  const [completedPercentage, setCompletedPercentage] = useState<number>(0);
  const [latestVoiceScore, setLatestVoiceScore] = useState<number>(0);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);

      // Kiểm tra token trước khi gọi API
      const token = await AsyncStorage.getItem("access_token");
      console.log("🔑 Token exists:", !!token);

      if (!token) {
        console.log("❌ No token found, using mock data");
        router.replace("/(auth)/welcome");
        return;
      }

      const response = await getUserProfileAPI();
      console.log("📊 Profile API Response:", response);

      // Vì axios interceptor đã trả về response.data, nên response chính là data
      if (response) {
        const profileData = response as unknown as UserProfile;
        setUserProfile(profileData);
        console.log("✅ Profile loaded successfully:", profileData);
        console.log("👤 User:", profileData.username);
        console.log("📧 Email:", profileData.email);

        // Extract latest voice score from voiceTests array
        if (profileData.voiceTests && profileData.voiceTests.length > 0) {
          const latestTest =
            profileData.voiceTests[profileData.voiceTests.length - 1];
          setLatestVoiceScore(latestTest.voiceScore || 0);
          console.log("🎯 Latest voice score:", latestTest.voiceScore);
        }
      } else {
        console.log("⚠️ No data in response, using mock data");
        const mockProfile = {
          id: 1,
          username: "demo_user",
          email: "demo@example.com",
          role: "CUSTOMER",
          avatar: null,
          googleId: null,
          password: "",
          refreshToken: "",
          voiceTests: [],
          practices: [],
          userPackages: [],
        };
        setUserProfile(mockProfile);
      }
    } catch (error: any) {
      console.error(
        "💥 Error fetching profile:",
        error?.message || "Unknown error"
      );

      // Xử lý lỗi cụ thể
      if (error?.response?.status === 401) {
        console.log("� Token expired or invalid - redirecting to welcome");
        // Xóa token cũ
        await AsyncStorage.removeItem("access_token");
        await AsyncStorage.removeItem("refreshToken");
        // Redirect về welcome
        router.replace("/(auth)/welcome");
      } else {
        console.log("⚠️ API error - redirecting to welcome");
        router.replace("/(auth)/welcome");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load user overview for level progress
  const fetchUserOverview = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        setCompletedPercentage(0);
        return;
      }

      const response = await getUserOverviewAPI();
      if (response) {
        const data = response as unknown as {
          latestvoiceLevel?: number;
          completedPercentage?: number;
        };
        setCompletedPercentage(data.completedPercentage || 0);
        console.log("📊 Completed percentage:", data.completedPercentage);
      }
    } catch {
      setCompletedPercentage(0);
    }
  }, []);

  // Function để load categories từ API mới
  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);

      console.log("📚 Loading categories with progress...");

      // Gọi API mới để lấy categories với trạng thái hoàn thành
      const response = await getCategoriesProgressAPI();
      console.log("📚 Categories Progress API response:", response);

      if (response && Array.isArray(response)) {
        // Sắp xếp categories: unlocked trước, locked sau
        const sortedCategories = response.sort((a, b) => {
          // Nếu cả hai đều unlocked hoặc cả hai đều locked, giữ nguyên thứ tự
          if (a.isUnlocked === b.isUnlocked) {
            return 0;
          }
          // Unlocked items (true) sẽ có priority cao hơn locked items (false)
          return a.isUnlocked ? -1 : 1;
        });

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
      console.log("🔄 Using mock categories data");

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
          isUnlocked: false, // Thay đổi thành locked để test sorting
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
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // Function để xử lý pull-to-refresh
  const onRefresh = useCallback(async () => {
    console.log("🔄 onRefresh called");
    try {
      // Refresh cả user profile và categories
      await Promise.all([
        fetchUserProfile(),
        loadCategories(),
        fetchUserOverview(),
      ]);
      console.log("✅ Refresh completed successfully");
    } catch (error) {
      console.error("❌ Error refreshing data:", error);
    }
  }, [fetchUserProfile, loadCategories, fetchUserOverview]);

  const checkSurveys = useCallback(async (userId: number) => {
    try {
      console.log("🔍 Checking surveys for user ID in home:", userId);

      // Kiểm tra onboarding status từ AsyncStorage trước
      const onboardingCompleted = await AsyncStorage.getItem(
        "onboarding_completed"
      );
      if (onboardingCompleted === "true") {
        console.log(
          "✅ Onboarding already completed according to local storage"
        );
        return true;
      }

      const response = await getUserSurveyAPI();
      console.log("📊 Surveys API Response in home:", response);

      if (response && Array.isArray(response)) {
        // Filter surveys của user hiện tại
        const userSurveys = response.filter(
          (survey: any) => survey.user && survey.user.id === userId
        );

        console.log("📊 User surveys found in home:", userSurveys.length);

        if (userSurveys.length === 0) {
          console.log(
            "⚠️ No surveys found for current user in home - redirecting to onboarding"
          );

          // Redirect to onboarding
          router.replace("/(onboarding)/intro");
          return false;
        }

        // Đánh dấu onboarding hoàn thành
        await AsyncStorage.setItem("onboarding_completed", "true");
        console.log(
          "✅ User has surveys in home, marking onboarding as completed"
        );
        return true;
      } else {
        console.log(
          "⚠️ No surveys data in response in home - redirecting to onboarding"
        );

        // Redirect to onboarding
        router.replace("/(onboarding)/intro");
        return false;
      }
    } catch (error: any) {
      console.error("💥 Error checking surveys in home:", error);

      // Chỉ redirect nếu không phải network error
      if (error?.message !== "Network Error") {
        Toast.show("Không thể tải khảo sát. Vui lòng hoàn thành onboarding", {
          position: Toast.positions.TOP,
          duration: 3000,
        });

        // Redirect to onboarding
        router.replace("/(onboarding)/intro");
        return false;
      }

      // Nếu là network error, tiếp tục với mock data
      console.log("🔄 Network error, continuing with mock data");
      return true;
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
    fetchUserOverview();
  }, [fetchUserProfile, fetchUserOverview]);

  // Check surveys sau khi userProfile đã load xong
  useEffect(() => {
    if (userProfile?.id) {
      console.log("🔄 UserProfile loaded in home, checking surveys...");
      checkSurveys(userProfile.id);
    }
  }, [userProfile?.id, checkSurveys]);

  // Load categories độc lập khi component mount
  useEffect(() => {
    console.log("🔄 Home component mounted, loading categories...");
    loadCategories();
  }, [loadCategories]);

  // Bỏ loading state riêng biệt, sử dụng custom refresh thay thế

  const renderContent = () => {
    // Hiển thị loading state trong content thay vì return riêng biệt
    if (loading) {
      return (
        <View
          style={[
            styles.loadingContainer,
            { paddingHorizontal: padding.horizontal },
          ]}
        >
          <ActivityIndicator size="large" color="#2AA0FF" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      );
    }

    return (
      <View style={{ paddingHorizontal: padding.horizontal }}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.greetingContainer}>
            <Text style={styles.hello}>Xin chào</Text>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { fontStyle: "italic" }]}>
                {userProfile?.username || "Người dùng"}
              </Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>
                  {userProfile?.level || 0}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Level Progress */}
        <Text style={styles.sectionLabel}>Cấp độ của bạn</Text>
        <View style={{ marginBottom: responsiveSpacing(12) }}>
          <ProgressBar
            progress={completedPercentage / 100}
            height={responsiveSize(36)}
            trackColor="#F1F4F6"
            tintColor="#2FA6F3"
            showLabel
            labelPosition="right"
            labelStyle={{
              color: "#9AA6B2",
              fontSize: responsiveFontSize(14),
            }}
            trackPadding={responsiveSize(3)}
            rounded
          />
        </View>

        {/* Path suggestion */}
        {/* <View style={{ 
        marginTop: responsiveSpacing(18), 
        marginBottom: responsiveSpacing(28) 
      }}>
        <PathCard
          title="Phát âm"
          desc="A small description about the feature title. Its better to only..."
          onPress={() => router.push("/(exercise)/lessonOne")}
        />
      </View> */}
        {categories.length > 0 && (
          <View
            style={{
              marginTop: responsiveSpacing(8),
              marginBottom: responsiveSpacing(24),
            }}
          >
            {categoriesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#2AA0FF" />
                <Text style={styles.loadingText}>Đang tải danh mục...</Text>
              </View>
            ) : (
              <View style={styles.categoriesContainer}>
                {/* Chỉ hiển thị danh mục đầu tiên */}
                <CategoryCard
                  key={categories[0].id}
                  category={categories[0]}
                  onPress={() => {
                    if (categories[0].isUnlocked) {
                      router.push(
                        `/(exercise)/reading?categoryId=${
                          categories[0].id
                        }&categoryName=${encodeURIComponent(
                          categories[0].name
                        )}`
                      );
                    }
                  }}
                />
              </View>
            )}
            <View style={styles.sectionHeader}>
              <Pressable
                style={styles.exploreButton}
                onPress={() => router.push("/(exercise)/categories")}
              >
                <Text style={styles.exploreButtonText}>Khám phá thêm</Text>
                <Ionicons name="chevron-forward" size={16} color="#2FA6F3" />
              </Pressable>
            </View>
          </View>
        )}

        {/* Latest evaluation */}
        <LatestEvaluationCard score={latestVoiceScore} />

        {/* Categories Section */}

        {/* Profile button */}

        <View style={{ height: responsiveSpacing(120) }} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomFlatList
        data={[1]} // Dummy data để render một item
        renderItem={() => renderContent()}
        keyExtractor={() => "home-content"}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={true}
        onRefresh={onRefresh}
        refreshing={refreshing}
        refreshMessage="Đang tải dữ liệu mới..."
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: responsiveSpacing(24),
  },
  safe: {
    paddingTop: responsiveSpacing(24),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: responsiveSpacing(100),
    minHeight: "100%",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: responsiveSpacing(14),
    marginTop: responsiveSpacing(32), // Increased margin for better spacing
  },
  greetingContainer: {
    flex: 1,
  },
  hello: {
    fontSize: responsiveFontSize(42),
    fontWeight: "900",
    color: "#123E2D",
  },
  name: {
    fontSize: responsiveFontSize(38),
    fontWeight: "900",
    color: "#2AA0FF",
    marginTop: responsiveSpacing(1.5),
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsiveSpacing(10),
  },
  levelBadge: {
    justifyContent: "flex-end",
    backgroundColor: "#2FA6F3",
    paddingHorizontal: responsiveSpacing(10),
    paddingVertical: responsiveSpacing(8),
    borderRadius: responsiveSpacing(12),
    shadowColor: "#2FA6F3",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#1E90FF",
  },
  levelBadgeText: {
    color: "#FFFFFF",
    fontSize: responsiveFontSize(14),
    fontWeight: "700",
    textAlign: "center",
  },
  sectionLabel: {
    color: "#0F3D57",
    fontWeight: "800",
    marginTop: responsiveSpacing(8), // Reduced since SafeAreaTabWrapper has paddingTop
    marginBottom: responsiveSpacing(8),
    fontSize: responsiveFontSize(24),
  },
  sectionTitle: {
    color: "#0F3D57",
    fontWeight: "900",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveSpacing(24),
  },
  loadingText: {
    marginTop: responsiveSpacing(12),
    fontSize: responsiveFontSize(16),
    color: "#666",
  },
  profileButtonContainer: {
    marginTop: responsiveSpacing(24),
    alignItems: "center",
  },
  profileButton: {
    fontSize: responsiveFontSize(16),
    color: "#2AA0FF",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  categoriesContainer: {
    marginTop: responsiveSpacing(12),
    gap: responsiveSpacing(16),
  },
  sectionHeader: {
    alignItems: "center",
    marginBottom: responsiveSpacing(8),
    marginTop: responsiveSpacing(22),
  },
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(6),
    backgroundColor: "#F0F8FF",
    borderRadius: responsiveSpacing(16),
    borderWidth: 1,
    borderColor: "#B3D9FF",
  },
  exploreButtonText: {
    fontSize: responsiveFontSize(14),
    fontWeight: "600",
    color: "#2FA6F3",
    marginRight: responsiveSpacing(4),
  },
});
export default HomeScreen;
