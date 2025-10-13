import { getUserProfileAPI } from "@/app/utils/apiall";
import SafeAreaTabWrapper from "@/components/layout/SafeAreaTabWrapper";
import { useCurrentApp } from "@/context/app.context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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


const Card = ({
  title,
  desc,
  icon,
  onPress,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
  onPress?: () => void;
}) => (
  <TouchableOpacity 
    style={styles.card} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.iconWrap}>{icon}</View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDesc}>{desc}</Text>
    </View>
  </TouchableOpacity>
);

const ProfileSection = ({ userProfile, loading }: { userProfile: UserProfile | null; loading: boolean }) => {
  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2FA6F3" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
      
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={60} color="#2FA6F3" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{userProfile?.username || 'Chưa cập nhật'}</Text>
          <Text style={styles.profileEmail}>{userProfile?.email || 'Chưa cập nhật'}</Text>
          <Text style={styles.profileLevel}>{userProfile?.role || 'CUSTOMER'}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userProfile?.voiceTests?.length || 0}</Text>
          <Text style={styles.statLabel}>Bài kiểm tra</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userProfile?.practices?.length || 0}</Text>
          <Text style={styles.statLabel}>Bài luyện tập</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userProfile?.userPackages?.length || 0}</Text>
          <Text style={styles.statLabel}>Gói đã mua</Text>
        </View>
      </View>
    </View>
  );
};

const AnalysisSection = ({ userProfile }: { userProfile: UserProfile | null }) => {
  const totalTests = userProfile?.voiceTests?.length || 0;
  const totalPractices = userProfile?.practices?.length || 0;
  const totalPackages = userProfile?.userPackages?.length || 0;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Thống kê hoạt động</Text>

      <Card
        title="Bài kiểm tra"
        desc={`Bạn đã hoàn thành ${totalTests} bài kiểm tra phát âm. ${totalTests > 0 ? 'Tiếp tục duy trì để cải thiện kỹ năng!' : 'Hãy bắt đầu với bài kiểm tra đầu tiên.'}`}
        icon={
          <MaterialCommunityIcons name="chart-bar" size={40} color="#2FA6F3" />
        }
        onPress={() => router.push('/(onboarding)/voiceCheck')}
      />
      <Card 
        title="Bài luyện tập"
        desc={`Đã luyện tập ${totalPractices} bài. ${totalPractices > 0 ? 'Luyện tập thường xuyên sẽ giúp phát âm chuẩn hơn!' : 'Bắt đầu luyện tập để cải thiện phát âm.'}`}
        icon={<Ionicons name="book" size={40} color="#2FA6F3" />}
        onPress={() => router.push('/(exercise)/categories')}
      />
      <Card
        title="Gói học"
        desc={`Đã sở hữu ${totalPackages} gói học. ${totalPackages > 0 ? 'Tận dụng tối đa các gói học để nâng cao trình độ!' : 'Khám phá các gói học phù hợp với bạn.'}`}
        icon={
          <MaterialCommunityIcons name="package-variant" size={40} color="#2FA6F3" />
        }
        onPress={() => router.push('/(tabs)/package')}
      />
    </View>
  );
};


// const DebugSection = ({ userProfile }: { userProfile: UserProfile | null }) => {
//   const [showDebug, setShowDebug] = useState(false);

//   if (!__DEV__) return null; // Chỉ hiển thị trong development

//   return (
//     <View style={styles.section}>
//       <TouchableOpacity 
//         style={styles.debugToggle}
//         onPress={() => setShowDebug(!showDebug)}
//       >
//         <Text style={styles.debugToggleText}>
//           {showDebug ? 'Ẩn' : 'Hiện'} Debug Info
//         </Text>
//       </TouchableOpacity>
      
//       {showDebug && (
//         <View style={styles.debugContainer}>
//           <Text style={styles.debugTitle}>Debug Information:</Text>
//           <Text style={styles.debugText}>
//             Profile Data: {JSON.stringify(userProfile, null, 2)}
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// };

export default function ProfileScreen() {
  const { setAppState } = useCurrentApp();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      
      // Kiểm tra token trước khi gọi API
      const token = await AsyncStorage.getItem("access_token");
      console.log('🔑 Token exists:', !!token);
      
      if (!token) {
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
        console.log('🎯 Role:', profileData.role);
        console.log('📊 Voice Tests:', profileData.voiceTests.length);
        console.log('📚 Practices:', profileData.practices.length);
        console.log('📦 Packages:', profileData.userPackages.length);
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
        // Clear token và redirect
        await AsyncStorage.removeItem("access_token");
        router.replace("/(auth)/welcome");
      } else if (error?.response?.status === 403) {
        Toast.show("Bạn không có quyền truy cập thông tin này!", {
          position: Toast.positions.TOP,
        });
      } else {
        Toast.show("Không thể tải thông tin profile. Vui lòng thử lại!", {
          position: Toast.positions.TOP,
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchUserProfile();
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchUserProfile]);

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear AsyncStorage
              await AsyncStorage.multiRemove([
                "access_token",
                "refreshToken",
                "role",
                "userId",
                "userEmail",
                "userName",
                "userPicture",
                "accountType",
                "trialExpiresAt"
              ]);

              // Clear app state
              setAppState?.(null);

              // Show success message
              Toast.show("Đăng xuất thành công!", {
                position: Toast.positions.TOP,
              });

              // Navigate to welcome screen
              router.replace("/(auth)/welcome");
            } catch (error) {
              console.error("Logout error:", error);
              Toast.show("Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại!", {
                position: Toast.positions.TOP,
              });
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaTabWrapper style={styles.safe}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2FA6F3']} // Android
            tintColor="#2FA6F3" // iOS
          />
        }
      >
        <View style={styles.headerContainer}>
          <Text style={styles.h1}>Profile</Text>
        </View>
        
        <ProfileSection userProfile={userProfile} loading={loading} />
        <AnalysisSection userProfile={userProfile} />
        {/* <DebugSection userProfile={userProfile} /> */}
        
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaTabWrapper>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
   
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Thêm padding bottom để tránh bị che bởi tab bar
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  h1: {
    fontSize: 45,
    fontWeight: "800",
    color: "#2C5530",
    flex: 1,
  },
  testButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C5530",
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  avatarContainer: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C5530",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  profileLevel: {
    fontSize: 14,
    color: "#2FA6F3",
    fontWeight: "600",
  },
  profileId: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 2,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2FA6F3",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#E8F4FD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2FA6F3",
    marginBottom: 8,
  },
  cardDesc: {
    color: "#6B7280",
    lineHeight: 20,
    fontSize: 14,
  },
  logoutSection: {
    marginTop: 32,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  debugToggle: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  debugToggleText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  debugContainer: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "monospace",
  },
  // Survey styles
  surveyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  surveyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  surveyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  surveyInfo: {
    flex: 1,
  },
  surveyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C5530",
    marginBottom: 2,
  },
  surveyDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  surveyContent: {
    marginTop: 8,
  },
  surveyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  surveyLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    flex: 1,
  },
  surveyValue: {
    fontSize: 14,
    color: "#2C5530",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
