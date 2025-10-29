import { getUserOverviewAPI } from "@/app/utils/apiall";
import SafeAreaTabWrapper from "@/components/layout/SafeAreaTabWrapper";
import CustomScrollView from "@/components/refresh/CustomScrollView";
import { responsiveSpacing } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-root-toast";

// Interface cho User Overview Data
interface UserOverviewData {
  completedPassages: number;
  voiceStatsByPassage: {
    passageTitle: string;
    avgScore: number;
    avgCer: number;
    avgSpm: number;
    avgPause: number;
  }[];
  latestvoiceLevel: number;
  completedPercentage: number;
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color = "#2FA6F3",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
}) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={styles.statCardHeader}>
      <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
        {icon}
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  </View>
);

const LevelCard = ({
  currentLevel,
  completedPercentage,
  color = "#F59E0B",
}: {
  currentLevel: number;
  completedPercentage: number;
  color?: string;
}) => {
  const levels = [
    { name: "BEGINNER", min: 0, max: 3, color: "#10B981" },
    { name: "INTERMEDIATE", min: 3, max: 6, color: "#F59E0B" },
    { name: "ADVANCED", min: 6, max: 10, color: "#8B5CF6" },
  ];

  const getCurrentLevelInfo = () => {
    if (currentLevel < 3) return { ...levels[0] };
    if (currentLevel < 6) return { ...levels[1] };
    return { ...levels[2] };
  };

  const currentLevelInfo = getCurrentLevelInfo();

  return (
    <View
      style={[styles.levelCard, { borderLeftColor: currentLevelInfo.color }]}
    >
      <View style={styles.levelCardContent}>
        <View
          style={[
            styles.levelIconContainer,
            { backgroundColor: currentLevelInfo.color + "20" },
          ]}
        >
          <Ionicons name="trophy" size={32} color={currentLevelInfo.color} />
        </View>
        <View style={styles.levelTextContainer}>
          <Text style={styles.levelCardTitle}>Cấp độ hiện tại</Text>
          <Text style={styles.levelCardSubtitle}>Trình độ phát âm</Text>
        </View>
      </View>
    </View>
  );
};

