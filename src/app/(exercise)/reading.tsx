import { getReadingPassageByCategoryWithStatusAPI } from "@/app/utils/apiall";
import SafeAreaTabWrapper from "@/components/layout/SafeAreaTabWrapper";
import {
  getResponsivePadding,
  responsiveFontSize,
  responsiveSize,
  responsiveSpacing
} from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-root-toast";

interface ReadingPassage {
  id: number;
  title: string;
  content: string;
  level: string;
  createdAt: string;
  isActive: boolean;
  completedUsers: {
    id: number;
    password: string;
    username: string;
    email: string;
    googleId: string | null;
    avatar: string | null;
    refreshToken: string;
    role: string;
  }[];
  isFinished: boolean;
  isUnlocked: boolean;
}

export default function ReadingScreen() {
  const params = useLocalSearchParams();
  const categoryId = params.categoryId as string;
  const categoryName = params.categoryName as string;
  const padding = getResponsivePadding();

  console.log('🔍 ReadingScreen params:', params);
  console.log('🔍 categoryId:', categoryId);
  console.log('🔍 categoryName:', categoryName);

  const [passages, setPassages] = useState<ReadingPassage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPassages = useCallback(async () => {
    if (!categoryId) {
      console.log('❌ No categoryId provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('📚 Fetching reading passages with status for categoryId:', categoryId);

      const response = await getReadingPassageByCategoryWithStatusAPI(parseInt(categoryId));
      console.log('📚 Reading passages with status response:', response);

      if (response && Array.isArray(response)) {
        setPassages(response);
        console.log('📚 Reading passages loaded:', response.length, 'items');
      } else {
        setPassages([]);
        console.log('📚 No reading passages found');
      }
    } catch (error: any) {
      console.error('❌ Error fetching reading passages:', error);
      Toast.show("Không thể tải bài đọc. Vui lòng thử lại!", {
        position: Toast.positions.TOP
      });
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  const handleRefresh = useCallback(async () => {
    console.log('🔄 Reading handleRefresh called');
    setRefreshing(true);
    try {
      await fetchPassages();
      console.log('✅ Reading refresh completed successfully');
    } catch (error) {
      console.error('❌ Error refreshing reading passages:', error);
    } finally {
      setRefreshing(false);
      console.log('🔄 Reading refresh finished');
    }
  }, [fetchPassages]);

  useEffect(() => {
    if (categoryId) {
      fetchPassages();
    }
  }, [categoryId, fetchPassages]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return '#10B981';
      case 'INTERMEDIATE':
        return '#F59E0B';
      case 'ADVANCED':
        return '#EF4444';
      default:
        return '#2FA6F3';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'leaf';
      case 'INTERMEDIATE':
        return 'flame';
      case 'ADVANCED':
        return 'star';
      default:
        return 'book';
    }
  };

  if (!categoryId) {
    return (
      <SafeAreaTabWrapper style={styles.safe}>
        <View style={styles.loadingContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle-outline" size={responsiveSize(72)} color="#2FA6F3" />
          </View>
          <Text style={styles.errorTitle}>Không tìm thấy danh mục</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={responsiveSize(20)} color="#FFFFFF" />
            <Text style={styles.errorButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaTabWrapper>
    );
  }

  if (loading) {
    return (
      <SafeAreaTabWrapper style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2FA6F3" />
          <Text style={styles.loadingText}>Đang tải bài đọc...</Text>
        </View>
      </SafeAreaTabWrapper>
    );
  }

  const renderContent = () => (
    <View style={{ paddingHorizontal: padding.horizontal }}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={responsiveSize(24)} color="#2FA6F3" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {categoryName || 'Bài đọc'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {passages.length} bài đọc có sẵn
          </Text>
        </View>
      </View>
      
      {/* Mascot Reading Introduction - giống introLayout */}
      {/* <View style={styles.mascotContainer}>
      <MascotWithBubble
            message="Hãy cùng Luyện tập nào!!!"
            mascotSource={getMascotByType('talking').source}
            containerStyle={StyleSheet.absoluteFill}
            mascotWidth={responsiveSize(130)}
            mascotHeight={responsiveSize(130)}
            mascotPosition={{ 
              left: responsiveSize(-10), 
              bottom: responsiveSize(230) 
            }}
            bubblePosition={{ 
              left: responsiveSize(100), 
              top: responsiveSize(-120) 
            }}
            bubbleStyle={{
              height: responsiveSize(50), 
              width: responsiveSize(220)
            }}
            bgColor={getMascotByType('longlanh').recommendedBubbleColor?.bgColor}
            borderColor={getMascotByType('longlanh').recommendedBubbleColor?.borderColor}
            responsive={true}
          />
      </View> */}

      {passages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="book-outline" size={responsiveSize(80)} color="#E8F4FD" />
          </View>
          <Text style={styles.emptyTitle}>Chưa có bài đọc</Text>
          <Text style={styles.emptySubtitle}>
            Hiện tại chưa có bài đọc nào trong danh mục này. Hãy quay lại sau nhé!
          </Text>
        </View>
      ) : (
        <View style={styles.passagesContainer}>
          {passages.map((passage, index) => (
            <TouchableOpacity
              key={passage.id}
              style={[
                styles.passageCard,
                !passage.isUnlocked && { opacity: 0.5 }, // Replace lockedCard style with inline opacity
                {
                  transform: [{ scale: 1 }],
                }
              ]}
              onPress={() => {
                if (passage.isUnlocked) {
                  router.push(`/passage-detail?id=${passage.id}&title=${encodeURIComponent(passage.title)}&categoryId=${categoryId}`);
                } else {
                  Toast.show("Bài đọc này đã bị khóa!", { position: Toast.positions.TOP });
                }
              }}
              activeOpacity={passage.isUnlocked ? 0.8 : 1}
              disabled={!passage.isUnlocked}
            >
              {/* Gradient background effect */}
              <View style={styles.gradientBg} />
              
              {/* Soft background effect */}
              <View style={styles.softBg} />

              {/* Icon container */}
              <View style={styles.iconWrap}>
                <View style={styles.iconInner}>
                  <Ionicons
                    name={
                      !passage.isUnlocked 
                        ? "lock-closed" 
                        : passage.isFinished 
                          ? "checkmark-circle" 
                          : getLevelIcon(passage.level)
                    }
                    size={responsiveSize(18)}
                    color={
                      !passage.isUnlocked 
                        ? "#9CA3AF" 
                        : passage.isFinished 
                          ? "#10B981" 
                          : getLevelColor(passage.level)
                    }
                  />
                </View>
               
              </View>

              {/* Content */}
              <View style={styles.content}>
                <Text style={[
                  styles.passageTitle,
                  !passage.isUnlocked && styles.lockedText
                ]} numberOfLines={2}>
                  {passage.title}
                </Text>

                <Text style={[
                  styles.passageContent,
                  !passage.isUnlocked && styles.lockedText
                ]} numberOfLines={2}>
                  {passage.content}
                </Text>

                {/* Read more button */}
                <View style={[
                  styles.readMore,
                  !passage.isUnlocked && styles.lockedReadMore
                ]}>
                  <Text style={[
                    styles.readMoreText,
                    !passage.isUnlocked && styles.lockedReadMoreText
                  ]}>
                    {!passage.isUnlocked 
                      ? "Đã khóa" 
                      : passage.isFinished 
                        ? "Đã hoàn thành" 
                        : "Đọc ngay"
                    }
                  </Text>
                  <Ionicons 
                    name={
                      !passage.isUnlocked 
                        ? "lock-closed" 
                        : passage.isFinished 
                          ? "checkmark-circle" 
                          : "arrow-forward"
                    } 
                    size={responsiveSize(16)} 
                    color={
                      !passage.isUnlocked 
                        ? "#9CA3AF" 
                        : passage.isFinished 
                          ? "#10B981" 
                          : "#2FA6F3"
                    } 
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: responsiveSpacing(30) }} />
    </View>
  );

  return (
    <SafeAreaTabWrapper style={styles.safe}>
      <FlatList
        data={[1]} // Dummy data để render một item
        renderItem={renderContent}
        keyExtractor={() => 'reading-content'}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
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
  errorIconContainer: {
    width: responsiveSize(120),
    height: responsiveSize(120),
    borderRadius: responsiveSize(60),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: responsiveSpacing(24),
  },
  errorTitle: {
    fontSize: responsiveFontSize(22),
    fontWeight: '800',
    color: '#2C5530',
    marginBottom: responsiveSpacing(24),
  },
  errorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2FA6F3',
    paddingHorizontal: responsiveSpacing(24),
    paddingVertical: responsiveSpacing(14),
    borderRadius: responsiveSize(16),
    gap: responsiveSpacing(8),
    shadowColor: "#2FA6F3",
    shadowOpacity: 0.3,
    shadowRadius: responsiveSize(12),
    shadowOffset: { width: 0, height: responsiveSize(4) },
    elevation: 6,
  },
  errorButtonText: {
    fontSize: responsiveFontSize(16),
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveSpacing(24),
    marginTop: responsiveSpacing(20), // Increased for status bar
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
  passagesContainer: {
    paddingTop: responsiveSpacing(20),
  },
  passageCard: {
    position: "relative",
    flexDirection: "row",
    gap: responsiveSpacing(19),
    padding: responsiveSpacing(16),
    borderRadius: responsiveSize(20),
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: responsiveSpacing(16),
    // Enhanced shadow
    shadowColor: "#2FA6F3",
    shadowOpacity: 0.1,
    shadowRadius: responsiveSize(12),
    shadowOffset: { width: 0, height: responsiveSize(6) },
    elevation: 8,
    overflow: 'hidden',
  },
  // Gradient background effect
  gradientBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: responsiveSize(20),
    backgroundColor: "#F0F8FF",
    opacity: 0.3,
  },

  // Soft background effect
  softBg: {
    position: "absolute",
    left: responsiveSpacing(8),
    top: responsiveSpacing(10),
    width: responsiveSize(74),
    height: responsiveSize(84),
    borderRadius: responsiveSize(16),
    backgroundColor: "#F0F8FF",
    opacity: 0.6,
    // Enhanced shadow effect
    shadowColor: "#2FA6F3",
    shadowOpacity: 0.3,
    shadowRadius: responsiveSize(20),
    shadowOffset: { width: 0, height: responsiveSize(4) },
    elevation: 4,
  },

  iconWrap: {
    width: responsiveSize(54),
    height: responsiveSize(54),
    borderRadius: responsiveSize(16),
    backgroundColor: "#F0F8FF",
    borderWidth: 1,
    borderColor: "#B3D9FF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    // Enhanced shadow
    shadowColor: "#2FA6F3",
    shadowOpacity: 0.2,
    shadowRadius: responsiveSize(8),
    shadowOffset: { width: 0, height: responsiveSize(2) },
    elevation: 3,
  },
  iconInner: {
    width: responsiveSize(36),
    height: responsiveSize(36),
    borderRadius: responsiveSize(10),
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#B3D9FF",
    alignItems: "center",
    justifyContent: "center",
    // Subtle shadow
    shadowColor: "#2FA6F3",
    shadowOpacity: 0.1,
    shadowRadius: responsiveSize(4),
    shadowOffset: { width: 0, height: responsiveSize(1) },
    elevation: 1,
  },

  content: { 
    flex: 1, 
    paddingRight: responsiveSpacing(4) 
  },
  passageTitle: {
    fontSize: responsiveFontSize(24),
    lineHeight: responsiveSize(28),
    fontWeight: "800",
    color: "#2C5530",
    marginBottom: responsiveSpacing(16),
  },
  passageContent: {
    fontSize: responsiveFontSize(16),
    lineHeight: responsiveSize(24),
    color: "#6B7280",
    marginRight: responsiveSpacing(10),
  },

  readMore: {
    alignSelf: "flex-end",
    marginTop: responsiveSpacing(20),
    flexDirection: "row",
    alignItems: "center",
    gap: responsiveSpacing(6),
    paddingHorizontal: responsiveSpacing(14),
    paddingVertical: responsiveSpacing(7),
    borderRadius: responsiveSize(20),
    borderWidth: 1.5,
    backgroundColor: "transparent",
    borderColor: "#2FA6F3",
    // Subtle shadow
    shadowColor: "#2FA6F3",
    shadowOpacity: 0.1,
    shadowRadius: responsiveSize(4),
    shadowOffset: { width: 0, height: responsiveSize(2) },
    elevation: 2,
  },
  readMoreText: { 
    color: "#2FA6F3", 
    fontWeight: "800",
    fontSize: responsiveFontSize(14),
  },
  completionBadge: {
    position: "absolute",
    top: -responsiveSize(4),
    right: -responsiveSize(4),
    width: responsiveSize(20),
    height: responsiveSize(20),
    borderRadius: responsiveSize(10),
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#10B981",
    shadowOpacity: 0.3,
    shadowRadius: responsiveSize(4),
    shadowOffset: { width: 0, height: responsiveSize(2) },
    elevation: 4,
  },
  lockBadge: {
    position: "absolute",
    top: -responsiveSize(4),
    right: -responsiveSize(4),
    width: responsiveSize(20),
    height: responsiveSize(20),
    borderRadius: responsiveSize(10),
    backgroundColor: "#9CA3AF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#9CA3AF",
    shadowOpacity: 0.3,
    shadowRadius: responsiveSize(4),
    shadowOffset: { width: 0, height: responsiveSize(2) },
    elevation: 4,
  },
  lockedText: {
    color: "#9CA3AF",
  },
  lockedReadMore: {
    borderColor: "#9CA3AF",
    shadowColor: "#9CA3AF",
    shadowOpacity: 0.05,
  },
  lockedReadMoreText: {
    color: "#9CA3AF",
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
  mascotContainer: {
    width: '100%',
    height: 400,
    marginTop: 140,
  },
});
