import { getUserProfileAPI, getUserSurveyAPI } from "@/app/utils/apiall";
import LatestEvaluationCard from "@/components/card/evaluationCard";
import PathCard from "@/components/card/pathCard";
import SafeAreaTabWrapper from "@/components/layout/SafeAreaTabWrapper";
import ProgressBar from "@/components/onboarding/progressBar"; // bản đã tích hợp %
import { getOnboardingCompleted } from "@/utils/onboarding";
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
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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

const HomeScreen = ({ navigation }: any) => {
  const progress = 0.4;
  const padding = getResponsivePadding();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

  const checkOnboardingAndFetchProfile = useCallback(async () => {
    try {
      // Kiểm tra xem user đã hoàn thành onboarding chưa
      const hasCompletedOnboarding = await getOnboardingCompleted();
      
      if (!hasCompletedOnboarding) {
        // Nếu chưa hoàn thành onboarding, chuyển đến onboarding
        router.replace("/(onboarding)/intro");
        return;
      }
      
      // Nếu đã hoàn thành onboarding, tiếp tục fetch profile
      await fetchUserProfile();
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Nếu có lỗi, vẫn tiếp tục fetch profile
      await fetchUserProfile();
    }
  }, [fetchUserProfile]);

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
    checkOnboardingAndFetchProfile();
  }, [checkOnboardingAndFetchProfile]);

  // Check surveys sau khi userProfile đã load xong
  useEffect(() => {
    if (userProfile?.id) {
      console.log('🔄 UserProfile loaded in home, checking surveys...');
      checkSurveys(userProfile.id);
    }
  }, [userProfile?.id, checkSurveys]);


  if (loading) {
    return (
      <SafeAreaTabWrapper style={[styles.safe, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#2AA0FF" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </SafeAreaTabWrapper>
    );
  }

  return (
    <SafeAreaTabWrapper style={[styles.safe, { paddingHorizontal: padding.horizontal }]}>
      {/* Header with refresh button */}
      <View style={styles.headerContainer}>
        <View style={styles.greetingContainer}>
          <Text style={styles.hello}>Xin chào,</Text>
          <Text style={styles.name}>
            {userProfile?.username || 'Người dùng'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={fetchUserProfile}
          disabled={loading}
        >
          <Ionicons 
            name="refresh" 
            size={24} 
            color={loading ? "#9CA3AF" : "#2AA0FF"} 
          />
        </TouchableOpacity>
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
      <View style={{ 
        marginTop: responsiveSpacing(18), 
        marginBottom: responsiveSpacing(28) 
      }}>
        <PathCard
          title="Phát âm"
          desc="A small description about the feature title. Its better to only..."
          onPress={() => router.push("/(exercise)/lessonOne")}
        />
      </View>

      {/* Latest evaluation */}
      <LatestEvaluationCard score={88} />

      {/* Profile button */}
     

      <View style={{ height: responsiveSpacing(20) }} />
    </SafeAreaTabWrapper>
  );
};

const styles = StyleSheet.create({
  safe: { 
    paddingTop: responsiveSpacing(24) 
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
    fontSize: responsiveFontSize(42),
    fontWeight: "900",
    color: "#2AA0FF",
    marginTop: responsiveSpacing(2),
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#E0F2FE",
    marginTop: responsiveSpacing(8),
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
  }
});
export default HomeScreen;
