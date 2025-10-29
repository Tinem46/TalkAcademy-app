import { getVoiceTestHistoryAPI } from "@/app/utils/apiall";
import VoiceTestStatsCard from "@/components/card/VoiceTestStatsCard";
import { useMascotManager } from "@/components/mascotWithBubble/MascotManager";
import MascotWithBubble from "@/components/mascotWithBubble/mascotWithBubble";
import CustomFlatList from "@/components/refresh/CustomFlatList";
import {
  responsiveFontSize,
  responsiveSize,
  responsiveSpacing,
} from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function VoiceTestHistoryScreen() {
  const params = useLocalSearchParams();
  const passageId = params.passageId as string;
  const passageTitle = params.passageTitle as string;
  const router = useRouter();
  const { getMascotByType } = useMascotManager();

  const [history, setHistory] = useState<VoiceTestHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Tính toán thống kê
  const stats = useMemo(() => {
    if (history.length === 0) {
      return {
        totalTests: 0,
        averageScore: 0,
        bestScore: 0,
        latestScore: undefined,
        improvement: undefined,
      };
    }

    const scores = history.map((item) => item.voiceScore);
    const totalTests = history.length;
    const averageScore =
      scores.reduce((sum, score) => sum + score, 0) / totalTests;
    const bestScore = Math.max(...scores);
    const latestScore = scores[0]; // Lần gần nhất (đã sort)
    const improvement = scores.length > 1 ? latestScore - scores[1] : undefined;

    return {
      totalTests,
      averageScore,
      bestScore,
      latestScore,
      improvement,
    };
  }, [history]);

  const fetchHistory = useCallback(async () => {
    try {
      setError(null);
      const response = await getVoiceTestHistoryAPI(parseInt(passageId));

      if (response && response.data) {
        setHistory(response.data as unknown as VoiceTestHistoryItem[]);
        console.log(
          "📚 Voice test history loaded:",
          (response.data as unknown as VoiceTestHistoryItem[]).length,
          "items"
        );
      } else {
        throw new Error("Failed to load history");
      }
    } catch (err: any) {
      console.error("❌ Error loading voice test history:", err);
      setError(err.message || "Không thể tải lịch sử voice test");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [passageId]);

  useEffect(() => {
    if (passageId) {
      fetchHistory();
    }
  }, [passageId, fetchHistory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory();
  }, [fetchHistory]);

  // Function để phát audio
  const playAudio = useCallback(
    async (audioUrl: string, createdAt: string) => {
      try {
        // Dừng audio hiện tại nếu có
        if (sound) {
          await sound.unloadAsync();
          setSound(null);
        }

        // Nếu đang phát cùng audio thì dừng
        if (playingAudio === createdAt) {
          setPlayingAudio(null);
          return;
        }

        console.log("🎵 Playing audio:", audioUrl);
        setPlayingAudio(createdAt);

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true }
        );

        setSound(newSound);

        // Lắng nghe khi audio kết thúc
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlayingAudio(null);
            newSound.unloadAsync();
            setSound(null);
          }
        });
      } catch (error) {
        console.error("❌ Error playing audio:", error);
        Alert.alert("Lỗi", "Không thể phát audio. Vui lòng thử lại.");
        setPlayingAudio(null);
      }
    },
    [sound, playingAudio]
  );

  // Cleanup audio khi component unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "#4CAF50"; // Green
    if (score >= 80) return "#8BC34A"; // Light Green
    if (score >= 70) return "#FFC107"; // Yellow
    if (score >= 60) return "#FF9800"; // Orange
    return "#F44336"; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Xuất sắc";
    if (score >= 80) return "Tốt";
    if (score >= 70) return "Khá";
    if (score >= 60) return "Trung bình";
    return "Cần cải thiện";
  };

  const renderHistoryItem = ({
    item,
    index,
  }: {
    item: VoiceTestHistoryItem;
    index: number;
  }) => (
    <View style={styles.historyItem}>
      <View style={styles.itemHeader}>
        <View style={styles.scoreContainer}>
          <Text
            style={[
              styles.scoreText,
              { color: getScoreColor(item.voiceScore) },
            ]}
          >
            {item.voiceScore}
          </Text>
          <Text style={styles.scoreLabel}>
            {getScoreLabel(item.voiceScore)}
          </Text>
        </View>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          <Text style={styles.levelText}>Level: {item.level}</Text>
        </View>
      </View>

      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Tốc độ nói</Text>
          <Text style={styles.metricValue}>{item.spm} từ/phút</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Tỷ lệ lỗi</Text>
          <Text style={styles.metricValue}>
            {(item.cerRatio * 100).toFixed(1)}%
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Tỷ lệ tạm dừng</Text>
          <Text style={styles.metricValue}>
            {(item.pauseRatio * 100).toFixed(1)}%
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Độ chính xác</Text>
          <Text style={styles.metricValue}>
            {(item.finalConsonantAccuracy * 100).toFixed(1)}%
          </Text>
        </View>
      </View>

      {item.audioUrl ? (
        <Pressable
          style={[
            styles.audioButton,
            playingAudio === item.createdAt && styles.audioButtonPlaying,
          ]}
          onPress={() => playAudio(item.audioUrl!, item.createdAt)}
        >
          <Ionicons
            name={
              playingAudio === item.createdAt
                ? "pause-circle"
                : "play-circle-outline"
            }
            size={responsiveSize(20)}
            color={playingAudio === item.createdAt ? "#FF6B6B" : "#3AA1E0"}
          />
          <Text
            style={[
              styles.audioButtonText,
              playingAudio === item.createdAt && styles.audioButtonTextPlaying,
            ]}
          >
            {playingAudio === item.createdAt ? "Đang phát..." : "Nghe lại"}
          </Text>
        </Pressable>
      ) : (
        <View style={styles.noAudioContainer}>
          <Ionicons
            name="volume-mute-outline"
            size={responsiveSize(16)}
            color="#999"
          />
          <Text style={styles.noAudioText}>Không có audio</Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MascotWithBubble
        message="Chưa có lịch sử voice test nào! Hãy bắt đầu luyện tập nhé! 🎤✨"
        mascotSource={getMascotByType("omg").source}
        containerStyle={styles.mascotContainer}
        mascotWidth={responsiveSize(120)}
        mascotHeight={responsiveSize(120)}
        mascotPosition={{
          left: responsiveSize(-20),
          bottom: responsiveSize(40),
        }}
        bubblePosition={{ left: responsiveSize(90), top: responsiveSize(80) }}
        bubbleStyle={{
          height: responsiveSize(100),
          width: responsiveSize(200),
        }}
        bgColor={getMascotByType("default").recommendedBubbleColor?.bgColor}
        borderColor={
          getMascotByType("default").recommendedBubbleColor?.borderColor
        }
        responsive={true}
      />
      <Text style={styles.emptyText}>Chưa có lịch sử voice test</Text>
      <Text style={styles.emptySubtext}>Hãy thực hiện bài test đầu tiên!</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3AA1E0" />
        <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={responsiveSize(24)}
            color="#2FA6F3"
          />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Lịch sử Voice Test</Text>
          {passageTitle && (
            <Text style={styles.headerSubtitle}>{passageTitle}</Text>
          )}
        </View>
        {/* <Pressable style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={responsiveSize(24)} color="#3AA1E0" />
        </Pressable> */}
      </View>

      {/* Content */}
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={responsiveSize(48)}
            color="#F44336"
          />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={fetchHistory}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </Pressable>
        </View>
      ) : (
        <CustomFlatList
          data={history}
          keyExtractor={(item: VoiceTestHistoryItem, index: number) =>
            `${item.createdAt}-${index}`
          }
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={renderEmptyState}
          ListHeaderComponent={
            history.length > 0 ? (
              <VoiceTestStatsCard
                totalTests={stats.totalTests}
                averageScore={stats.averageScore}
                bestScore={stats.bestScore}
                latestScore={stats.latestScore}
                improvement={stats.improvement}
              />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    marginTop: responsiveSpacing(40),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: responsiveSpacing(16),
    fontSize: responsiveFontSize(16),
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(16),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    padding: responsiveSpacing(8),
  },
  headerContent: {
    flex: 1,
    marginLeft: responsiveSpacing(12),
  },
  headerTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: "600",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: responsiveFontSize(14),
    color: "#666",
    marginTop: responsiveSpacing(2),
  },
  refreshButton: {
    padding: responsiveSpacing(8),
  },
  listContainer: {
    padding: responsiveSpacing(16),
  },
  historyItem: {
    backgroundColor: "#fff",
    borderRadius: responsiveSize(12),
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsiveSpacing(12),
  },
  scoreContainer: {
    alignItems: "center",
  },
  scoreText: {
    fontSize: responsiveFontSize(32),
    fontWeight: "700",
  },
  scoreLabel: {
    fontSize: responsiveFontSize(12),
    color: "#666",
    marginTop: responsiveSpacing(2),
  },
  dateContainer: {
    alignItems: "flex-end",
  },
  dateText: {
    fontSize: responsiveFontSize(12),
    color: "#666",
  },
  levelText: {
    fontSize: responsiveFontSize(12),
    color: "#3AA1E0",
    marginTop: responsiveSpacing(2),
  },
  metricsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricItem: {
    width: "48%",
    marginBottom: responsiveSpacing(8),
  },
  metricLabel: {
    fontSize: responsiveFontSize(12),
    color: "#666",
    marginBottom: responsiveSpacing(2),
  },
  metricValue: {
    fontSize: responsiveFontSize(14),
    fontWeight: "600",
    color: "#333",
  },
  audioButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(8),
    paddingHorizontal: responsiveSpacing(16),
    backgroundColor: "#E8F3FF",
    borderRadius: responsiveSize(20),
  },
  audioButtonPlaying: {
    backgroundColor: "#FFE8E8",
  },
  audioButtonText: {
    marginLeft: responsiveSpacing(8),
    fontSize: responsiveFontSize(14),
    color: "#3AA1E0",
    fontWeight: "500",
  },
  audioButtonTextPlaying: {
    color: "#FF6B6B",
  },
  noAudioContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(8),
    paddingHorizontal: responsiveSpacing(16),
    backgroundColor: "#F5F5F5",
    borderRadius: responsiveSize(20),
  },
  noAudioText: {
    marginLeft: responsiveSpacing(8),
    fontSize: responsiveFontSize(14),
    color: "#999",
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: responsiveSpacing(60),
  },
  mascotContainer: {
    marginBottom: responsiveSpacing(20),
  },
  emptyText: {
    fontSize: responsiveFontSize(18),
    fontWeight: "600",
    color: "#333",
    marginBottom: responsiveSpacing(8),
  },
  emptySubtext: {
    fontSize: responsiveFontSize(14),
    color: "#666",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveSpacing(40),
  },
  errorText: {
    fontSize: responsiveFontSize(16),
    color: "#F44336",
    textAlign: "center",
    marginVertical: responsiveSpacing(16),
  },
  retryButton: {
    backgroundColor: "#3AA1E0",
    paddingHorizontal: responsiveSpacing(24),
    paddingVertical: responsiveSpacing(12),
    borderRadius: responsiveSize(20),
  },
  retryButtonText: {
    color: "#fff",
    fontSize: responsiveFontSize(14),
    fontWeight: "600",
  },
});
