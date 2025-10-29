import {
  analyzeVoiceAPI,
  createVoiceTestAPI,
  getReadingPassageByIdAPI,
  testVoiceTestAPI,
} from "@/app/utils/apiall";
import { useMascotManager } from "@/components/mascotWithBubble/MascotManager";
import MascotWithBubble from "@/components/mascotWithBubble/mascotWithBubble";
import { AIAnalysisLoadingPopup, RecordingListModal } from "@/components/modal";
import CustomScrollView from "@/components/refresh/CustomScrollView";
import VoiceRecorder from "@/components/voiceRecorder/VoiceRecorder";
import { useRecordings } from "@/hooks/useRecordings";
import { responsiveSize, responsiveSpacing } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Toast from "react-native-root-toast";

// Interface cho Reading Passage
interface ReadingPassage {
  id: number;
  title: string;
  content: string;
  level: string;
  createdAt: string;
  category: {
    id: number;
    name: string;
    description: string;
  };
}

export default function PassageDetailScreen() {
  const params = useLocalSearchParams();
  const passageId = params.id as string;
  const passageTitle = params.title as string;
  const categoryId = params.categoryId as string;
  const assessmentId = params.assessmentId as string;
  const assessmentTitle = params.assessmentTitle as string;
  const assessmentLevel = params.assessmentLevel as string;
  const isAssessment = params.isAssessment === "true";
  const { getMascotByType } = useMascotManager();
  const { recordings, addRecording, deleteRecording } = useRecordings();
  const { width: screenWidth } = useWindowDimensions();

  const [passage, setPassage] = useState<ReadingPassage | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRecordingsModal, setShowRecordingsModal] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [creatingVoiceTest, setCreatingVoiceTest] = useState(false);
  const [voiceTestCreated, setVoiceTestCreated] = useState(false);
  const [currentAudioUri, setCurrentAudioUri] = useState<string | null>(null);

  console.log("🔍 PassageDetailScreen params:", params);
  console.log("🔍 passageId:", passageId);
  console.log("🔍 passageTitle:", passageTitle);
  console.log("🔍 categoryId:", categoryId);
  console.log("🔍 assessmentId:", assessmentId);
  console.log("🔍 assessmentTitle:", assessmentTitle);
  console.log("🔍 assessmentLevel:", assessmentLevel);
  console.log("🔍 isAssessment:", isAssessment);

  const fetchPassage = useCallback(async () => {
    if (!passageId) {
      console.log("❌ No passageId provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("📚 Fetching reading passage by ID:", passageId);

      const response = await getReadingPassageByIdAPI(parseInt(passageId));
      console.log("📚 Reading passage response:", response);

      if (response && (response as any).id) {
        setPassage(response as any as ReadingPassage);
        console.log("📚 Found passage:", response);
      } else {
        console.log("❌ Passage not found with id:", passageId);
        Toast.show("Không tìm thấy bài đọc!", {
          position: Toast.positions.TOP,
        });
      }
    } catch (error: any) {
      console.error("❌ Error fetching passage:", error);
      Toast.show("Không thể tải bài đọc. Vui lòng thử lại!", {
        position: Toast.positions.TOP,
      });
    } finally {
      setLoading(false);
    }
  }, [passageId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchPassage();
    } catch (error) {
      console.error("Error refreshing passage:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchPassage]);

  useEffect(() => {
    if (passageId) {
      fetchPassage();
    }
  }, [passageId, fetchPassage]);

  // Responsive calculations
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 768;
  const isTablet = screenWidth >= 768;

  const responsiveMicSize = isSmallScreen
    ? 35
    : isMediumScreen
    ? 40
    : isTablet
    ? 50
    : 45;

  const handleRecordingStart = () => {
    console.log("Recording started");
  };

  const handleRecordingStop = async (uri: string) => {
    console.log("🎤 Recording stopped, URI:", uri);
    console.log("🎤 Setting currentAudioUri to:", uri);
    setCurrentAudioUri(uri); // Lưu audio URI để sử dụng trong createVoiceTest
    console.log("🎤 Current audio URI set, proceeding with analysis...");

    // Verify URI is set
    setTimeout(() => {
      console.log(
        "🎤 Verifying currentAudioUri after setState:",
        currentAudioUri
      );
    }, 100);

    await addRecording(uri);
    await analyzeRecording(uri);
  };

  const analyzeRecording = async (audioUri: string) => {
    try {
      setAnalyzing(true);
      setError(null);
      console.log("🎤 Analyzing recording:", audioUri);

      const audioFile = {
        uri: audioUri,
        type: "audio/mp3",
        name: `recording_${Date.now()}.mp3`,
      };

      const response = await analyzeVoiceAPI(audioFile);
      console.log("🎤 Analysis response:", response);

      if (response) {
        setAnalysisResult(response as any);
        console.log(
          "🎤 Analysis completed:",
          (response as any).metrics?.voiceScore
        );

        // Lưu kết quả phân tích vào AsyncStorage
        try {
          await AsyncStorage.setItem(
            "voiceAnalysisResult",
            JSON.stringify(response)
          );
          console.log("💾 Voice analysis result saved to storage");
        } catch (storageError) {
          console.warn(
            "⚠️ Failed to save analysis result to storage:",
            storageError
          );
        }

        // Tạo voice test sau khi phân tích thành công - truyền audioUri trực tiếp
        await createVoiceTest(response as any, audioUri);

        // Tự động chuyển sang trang evaluation-result sau khi phân tích xong
        setTimeout(() => {
          router.push(
            `/evaluation-result?passageId=${passageId}&passageTitle=${encodeURIComponent(
              passageTitle || ""
            )}`
          );
        }, 1000); // Delay 1 giây để user thấy kết quả
      }
    } catch (err) {
      console.error("❌ Error analyzing recording:", err);
      setError("Không thể phân tích giọng nói");
    } finally {
      setAnalyzing(false);
    }
  };

  const createVoiceTest = async (analysisResult: any, audioUri?: string) => {
    try {
      setCreatingVoiceTest(true);
      console.log("🎯 Creating voice test...");
      console.log("🎯 Audio URI parameter:", audioUri);
      console.log("🎯 Current audio URI state:", currentAudioUri);

      // Lấy userId từ AsyncStorage
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.error("❌ No userId found for voice test");
        Toast.show("Không tìm thấy thông tin người dùng!", {
          position: Toast.positions.TOP,
        });
        return;
      }

      // Chuẩn bị dữ liệu voice test với file audio
      const voiceTestData = {
        cerRatio: analysisResult.metrics?.cerRatio || 0.12,
        spm: analysisResult.metrics?.spm || 150,
        pauseRatio: analysisResult.metrics?.pauseRatio || 0.28,
        mptSeconds: analysisResult.metrics?.mptSeconds || 9,
        finalConsonantAccuracy:
          analysisResult.metrics?.finalConsonantAccuracy ?? 0.67, // Sử dụng ?? để handle null
        passageId: parseInt(passageId),
        voiceScore: analysisResult.metrics?.voiceScore || 85,
        level: "L1", // Sử dụng format cố định L1 thay vì BEGINNER
        userId: parseInt(userId),
        // Thêm file audio nếu có - ưu tiên audioUri parameter
        audio:
          audioUri || currentAudioUri
            ? {
                uri: (audioUri || currentAudioUri)!,
                type: "audio/mp3",
                name: `recording_${Date.now()}.mp3`,
              }
            : undefined,
      };

      console.log("🎯 Voice test data:", voiceTestData);

      // Test API trước
      try {
        console.log("🧪 Testing API with minimal data...");
        await testVoiceTestAPI();
        console.log("✅ Test API successful");
      } catch (testError) {
        console.error("❌ Test API failed:", testError);
      }

      // Gọi API tạo voice test với multipart/form-data
      const response = await createVoiceTestAPI(voiceTestData);
      console.log("🎯 Voice test created:", response);

      setVoiceTestCreated(true);
      Toast.show("Đã tạo bài test giọng thành công!", {
        position: Toast.positions.TOP,
      });
    } catch (error: any) {
      console.error("❌ Error creating voice test:", error);
      console.error("❌ Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        },
      });

      // Log chi tiết server response
      if (error.response?.data) {
        console.error(
          "❌ Server response data:",
          JSON.stringify(error.response.data, null, 2)
        );
      }

      // Thử lại không có file audio nếu có lỗi
      if (audioUri || currentAudioUri) {
        console.log("🔄 Retrying without audio file...");
        try {
          const retryData = {
            cerRatio: analysisResult.metrics?.cerRatio || 0.12,
            spm: analysisResult.metrics?.spm || 150,
            pauseRatio: analysisResult.metrics?.pauseRatio || 0.28,
            mptSeconds: analysisResult.metrics?.mptSeconds || 9,
            finalConsonantAccuracy:
              analysisResult.metrics?.finalConsonantAccuracy ?? 0.67, // Sử dụng ?? để handle null
            passageId: parseInt(passageId),
            voiceScore: analysisResult.metrics?.voiceScore || 85,
            level: "L1", // Sử dụng format cố định L1
            userId: parseInt((await AsyncStorage.getItem("userId")) || "0"),
            audio: undefined,
          };
          const retryResponse = await createVoiceTestAPI(retryData);
          console.log("🎯 Voice test created (without audio):", retryResponse);
          setVoiceTestCreated(true);
          Toast.show("Đã tạo bài test giọng thành công (không có audio)!", {
            position: Toast.positions.TOP,
          });
          return;
        } catch (retryError) {
          console.error("❌ Retry also failed:", retryError);
        }
      }

      Toast.show("Không thể tạo bài test giọng. Vui lòng thử lại!", {
        position: Toast.positions.TOP,
      });
    } finally {
      setCreatingVoiceTest(false);
    }
  };

  const handleShowRecordings = () => {
    setShowRecordingsModal(true);
  };

  const handleCloseRecordings = () => {
    setShowRecordingsModal(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2AA0FF" />
        <Text style={styles.loadingText}>Đang tải bài đọc...</Text>
      </View>
    );
  }

  if (!passage) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.loadingText}>Không tìm thấy bài đọc</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <CustomScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: responsiveSpacing(120) }}
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
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
          <Text style={styles.headerTitle}>{passage.title}</Text>
          {isAssessment && assessmentTitle && (
            <Text style={styles.assessmentSubtitle}>
              {decodeURIComponent(assessmentTitle)} • {assessmentLevel}
            </Text>
          )}
        </View>
        <View style={styles.headerButtons}>
          <Pressable
            onPress={() =>
              router.push(
                `/voice-test-history?passageId=${passageId}&passageTitle=${encodeURIComponent(
                  passageTitle || ""
                )}`
              )
            }
            style={({ pressed }) => [
              styles.historyButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons
              name="time-outline"
              size={isTablet ? 28 : 24}
              color="#FF9800"
            />
          </Pressable>
          <Pressable
            onPress={handleShowRecordings}
            style={({ pressed }) => [
              styles.recordingsButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="list" size={isTablet ? 28 : 24} color="#3AA1E0" />
            {recordings.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{recordings.length}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/*     
        <View style={styles.wordSection}>
          <Text style={styles.mainWord}>{passage.title}</Text>
        </View> */}

        <View style={styles.mascotContainer}>
          <MascotWithBubble
            message="Hãy đọc kỹ bài này và chú ý đến cách phát âm nhé! Sau đó bấm vào micro để luyện tập phát âm! 🎯"
            mascotSource={getMascotByType("longlanh").source}
            containerStyle={StyleSheet.absoluteFill}
            mascotWidth={responsiveSize(130)}
            mascotHeight={responsiveSize(130)}
            mascotPosition={{
              left: responsiveSize(-15),
              bottom: responsiveSize(170),
            }}
            bubblePosition={{
              left: responsiveSize(100),
              top: responsiveSize(-120),
            }}
            bubbleStyle={{
              height: responsiveSize(130),
              width: responsiveSize(240),
            }}
            bgColor={
              getMascotByType("longlanh").recommendedBubbleColor?.bgColor
            }
            borderColor={
              getMascotByType("longlanh").recommendedBubbleColor?.borderColor
            }
            responsive={true}
          />
        </View>

        {/* Reading Passage Content */}
        <View style={styles.passageContainer}>
          <Text style={styles.passageText}>{passage.content}</Text>
        </View>

        {/* Mascot Reading Guide - giống introLayout */}

        {/* Pronunciation Guide */}
        {/* <View style={styles.pronunciationBox}>
          <View style={styles.pronunciationContent}>
          
            <View style={styles.diagramContainer}>
              <View style={styles.mouthDiagram}>
                <View style={styles.tongueLine} />
                <View style={styles.mouthOutline} />
              </View>
            </View>
            
           
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsText}>
                Mở miệng - đầu lưỡi chạm lợi trên (&quot;n&quot;) - môi tròn (&quot;o&quot;) - kéo môi lại, nâng lưỡi (&quot;i&quot;) - kết thúc bằng giọng lên cao.
              </Text>
            </View>
          </View>
        </View> */}

        {/* Voice Recording Section */}
        <View style={styles.voiceRecordingSection}>
          <VoiceRecorder
            onRecordingStart={handleRecordingStart}
            onRecordingStop={handleRecordingStop}
            micButtonSize={responsiveMicSize}
            micButtonColor="#58BDF8"
            micButtonActiveColor="#fff"
            showStatusText={true}
          />
        </View>

        {/* AI Analysis Loading Popup */}
        <AIAnalysisLoadingPopup
          visible={analyzing}
          title="AI đang phân tích giọng nói"
          subtitle="Vui lòng chờ trong giây lát..."
          mascotType="longlanh"
        />

        {creatingVoiceTest && (
          <View style={styles.analyzingContainer}>
            <ActivityIndicator size="small" color="#10B981" />
            <Text style={styles.analyzingText}>Đang tạo bài test giọng...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {analysisResult && analysisResult.status === "success" && (
          <View style={styles.completionContainer}>
            <Text style={styles.completionTitle}>✅ Hoàn thành bài đọc!</Text>

            <Text style={styles.completionSubtitle}>
              Giọng nói của bạn đã được phân tích thành công
            </Text>

            {voiceTestCreated && (
              <Text style={styles.completionDescription}>
                ✅ Đã tạo bài test giọng thành công!
              </Text>
            )}

            <Text style={styles.completionDescription}>
              Nhấn &quot;Xem kết quả&quot; để xem đánh giá chi tiết
            </Text>

            <Pressable
              style={styles.viewResultButton}
              onPress={() => {
                router.push(
                  `/evaluation-result?passageId=${passageId}&passageTitle=${encodeURIComponent(
                    passageTitle || ""
                  )}`
                );
              }}
            >
              <Text style={styles.viewResultButtonText}>Xem kết quả</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        )}
      </View>

      <RecordingListModal
        visible={showRecordingsModal}
        onClose={handleCloseRecordings}
        recordings={recordings}
        onDeleteRecording={deleteRecording}
      />
    </CustomScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: responsiveSpacing(40),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  backButtonText: {
    fontSize: 16,
    color: "#2AA0FF",
    fontWeight: "600",
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#2AA0FF",
    borderRadius: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
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
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#123E2D",
  },
  assessmentSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2FA6F3",
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  wordSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  mainWord: {
    fontSize: 32,
    fontWeight: "800",
    color: "#2AA0FF",
    marginBottom: 8,
  },
  passageContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  passageText: {
    fontSize: 18,
    lineHeight: 28,
    color: "#4B5563",
    textAlign: "left",
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  pronunciationBox: {
    backgroundColor: "#F0F9FF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0F2FE",
    marginBottom: 60,
    padding: 20,
  },
  pronunciationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  diagramContainer: {
    width: 120,
    height: 100,
    marginRight: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  mouthDiagram: {
    width: 80,
    height: 60,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  mouthOutline: {
    width: 60,
    height: 40,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#9CA3AF",
    backgroundColor: "transparent",
  },
  tongueLine: {
    position: "absolute",
    width: 40,
    height: 3,
    backgroundColor: "#EF4444",
    borderRadius: 2,
    top: 20,
    left: 20,
  },
  instructionsContainer: {
    flex: 1,
  },
  instructionsText: {
    fontSize: 16,
    color: "#1F2937",
    lineHeight: 24,
    fontWeight: "500",
  },
  voiceRecordingSection: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsiveSpacing(8),
  },
  historyButton: {
    position: "relative",
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#FFF3E0",
    borderWidth: 1,
    borderColor: "#FFCC80",
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  recordingsButton: {
    position: "relative",
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F0F8FF",
    borderWidth: 1,
    borderColor: "#B3D9FF",
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  mascotContainer: {
    flex: 1,
    position: "relative",
    width: "100%",
    height: 180,
    marginTop: 100,
  },
  // Analysis Results Styles
  analyzingContainer: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: responsiveSpacing(160),
  },
  analyzingText: {
    color: "#3AA1E0",
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginHorizontal: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  errorText: {
    color: "#F44336",
    fontSize: 14,
    textAlign: "center",
  },
  completionContainer: {
    backgroundColor: "#E8F5E8",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: responsiveSpacing(100),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 8,
  },
  completionSubtitle: {
    fontSize: 16,
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 12,
  },
  completionDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 20,
  },
  viewResultButton: {
    backgroundColor: "#2FA6F3",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#2FA6F3",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  viewResultButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
