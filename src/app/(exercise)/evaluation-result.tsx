import IncompleteExerciseModal from "@/components/modal/IncompleteExerciseModal";
import CustomScrollView from "@/components/refresh/CustomScrollView";
import { responsiveSize } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EvaluationResultScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const passageId = params.passageId as string;
  const passageTitle = params.passageTitle as string;
  const categoryId = params.categoryId as string;

  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pitchData, setPitchData] = useState<number[]>([]);
  const [animatedVoiceScore, setAnimatedVoiceScore] = useState(0);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);

  // Animation values
  const gaugeAnimation = useState(new Animated.Value(0))[0];
  const speedAnimation = useState(new Animated.Value(0))[0];
  const intonationAnimation = useState(new Animated.Value(0))[0];
  const voiceScoreAnimation = useState(new Animated.Value(0))[0];

  const loadAnalysisResult = useCallback(async () => {
    const generatePitchData = (result: any) => {
      // Generate mock pitch data based on analysis result
      const basePitch = 100 + (result.metrics?.voiceScore || 70) * 0.5;
      const data = [];

      for (let i = 0; i <= 15; i++) {
        const variation = Math.sin(i * 0.5) * 20 + Math.random() * 10;
        data.push(Math.max(70, Math.min(160, basePitch + variation)));
      }

      setPitchData(data);
    };

    const animateResults = (result: any) => {
      const metrics = result.metrics || {};

      // Animate voice score (0-100 scale)
      Animated.timing(voiceScoreAnimation, {
        toValue: metrics.voiceScore || 70,
        duration: 2000,
        useNativeDriver: false,
      }).start();

      // Update animated voice score for display
      const listener = voiceScoreAnimation.addListener(({ value }) => {
        setAnimatedVoiceScore(Math.round(value));
      });

      // Clean up listener after animation
      setTimeout(() => {
        voiceScoreAnimation.removeListener(listener);
      }, 2000);

      // Animate gauge (0-100 scale)
      Animated.timing(gaugeAnimation, {
        toValue: metrics.voiceScore || 70,
        duration: 1500,
        useNativeDriver: false,
      }).start();

      // Animate speed progress (0-1 scale)
      Animated.timing(speedAnimation, {
        toValue: Math.min(1, (metrics.spm || 120) / 150),
        duration: 1200,
        useNativeDriver: false,
      }).start();

      // Animate intonation progress (0-1 scale)
      Animated.timing(intonationAnimation, {
        toValue: Math.min(1, (metrics.voiceScore || 70) / 100),
        duration: 1000,
        useNativeDriver: false,
      }).start();
    };

    try {
      const result = await AsyncStorage.getItem("voiceAnalysisResult");
      if (result) {
        const parsedResult = JSON.parse(result);
        setAnalysisResult(parsedResult);
        generatePitchData(parsedResult);
        animateResults(parsedResult);

        // Check if score is below 80 and show modal
        const voiceScore = parsedResult.metrics?.voiceScore || 70;
        if (voiceScore < 80) {
          setShowIncompleteModal(true);
        }
      }
    } catch (error) {
      console.error("Error loading analysis result:", error);
    } finally {
      setLoading(false);
    }
  }, [
    gaugeAnimation,
    speedAnimation,
    intonationAnimation,
    voiceScoreAnimation,
  ]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAnalysisResult();
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  }, [loadAnalysisResult]);

  const handleRetry = useCallback(() => {
    setShowIncompleteModal(false);
    if (passageId) {
      router.push(
        `/passage-detail?id=${passageId}&title=${encodeURIComponent(
          passageTitle || ""
        )}&categoryId=${categoryId || "1"}`
      );
    } else {
      router.back();
    }
  }, [passageId, passageTitle, categoryId]);

  const handleBackToCategory = useCallback(() => {
    setShowIncompleteModal(false);
    if (categoryId) {
      router.push(`/reading?categoryId=${categoryId}`);
    } else {
      router.push("/categories");
    }
  }, [categoryId]);

  const handleCloseModal = useCallback(() => {
    setShowIncompleteModal(false);
  }, []);

  useEffect(() => {
    loadAnalysisResult();
  }, [loadAnalysisResult]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text style={styles.loadingText}>Đang tải kết quả...</Text>
      </View>
    );
  }

  if (!analysisResult) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Không tìm thấy kết quả đánh giá</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  const metrics = analysisResult.metrics || {};
  const voiceScore = metrics.voiceScore || 70;
  const speed = metrics.spm || 120;
  const intonation = voiceScore; // Use voice score as intonation for now

  return (
    <>
      <IncompleteExerciseModal
        visible={showIncompleteModal}
        score={animatedVoiceScore}
        onRetry={handleRetry}
        onBackToCategory={handleBackToCategory}
        onClose={handleCloseModal}
      />
      <CustomScrollView
        style={styles.container}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        <View style={[styles.content, { paddingTop: insets.top + 16 }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>ĐÁNH GIÁ</Text>
          </View>

          {/* Voice Score Section */}
          <View style={styles.voiceScoreSection}>
            <View style={styles.voiceScoreCard}>
              <Text style={styles.voiceScoreLabel}>Điểm tổng thể</Text>
              <Text style={styles.voiceScoreValue}>{animatedVoiceScore}</Text>
              <View style={styles.voiceScoreBar}>
                <Animated.View
                  style={[
                    styles.voiceScoreFill,
                    {
                      width: voiceScoreAnimation.interpolate({
                        inputRange: [0, 100],
                        outputRange: ["0%", "100%"],
                        extrapolate: "clamp",
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.voiceScoreDescription}>
                {animatedVoiceScore >= 80
                  ? "Xuất sắc! Phát âm của bạn rất tốt."
                  : animatedVoiceScore >= 60
                  ? "Tốt! Hãy tiếp tục luyện tập để cải thiện thêm."
                  : animatedVoiceScore >= 40
                  ? "Khá tốt! Cần luyện tập thêm để đạt kết quả tốt hơn."
                  : "Cần cải thiện! Hãy luyện tập thường xuyên để nâng cao kỹ năng phát âm."}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => {
                if (passageId) {
                  router.push(
                    `/passage-detail?id=${passageId}&title=${encodeURIComponent(
                      passageTitle || ""
                    )}&categoryId=1`
                  );
                } else {
                  router.back();
                }
              }}
            >
              <Text style={styles.secondaryButtonText}>Làm lại nào!</Text>
            </Pressable>

            <Pressable
              style={styles.primaryButton}
              onPress={() =>
                router.push(`/categories?selectedCategory=${categoryId}`)
              }
            >
              <Text style={styles.primaryButtonText}>Tiếp tục</Text>
            </Pressable>
          </View>

          {/* Speed Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tốc độ</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: speedAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [
                          "0%",
                          `${Math.min(100, (speed / 150) * 100)}%`,
                        ],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressValue}>{speed}</Text>
            </View>

            {/* Speed Gauge */}
            <View style={styles.speedGaugeContainer}>
              <View style={styles.speedGauge}>
                {/* Gauge Background Circle */}
                <View style={styles.speedGaugeCircle}>
                  {/* Blue segment (0-30) - bottom left */}
                  <View
                    style={[styles.speedGaugeSegment, styles.speedGaugeBlue]}
                  />
                  {/* Green segment (30-70) - top */}
                  <View
                    style={[styles.speedGaugeSegment, styles.speedGaugeGreen]}
                  />
                  {/* Red segment (70-100) - bottom right */}
                  <View
                    style={[styles.speedGaugeSegment, styles.speedGaugeRed]}
                  />
                </View>

                {/* Needle */}
                <Animated.View
                  style={[
                    styles.speedNeedle,
                    {
                      transform: [
                        {
                          rotate: speedAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["-135deg", "135deg"],
                          }),
                        },
                      ],
                    },
                  ]}
                />

                {/* Center dot */}
                <View style={styles.speedCenterDot} />

                {/* Value Labels on gauge */}
                <Text style={styles.speedLabelLeft}>0</Text>
                <Text style={styles.speedLabelBottomRight}>30</Text>
                <Text style={styles.speedLabelTop}>70</Text>
                <Text style={styles.speedLabelTopRight}>100</Text>

                {/* Description Labels below gauge */}
                <Text style={styles.speedDescLeft}>too slow</Text>
                <Text style={styles.speedDescRight}>too fast</Text>
              </View>
            </View>
          </View>

          {/* Ngữ điệu Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ngữ điệu</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: intonationAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", `${Math.min(100, intonation)}%`],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressValue}>{intonation}</Text>
            </View>
          </View>

          {/* Pitch Chart */}
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Pitch(Hz)</Text>
            <View style={styles.chartContainer}>
              {/* Y-axis labels */}
              <View style={styles.yAxis}>
                <Text style={styles.yAxisLabel}>160</Text>
                <Text style={styles.yAxisLabel}>130</Text>
                <Text style={styles.yAxisLabel}>100</Text>
                <Text style={styles.yAxisLabel}>70</Text>
                <Text style={styles.yAxisLabel}>0</Text>
              </View>

              {/* Chart area */}
              <View style={styles.chartArea}>
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <View key={i} style={[styles.gridLine, { top: i * 20 }]} />
                ))}

                {/* Pitch line */}
                <View style={styles.pitchLine}>
                  {pitchData.map((value, index) => {
                    const x = (index / (pitchData.length - 1)) * 100;
                    const y = ((160 - value) / 160) * 100;
                    return (
                      <View
                        key={index}
                        style={[
                          styles.pitchPoint,
                          {
                            left: `${x}%`,
                            top: `${y}%`,
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              </View>

              {/* X-axis labels */}
              <View style={styles.xAxis}>
                <Text style={styles.xAxisLabel}>0</Text>
                <Text style={styles.xAxisLabel}>5</Text>
                <Text style={styles.xAxisLabel}>10</Text>
                <Text style={styles.xAxisLabel}>15</Text>
              </View>
            </View>
            <Text style={styles.xAxisTitle}>Time(s)</Text>
          </View>

          {/* Năng lượng Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Năng lượng</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: intonationAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", `${Math.min(100, 55)}%`],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressValue}>55</Text>
            </View>

            {/* Energy Chart */}
            <View style={styles.energyChartSection}>
              <View style={styles.energyChartContainer}>
                {/* Legend */}
                <View style={styles.energyLegend}>
                  <View style={styles.energyLegendItem}>
                    <View
                      style={[
                        styles.energyLegendDot,
                        { backgroundColor: "#00BFFF" },
                      ]}
                    />
                    <Text style={styles.energyLegendText}>energetic</Text>
                  </View>
                  <View style={styles.energyLegendItem}>
                    <View
                      style={[
                        styles.energyLegendDot,
                        { backgroundColor: "#FFD700" },
                      ]}
                    />
                    <Text style={styles.energyLegendText}>monotone</Text>
                  </View>
                </View>

                {/* Chart */}
                <View style={styles.energyChart}>
                  {/* Y-axis labels */}
                  <View style={styles.energyYAxis}>
                    <Text style={styles.energyYAxisLabel}>100</Text>
                    <Text style={styles.energyYAxisLabel}>80</Text>
                    <Text style={styles.energyYAxisLabel}>60</Text>
                    <Text style={styles.energyYAxisLabel}>40</Text>
                    <Text style={styles.energyYAxisLabel}>20</Text>
                    <Text style={styles.energyYAxisLabel}>0</Text>
                  </View>

                  {/* Chart area */}
                  <View style={styles.energyChartArea}>
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <View
                        key={i}
                        style={[styles.energyGridLine, { top: i * 20 }]}
                      />
                    ))}

                    {/* Energy areas - stacked */}
                    <View style={styles.energyAreas}>
                      <View style={styles.energeticArea} />
                      <View style={styles.monotoneArea} />
                    </View>
                  </View>

                  {/* X-axis labels */}
                  <View style={styles.energyXAxis}>
                    <Text style={styles.energyXAxisLabel}>0</Text>
                    <Text style={styles.energyXAxisLabel}>5</Text>
                    <Text style={styles.energyXAxisLabel}>10</Text>
                    <Text style={styles.energyXAxisLabel}>15</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.xAxisTitle}>Time(s)</Text>
            </View>
          </View>

          {/* Phát âm Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phát âm</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: intonationAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", `${Math.min(100, 25)}%`],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressValue}>25</Text>
            </View>

            {/* Pronunciation Rubric Chart */}
            <View style={styles.pronunciationChartSection}>
              <Text style={styles.pronunciationChartTitle}>Rubric</Text>
              <View style={styles.pronunciationChartContainer}>
                {/* Y-axis labels */}
                <View style={styles.pronunciationYAxis}>
                  <Text style={styles.pronunciationYAxisLabel}>5</Text>
                  <Text style={styles.pronunciationYAxisLabel}>4</Text>
                  <Text style={styles.pronunciationYAxisLabel}>3</Text>
                  <Text style={styles.pronunciationYAxisLabel}>2</Text>
                  <Text style={styles.pronunciationYAxisLabel}>1</Text>
                  <Text style={styles.pronunciationYAxisLabel}>0</Text>
                </View>

                {/* Chart area */}
                <View style={styles.pronunciationChartArea}>
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <View
                      key={i}
                      style={[styles.pronunciationGridLine, { top: i * 20 }]}
                    />
                  ))}

                  {/* Bars */}
                  <View style={styles.pronunciationBars}>
                    {/* Phonemes bar */}
                    <View style={styles.pronunciationBarWrapper}>
                      <View
                        style={[styles.pronunciationBar, { height: "50%" }]}
                      />
                    </View>
                    {/* Word Stress bar */}
                    <View style={styles.pronunciationBarWrapper}>
                      <View
                        style={[styles.pronunciationBar, { height: "56%" }]}
                      />
                    </View>
                    {/* Sentence Stress bar */}
                    <View style={styles.pronunciationBarWrapper}>
                      <View
                        style={[styles.pronunciationBar, { height: "64%" }]}
                      />
                    </View>
                    {/* Clarity bar */}
                    <View style={styles.pronunciationBarWrapper}>
                      <View
                        style={[styles.pronunciationBar, { height: "30%" }]}
                      />
                    </View>
                  </View>
                </View>

                {/* X-axis labels */}
                <View style={styles.pronunciationXAxis}>
                  <Text style={styles.pronunciationXAxisLabel}>Phonemes</Text>
                  <Text style={styles.pronunciationXAxisLabel}>
                    Word Stress
                  </Text>
                  <Text style={styles.pronunciationXAxisLabel}>
                    Sentence{"\n"}Stress
                  </Text>
                  <Text style={styles.pronunciationXAxisLabel}>Clarity</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bottom spacing */}
          <View style={{ height: 50 }} />
        </View>
      </CustomScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#00BFFF",
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#00BFFF",
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000000",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  // Voice Score Section
  voiceScoreSection: {
    marginBottom: 24,
  },
  voiceScoreCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  voiceScoreLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  voiceScoreValue: {
    fontSize: 48,
    fontWeight: "800",
    color: "#00BFFF",
    marginBottom: 16,
  },
  voiceScoreBar: {
    width: "100%",
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    marginBottom: 16,
    overflow: "hidden",
  },
  voiceScoreFill: {
    height: "100%",
    backgroundColor: "#00BFFF",
    borderRadius: 6,
  },
  voiceScoreDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#000000",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "600",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#00BFFF",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 24,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 12,
    backgroundColor: "#00BFFF",
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    minWidth: 32,
    textAlign: "right",
  },
  // Speed Gauge Styles
  speedGaugeContainer: {
    alignItems: "center",
    marginTop: responsiveSize(16),
    marginBottom: responsiveSize(24),
    paddingVertical: responsiveSize(20),
  },
  speedGauge: {
    width: responsiveSize(280),
    height: responsiveSize(180),
    position: "relative",
  },
  speedGaugeCircle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 20,
    borderColor: "transparent",
    top: 40,
  },
  speedGaugeSegment: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 20,
    borderColor: "transparent",
  },
  speedGaugeBlue: {
    borderLeftColor: "#3B82F6",
    borderBottomColor: "#3B82F6",
    transform: [{ rotate: "-45deg" }],
  },
  speedGaugeGreen: {
    borderTopColor: "#10B981",
    borderLeftColor: "#10B981",
    borderRightColor: "#10B981",
    transform: [{ rotate: "0deg" }],
  },
  speedGaugeRed: {
    borderRightColor: "#EF4444",
    borderBottomColor: "#EF4444",
    transform: [{ rotate: "45deg" }],
  },
  speedNeedle: {
    position: "absolute",
    width: 4,
    height: 90,
    backgroundColor: "#000000",
    borderRadius: 2,
    top: 50,
    transformOrigin: "bottom center",
  },
  speedCenterDot: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#000000",
    top: 132,
  },
  speedLabelLeft: {
    position: "absolute",
    left: 20,
    top: 130,
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "700",
  },
  speedLabelBottomRight: {
    position: "absolute",
    right: 20,
    top: 130,
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "700",
  },
  speedLabelTop: {
    position: "absolute",
    top: 10,
    left: "50%",
    transform: [{ translateX: -12 }],
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "700",
  },
  speedLabelTopRight: {
    position: "absolute",
    top: 35,
    right: 12,
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "700",
  },
  speedDescLeft: {
    position: "absolute",
    bottom: 0,
    left: 10,
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  speedDescRight: {
    position: "absolute",
    bottom: 0,
    right: 10,
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  // Chart Styles
  chartSection: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  chartContainer: {
    flexDirection: "row",
    height: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  yAxis: {
    width: 32,
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginRight: 8,
    paddingTop: 2,
    paddingBottom: 2,
  },
  yAxisLabel: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  chartArea: {
    flex: 1,
    position: "relative",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  pitchLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pitchPoint: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#00BFFF",
  },
  xAxis: {
    position: "absolute",
    bottom: -22,
    left: 32,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  xAxisLabel: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  xAxisTitle: {
    fontSize: 10,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 24,
  },
  // Energy Chart Styles
  energyChartSection: {
    marginTop: 16,
  },
  energyChartContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  energyLegend: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 12,
    gap: 16,
  },
  energyLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  energyLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  energyLegendText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  energyChart: {
    flexDirection: "row",
    height: 120,
  },
  energyYAxis: {
    width: 32,
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginRight: 8,
    paddingTop: 2,
    paddingBottom: 2,
  },
  energyYAxisLabel: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  energyChartArea: {
    flex: 1,
    position: "relative",
  },
  energyGridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  energyAreas: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "column-reverse",
  },
  energeticArea: {
    height: "60%",
    backgroundColor: "#00BFFF",
    opacity: 0.5,
  },
  monotoneArea: {
    height: "40%",
    backgroundColor: "#FFD700",
    opacity: 0.5,
  },
  energyXAxis: {
    position: "absolute",
    bottom: -22,
    left: 32,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  energyXAxisLabel: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  // Pronunciation Chart Styles
  pronunciationChartSection: {
    marginTop: 16,
  },
  pronunciationChartTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  pronunciationChartContainer: {
    flexDirection: "row",
    height: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pronunciationYAxis: {
    width: 32,
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginRight: 8,
    paddingTop: 2,
    paddingBottom: 2,
  },
  pronunciationYAxisLabel: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  pronunciationChartArea: {
    flex: 1,
    position: "relative",
  },
  pronunciationGridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  pronunciationBars: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    gap: 8,
  },
  pronunciationBarWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  pronunciationBar: {
    width: "100%",
    backgroundColor: "#00BFFF",
    borderRadius: 4,
  },
  pronunciationXAxis: {
    position: "absolute",
    bottom: -32,
    left: 32,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  pronunciationXAxisLabel: {
    flex: 1,
    fontSize: 9,
    color: "#6B7280",
    textAlign: "center",
  },
});
