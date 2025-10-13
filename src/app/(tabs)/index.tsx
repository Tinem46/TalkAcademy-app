import { getCategoriesByAccountAPI, getUserProfileAPI, getUserSurveyAPI } from "@/app/utils/apiall";
import CategoryCard from "@/components/card/categoryCard";
import LatestEvaluationCard from "@/components/card/evaluationCard";
import SafeAreaTabWrapper from "@/components/layout/SafeAreaTabWrapper";
import ProgressBar from "@/components/onboarding/progressBar"; // bản đã tích hợp %
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
import { ActivityIndicator, FlatList, Pressable, RefreshControl, SafeAreaView, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-root-toast";

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
}

// Interface cho Category
interface Category {
  id: number;
  name: string;
  description: string;
  isLock: boolean;
}

const HomeScreen = ({ navigation }: any) => {
  const progress = 0.4;
  const padding = getResponsivePadding();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      
      // Kiểm tra token trước khi gọi API
      const token = await AsyncStorage.getItem("access_token");
      console.log('🔑 Token exists:', !!token);
      
      if (!token) {
        console.log('❌ No token found');
        Toast.show("Vui lòng đăng nhập lại!", {
          position: Toast.positions.TOP,
        });
        router.replace("/(auth)/welcome");
        return;
      }

      const response = await getUserProfileAPI();
      console.log('📊 Profile API Response:', response);
      
      // Vì axios interceptor đã trả về response.data, nên response chính là data
      if (response) {
        const profileData = response as unknown as UserProfile;
        setUserProfile(profileData);
        console.log('✅ Profile loaded successfully:', profileData);
        console.log('👤 User:', profileData.username);
        console.log('📧 Email:', profileData.email);
      } else {
        console.log('⚠️ No data in response');
        Toast.show("Không có dữ liệu profile!", {
          position: Toast.positions.TOP,
        });
      }
    } catch (error: any) {
      console.error('💥 Error fetching profile:', error);
      console.error('💥 Error details:', error?.response?.data);
      
      // Xử lý lỗi cụ thể
      if (error?.response?.status === 401) {
        Toast.show("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!", {
          position: Toast.positions.TOP,
        });
        await AsyncStorage.removeItem("access_token");
        router.replace("/(auth)/welcome");
      } else {
        Toast.show("Không thể tải thông tin profile. Vui lòng thử lại!", {
          position: Toast.positions.TOP,
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Function để load categories từ API bằng userId từ AsyncStorage
  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      
      // Lấy userId từ AsyncStorage
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.log('❌ No userId found in AsyncStorage');
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
      setCategoriesLoading(false);
    }
  }, []);

  // Function để xử lý pull-to-refresh
  const onRefresh = useCallback(async () => {
    console.log('🔄 onRefresh called');
    setRefreshing(true);
    try {
      // Refresh cả user profile và categories
      await Promise.all([
        fetchUserProfile(),
        loadCategories()
      ]);
      console.log('✅ Refresh completed successfully');
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    } finally {
      setRefreshing(false);
      console.log('🔄 Refresh finished');
    }
  }, [fetchUserProfile, loadCategories]);

  const checkSurveys = useCallback(async (userId: number) => {
    try {
      console.log('🔍 Checking surveys for user ID in home:', userId);
      
      const response = await getUserSurveyAPI();
      console.log('📊 Surveys API Response in home:', response);
      
      if (response && Array.isArray(response)) {
        // Filter surveys của user hiện tại
        const userSurveys = response.filter((survey: any) => 
          survey.user && survey.user.id === userId
        );
        
        console.log('📊 User surveys found in home:', userSurveys.length);
        
        if (userSurveys.length === 0) {
          console.log('⚠️ No surveys found for current user in home - redirecting to onboarding');
          
          // Clear onboarding status để bắt buộc làm lại
          await AsyncStorage.removeItem('onboarding_completed');
          
          // Redirect to onboarding
          router.replace('/(onboarding)/intro');
          return false;
        }
        
        console.log('✅ User has surveys in home, continuing...');
        return true;
      } else {
        console.log('⚠️ No surveys data in response in home - redirecting to onboarding');
        
        // Clear onboarding status để bắt buộc làm lại
        await AsyncStorage.removeItem('onboarding_completed');
        
        // Redirect to onboarding
        router.replace('/(onboarding)/intro');
        return false;
      }
    } catch (error: any) {
      console.error('💥 Error checking surveys in home:', error);
      
      // Redirect to onboarding nếu có lỗi API
      Toast.show("Không thể tải khảo sát. Vui lòng hoàn thành onboarding", {
        position: Toast.positions.TOP,
        duration: 3000,
      });
      
      // Clear onboarding status để bắt buộc làm lại
      await AsyncStorage.removeItem('onboarding_completed');
      
      // Redirect to onboarding
      router.replace('/(onboarding)/intro');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Check surveys sau khi userProfile đã load xong
  useEffect(() => {
    if (userProfile?.id) {
      console.log('🔄 UserProfile loaded in home, checking surveys...');
      checkSurveys(userProfile.id);
    }
  }, [userProfile?.id, checkSurveys]);

  // Load categories độc lập khi component mount
  useEffect(() => {
    console.log('🔄 Home component mounted, loading categories...');
    loadCategories();
  }, [loadCategories]);


  if (loading) {
    return (
      <SafeAreaTabWrapper style={[styles.safe, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#2AA0FF" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </SafeAreaTabWrapper>
    );
  }

  const renderContent = () => (
    <View style={{ paddingHorizontal: padding.horizontal }}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.greetingContainer}>
          <Text style={styles.hello}>Xin chào,</Text>
          <Text style={[styles.name, { fontStyle: 'italic' }]}>
            {userProfile?.username || 'Người dùng'}
          </Text>
        </View>
      </View>

      {/* Progress */}
      <Text style={styles.sectionLabel}>Tiến độ của bạn</Text>
      <View style={{ marginBottom: responsiveSpacing(12) }}>
        <ProgressBar
          progress={progress}
          height={responsiveSize(36)}
          trackColor="#F1F4F6"
          tintColor="#58BDF8"
          showLabel
          labelPosition="right"
          labelStyle={{ 
            color: "#9AA6B2", 
            fontSize: responsiveFontSize(14) 
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
        <View style={{ marginTop: responsiveSpacing(8), marginBottom: responsiveSpacing(24) }}>
         
          
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
                  if (!categories[0].isLock) {
                    router.push(`/(exercise)/reading?categoryId=${categories[0].id}&categoryName=${encodeURIComponent(categories[0].name)}`);
                  }
                }}
              />
            </View>
          )}
           <View style={styles.sectionHeader}>
         
         <Pressable 
           style={styles.exploreButton}
           onPress={() => router.push('/(exercise)/categories')}
         >
           <Text style={styles.exploreButtonText}>Khám phá thêm</Text>
           <Ionicons name="chevron-forward" size={16} color="#2FA6F3" />
         </Pressable>
       </View>
        </View>
      )}

      {/* Latest evaluation */}
      <LatestEvaluationCard score={88} />

      {/* Categories Section */}
     

      {/* Profile button */}
     

      <View style={{ height: responsiveSpacing(120) }} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[1]} // Dummy data để render một item
        renderItem={renderContent}
        keyExtractor={() => 'home-content'}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']} // Android
            tintColor="#3B82F6" // iOS
            progressBackgroundColor="#FFFFFF"
            title="Kéo để làm mới"
            titleColor="#3B82F6"
          />
        }
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
    minHeight: '100%',
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: responsiveSpacing(14),
  },
  greetingContainer: {
    flex: 1,
  },
  hello: { 
    fontSize: responsiveFontSize(42), 
    fontWeight: "900", 
    color: "#123E2D" 
  },
  name: {
    fontSize: responsiveFontSize(38),
    fontWeight: "900",
    color: "#2AA0FF",
    marginTop: responsiveSpacing(1.5),
  },
  sectionLabel: {
    color: "#0F3D57",
    fontWeight: "800",
    marginTop: responsiveSpacing(8),
    marginBottom: responsiveSpacing(8),
    fontSize: responsiveFontSize(24),
  },
  sectionTitle: { 
    color: "#0F3D57", 
    fontWeight: "900" 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(24)
  },
  loadingText: {
    marginTop: responsiveSpacing(12),
    fontSize: responsiveFontSize(16),
    color: '#666'
  },
  profileButtonContainer: {
    marginTop: responsiveSpacing(24),
    alignItems: 'center'
  },
  profileButton: {
    fontSize: responsiveFontSize(16),
    color: '#2AA0FF',
    fontWeight: '600',
    textDecorationLine: 'underline'
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