const LevelProgressBar = ({
  currentLevel,
  completedPercentage,
  color = "#2FA6F3",
}: {
  currentLevel: number;
  completedPercentage: number;
  color?: string;
}) => {
  const levels = [
    { name: "BEGINNER", min: 0, max: 3, color: "#10B981" },
    { name: "INTERMEDIATE", min: 3, max: 6, color: "#F59E0B" },
    { name: "ADVANCED", min: 6, max: 10, color: "#8B5CF6" },
  ];

  const getCurrentLevelInfo = () => {
    if (currentLevel < 3) return { ...levels[0] };
    if (currentLevel < 6) return { ...levels[1] };
    return { ...levels[2] };
  };

  const currentLevelInfo = getCurrentLevelInfo();

  return (
    <View style={styles.progressContainer}>
      <View style={styles.levelProgressContainer}>
        <View style={styles.levelProgressBar}>
          <View
            style={[
              styles.levelProgressFill,
              {
                width: `${Math.min(100, Math.max(0, completedPercentage))}%`,
                backgroundColor: currentLevelInfo.color,
              },
            ]}
          />
        </View>
        <Text
          style={[styles.levelProgressText, { color: currentLevelInfo.color }]}
        >
          Level {currentLevel} - {completedPercentage.toFixed(1)}% hoàn thành
        </Text>
      </View>

      <View style={styles.levelMilestones}>
        {levels.map((level, index) => (
          <View key={level.name} style={styles.levelMilestone}>
            <View
              style={[
                styles.levelMilestoneDot,
                currentLevel >= level.min
                  ? { backgroundColor: level.color }
                  : { backgroundColor: "#E5E7EB" },
              ]}
            />
            <Text
              style={[
                styles.levelMilestoneText,
                currentLevel >= level.min
                  ? { color: level.color }
                  : { color: "#9CA3AF" },
              ]}
            >
              {level.name}
            </Text>
            <Text
              style={[
                styles.levelMilestoneRange,
                currentLevel >= level.min
                  ? { color: level.color }
                  : { color: "#9CA3AF" },
              ]}
            >
              {level.min}-{level.max}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const PassageStatsCard = ({
  passage,
  index,
}: {
  passage: any;
  index: number;
}) => (
  <View style={styles.passageCard}>
    <View style={styles.passageHeader}>
      <Text style={styles.passageTitle}>{passage.passageTitle}</Text>
      <Text style={styles.passageScore}>
        {passage.avgScore.toFixed(1)} điểm
      </Text>
    </View>

    <View style={styles.passageMetrics}>
      <View style={styles.metricRow}>
        <View style={styles.metricItem}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={styles.metricLabel}>Độ chính xác</Text>
          <Text style={styles.metricValue}>
            {((1 - passage.avgCer) * 100).toFixed(1)}%
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Ionicons name="speedometer" size={16} color="#F59E0B" />
          <Text style={styles.metricLabel}>Tốc độ nói</Text>
          <Text style={styles.metricValue}>
            {parseFloat(passage.avgSpm).toFixed(0)} SPM
          </Text>
        </View>
      </View>
      <View style={styles.metricRow}>
        <View style={styles.metricItem}>
          <Ionicons name="pause-circle" size={16} color="#8B5CF6" />
          <Text style={styles.metricLabel}>Tỷ lệ tạm dừng</Text>
          <Text style={styles.metricValue}>
            {(passage.avgPause * 100).toFixed(1)}%
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Ionicons name="trending-up" size={16} color="#2FA6F3" />
          <Text style={styles.metricLabel}>Hiệu suất</Text>
          <Text style={styles.metricValue}>
            {passage.avgScore >= 8
              ? "Tốt"
              : passage.avgScore >= 6
              ? "Khá"
              : "Cần cải thiện"}
          </Text>
        </View>
      </View>
    </View>
  </View>
);

export default function UserStatisticsScreen() {
  const [userOverview, setUserOverview] = useState<UserOverviewData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getLevelInfo = (level: number) => {
    if (level < 3) return { name: "BEGINNER", color: "#10B981" };
    if (level < 6) return { name: "INTERMEDIATE", color: "#F59E0B" };
    return { name: "ADVANCED", color: "#8B5CF6" };
  };

  const fetchUserOverview = useCallback(async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        Toast.show("Vui lòng đăng nhập lại!", {
          position: Toast.positions.TOP,
        });
        router.replace("/(auth)/welcome");
        return;
      }

      const response = await getUserOverviewAPI();
      console.log("📊 Overview API Response:", response);

      if (response) {
        const overviewData = response as unknown as UserOverviewData;
        setUserOverview(overviewData);
        console.log("✅ Overview loaded successfully:", overviewData);
      } else {
        console.log("⚠️ No overview data in response");
      }
    } catch (error: any) {
      console.error("💥 Error fetching overview:", error);

      if (error?.response?.status === 401) {
        Toast.show("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!", {
          position: Toast.positions.TOP,
        });
        await AsyncStorage.removeItem("access_token");
        router.replace("/(auth)/welcome");
      } else {
        Toast.show("Không thể tải thống kê. Vui lòng thử lại!", {
          position: Toast.positions.TOP,
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserOverview();
  }, [fetchUserOverview]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchUserOverview();
    } catch (error) {
      console.error("Error refreshing statistics:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchUserOverview]);

  if (loading) {
    return (
      <SafeAreaTabWrapper style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#2C5530" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thống kê người dùng</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2FA6F3" />
          <Text style={styles.loadingText}>Đang tải thống kê...</Text>
        </View>
      </SafeAreaTabWrapper>
    );
  }

  if (!userOverview) {
    return (
      <SafeAreaTabWrapper style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#2C5530" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thống kê người dùng</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="stats-chart-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Chưa có dữ liệu thống kê</Text>
          <Text style={styles.emptySubtitle}>
            Hãy bắt đầu luyện tập để xem thống kê chi tiết
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push("/(exercise)/categories")}
          >
            <Text style={styles.startButtonText}>Bắt đầu luyện tập</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaTabWrapper>
    );
  }

  const {
    completedPassages,
    voiceStatsByPassage,
    latestvoiceLevel,
    completedPercentage,
  } = userOverview;

  const currentLevelInfo = getLevelInfo(latestvoiceLevel || 0);

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#2C5530" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thống kê người dùng</Text>
        <View style={styles.placeholder} />
      </View>

      <CustomScrollView
        contentContainerStyle={styles.scrollContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        {/* Tổng quan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tổng quan</Text>

          <View style={styles.overviewGrid}>
            <StatCard
              title="Bài đã hoàn thành"
              value={completedPassages}
              subtitle="Tổng số bài tập"
              icon={
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              }
              color="#10B981"
            />
            <StatCard
              title="Cấp độ hiện tại"
              value={currentLevelInfo.name}
              subtitle="Trình độ phát âm"
              icon={
                <Ionicons
                  name="trophy"
                  size={24}
                  color={currentLevelInfo.color}
                />
              }
              color={currentLevelInfo.color}
            />
            <StatCard
              title="Điểm trung bình"
              value={
                voiceStatsByPassage.length > 0
                  ? (
                      voiceStatsByPassage.reduce(
                        (sum, p) => sum + p.avgScore,
                        0
                      ) / voiceStatsByPassage.length
                    ).toFixed(1)
                  : "0.0"
              }
              subtitle="Điểm số trung bình"
              icon={<Ionicons name="star" size={24} color="#8B5CF6" />}
              color="#8B5CF6"
            />
            <StatCard
              title="Tỷ lệ chính xác"
              value={
                voiceStatsByPassage.length > 0
                  ? (
                      (1 -
                        voiceStatsByPassage.reduce(
                          (sum, p) => sum + p.avgCer,
                          0
                        ) /
                          voiceStatsByPassage.length) *
                      100
                    ).toFixed(1) + "%"
                  : "0%"
              }
              subtitle="Độ chính xác trung bình"
              icon={
                <Ionicons name="checkmark-circle" size={24} color="#2FA6F3" />
              }
              color="#2FA6F3"
            />
          </View>
        </View>

        {/* Cấp độ tài khoản */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cấp độ tài khoản</Text>
          <Text style={styles.sectionSubtitle}>
            Theo dõi sự tiến bộ và cấp độ của bạn
          </Text>

          <LevelCard
            currentLevel={latestvoiceLevel || 0}
            completedPercentage={completedPercentage || 0}
          />

          <View style={styles.progressCard}>
            <LevelProgressBar
              currentLevel={latestvoiceLevel || 0}
              completedPercentage={completedPercentage || 0}
            />
            <View style={styles.progressInfo}>
              <Text style={styles.progressInfoText}>
                {completedPercentage >= 100
                  ? "🎉 Hoàn thành 100%! Bạn đã đạt cấp độ cao nhất!"
                  : completedPercentage >= 75
                  ? "🔥 Tuyệt vời! Bạn đã hoàn thành hơn 75%!"
                  : completedPercentage >= 50
                  ? "💪 Tốt lắm! Bạn đã hoàn thành hơn một nửa!"
                  : completedPercentage >= 25
                  ? "🚀 Tiếp tục phấn đấu! Bạn đã bắt đầu tốt!"
                  : "🌟 Hãy bắt đầu hành trình học tập của bạn!"}
              </Text>
            </View>
          </View>
        </View>

        {/* Thống kê chi tiết theo bài */}
        {voiceStatsByPassage.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thống kê chi tiết theo bài</Text>
            <Text style={styles.sectionSubtitle}>
              Phân tích hiệu suất của bạn trong từng bài tập
            </Text>

            {voiceStatsByPassage.map((passage, index) => (
              <PassageStatsCard key={index} passage={passage} index={index} />
            ))}
          </View>
        )}

        {/* Khuyến nghị */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khuyến nghị</Text>

          <View style={styles.recommendationCard}>
            <Ionicons name="bulb" size={24} color="#F59E0B" />
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>
                Mẹo cải thiện phát âm
              </Text>
              <Text style={styles.recommendationText}>
                {latestvoiceLevel < 3
                  ? "Hãy luyện tập thường xuyên với các bài tập cơ bản để nâng cao trình độ phát âm."
                  : latestvoiceLevel < 6
                  ? "Bạn đã có nền tảng tốt! Hãy thử thách bản thân với các bài tập nâng cao hơn."
                  : "Tuyệt vời! Bạn đã đạt trình độ cao. Hãy duy trì và chia sẻ kinh nghiệm với người khác."}
              </Text>
            </View>
          </View>
        </View>
      </CustomScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,

    paddingTop: responsiveSpacing(55),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C5530",
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: "#2FA6F3",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C5530",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 20,
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flex: 1,
    minWidth: "45%",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 8,
    color: "#9CA3AF",
  },
  passageCard: {
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
  },
  passageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  passageTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C5530",
    flex: 1,
  },
  passageScore: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2FA6F3",
  },
  passageMetrics: {
    gap: 12,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metricLabel: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
  },
  metricValue: {
    fontSize: 12,
    color: "#2C5530",
    fontWeight: "600",
  },
  recommendationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  recommendationContent: {
    flex: 1,
    marginLeft: 12,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C5530",
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },
  // Progress Bar Styles
  progressCard: {
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
  progressCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  progressCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C5530",
    marginLeft: 8,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C5530",
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "700",
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressBar: {
    height: "100%",
    borderRadius: 6,
  },
  progressMilestones: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  milestone: {
    alignItems: "center",
    flex: 1,
  },
  milestoneDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  milestoneText: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressInfo: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#2FA6F3",
  },
  progressInfoText: {
    fontSize: 12,
    color: "#2C5530",
    fontWeight: "500",
    textAlign: "center",
  },
  // Level Progress Bar Styles
  levelProgressContainer: {
    marginBottom: 20,
  },
  levelProgressBar: {
    height: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  levelProgressFill: {
    height: "100%",
    borderRadius: 8,
  },
  levelProgressText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  levelMilestones: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  levelMilestone: {
    alignItems: "center",
    flex: 1,
  },
  levelMilestoneDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  levelMilestoneText: {
    fontSize: 8,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 2,
  },
  levelMilestoneRange: {
    fontSize: 6,
    fontWeight: "500",
    textAlign: "center",
  },
  // Level Card Styles
  levelCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
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
  levelCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  levelIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  levelTextContainer: {
    flex: 1,
  },
  levelCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2C5530",
    marginBottom: 4,
  },
  levelCardSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
});
