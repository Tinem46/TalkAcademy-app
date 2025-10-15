import { createVoiceTestAPI } from "@/app/utils/apiall";
import ShareButton from "@/components/button/share.button";
import ProgressBar from "@/components/onboarding/progressBar";
import { useOnboarding } from "@/context/onboarding.context";
import { saveOnboardingSurvey } from "@/utils/onboarding";
import { responsiveSpacing } from "@/utils/responsive";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Toast from "react-native-root-toast";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const rows = [
  { id: "speed", label: "Tốc độ", value: 0.35 },
  { id: "intonation", label: "Ngữ điệu", value: 0.7 },
  { id: "energy", label: "Năng lượng", value: 0.55 },
  { id: "pronunciation", label: "Phát âm", value: 0.2 },
];

const EvaluationScreen = ({ navigation }: any) => {
  const { surveyData } = useOnboarding();
  const [isSaving, setIsSaving] = useState(false);
  const [voiceAnalysisResult, setVoiceAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creatingVoiceTest, setCreatingVoiceTest] = useState(false);
  const [voiceTestCreated, setVoiceTestCreated] = useState(false);
  const insets = useSafeAreaInsets();

  // Load voice analysis result from AsyncStorage
  useEffect(() => {
    const loadAnalysisResult = async () => {
      try {
        const result = await AsyncStorage.getItem('voiceAnalysisResult');
        if (result) {
          const parsedResult = JSON.parse(result);
          setVoiceAnalysisResult(parsedResult);
          console.log('📊 Loaded voice analysis result:', parsedResult);
        } else {
          console.log('⚠️ No voice analysis result found');
        }
      } catch (error) {
        console.error('❌ Error loading voice analysis result:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalysisResult();
  }, []);

  // Convert voice analysis metrics to progress values
  const getProgressRows = () => {
    if (!voiceAnalysisResult?.metrics) {
      return rows; // Return default rows if no analysis result
    }

    const metrics = voiceAnalysisResult.metrics;
    
    // Convert metrics to progress values (0-1)
    const speedProgress = Math.min(metrics.spm / 150, 1); // Normalize SPM (0-150)
    const pronunciationProgress = Math.max(0, 1 - metrics.cerRatio * 3); // Lower CER = better pronunciation
    const fluencyProgress = Math.max(0, 1 - metrics.pauseRatio * 5); // Lower pause ratio = better fluency
    const energyProgress = Math.max(0, 1 - metrics.mptSeconds / 3); // Lower pause time = more energy

    return [
      { id: "speed", label: "Tốc độ", value: speedProgress },
      { id: "pronunciation", label: "Phát âm", value: pronunciationProgress },
      { id: "fluency", label: "Độ trôi chảy", value: fluencyProgress },
      { id: "energy", label: "Năng lượng", value: energyProgress },
    ];
  };

  const createVoiceTest = async () => {
    try {
      setCreatingVoiceTest(true);
      console.log('🎯 Creating voice test from evaluation...');
      
      // Lấy userId từ AsyncStorage
      const userId = await AsyncStorage.getItem('userId') || await AsyncStorage.getItem('accountId');
      if (!userId) {
        console.error('❌ No userId found for voice test');
        Toast.show("Không tìm thấy thông tin người dùng!", { position: Toast.positions.TOP });
        return;
      }

      if (!voiceAnalysisResult?.metrics) {
        console.error('❌ No voice analysis result found');
        Toast.show("Không tìm thấy kết quả phân tích giọng nói!", { position: Toast.positions.TOP });
        return;
      }

      // Chuẩn bị dữ liệu voice test
      const voiceTestData = {
        cerRatio: voiceAnalysisResult.metrics.cerRatio || 0.12,
        spm: voiceAnalysisResult.metrics.spm || 150,
        pauseRatio: voiceAnalysisResult.metrics.pauseRatio || 0.28,
        mptSeconds: voiceAnalysisResult.metrics.mptSeconds || 9,
        finalConsonantAccuracy: voiceAnalysisResult.metrics.finalConsonantAccuracy || 0.67,
        passageId: 1, // Default passage ID for onboarding
        voiceScore: voiceAnalysisResult.metrics.voiceScore || 85,
        level: "L1", // Default level for onboarding
        userId: parseInt(userId),
        audio: undefined // Không có file audio trong onboarding
      };

      console.log('🎯 Voice test data:', voiceTestData);

      // Gọi API tạo voice test
      const response = await createVoiceTestAPI(voiceTestData);
      console.log('🎯 Voice test created:', response);
      
      setVoiceTestCreated(true);
      Toast.show("Đã tạo bài test giọng thành công!", { position: Toast.positions.TOP });
      
    } catch (error: any) {
      console.error('❌ Error creating voice test:', error);
      Toast.show("Không thể tạo bài test giọng. Vui lòng thử lại!", { position: Toast.positions.TOP });
    } finally {
      setCreatingVoiceTest(false);
    }
  };

  const handleComplete = async () => {
    try {
      setIsSaving(true);
      console.log('💾 Starting to save onboarding survey...');
      console.log('💾 Survey data:', surveyData);
      console.log('💾 Survey data keys:', Object.keys(surveyData));
      console.log('💾 Survey data details:', JSON.stringify(surveyData, null, 2));

      // Lấy userId từ AsyncStorage (ưu tiên userId từ login)
      const userId = await AsyncStorage.getItem('userId') || await AsyncStorage.getItem('accountId');
      console.log('💾 UserId from storage:', userId);
      console.log('💾 UserId type:', typeof userId);
      
      if (!userId) {
        console.error('❌ No userId found');
        console.error('❌ Available AsyncStorage keys:', await AsyncStorage.getAllKeys());
        Toast.show("Không tìm thấy thông tin người dùng!", {
          position: Toast.positions.TOP,
        });
        return;
      }

      // Chuẩn bị dữ liệu survey theo format API với text values thay vì IDs
      const surveyPayload = {
        userId: parseInt(userId),
        categoryIds: surveyData.categoryIds || [1], // Default category nếu không có
        discoverSource: surveyData.discoverSource || "Facebook", // Default value
        selfAssessment: surveyData.selfAssessment || "Trung bình", // Default value
        skillFocus: surveyData.skillFocus || "Nghe và nói", // Default value
        trainingGoal: surveyData.trainingGoal || "2 ngày / tuần", // Default value
        allowReminder: surveyData.allowReminder !== undefined ? surveyData.allowReminder : true, // Default true
      };

      console.log('💾 Prepared survey payload:', surveyPayload);
      console.log('💾 Payload validation:', {
        userIdValid: !isNaN(surveyPayload.userId) && surveyPayload.userId > 0,
        categoryIdsValid: Array.isArray(surveyPayload.categoryIds) && surveyPayload.categoryIds.length > 0,
        discoverSourceValid: typeof surveyPayload.discoverSource === 'string' && surveyPayload.discoverSource.length > 0,
        selfAssessmentValid: typeof surveyPayload.selfAssessment === 'string' && surveyPayload.selfAssessment.length > 0,
        skillFocusValid: typeof surveyPayload.skillFocus === 'string' && surveyPayload.skillFocus.length > 0,
        trainingGoalValid: typeof surveyPayload.trainingGoal === 'string' && surveyPayload.trainingGoal.length > 0,
        allowReminderValid: typeof surveyPayload.allowReminder === 'boolean'
      });

      // Tạo voice test trước khi lưu survey
      await createVoiceTest();

      // Gọi API lưu survey
      const success = await saveOnboardingSurvey(surveyPayload);
      
      if (success) {
        console.log('✅ Onboarding survey saved successfully');
        Toast.show("Hoàn thành onboarding thành công!", {
          position: Toast.positions.TOP,
        });
        
        // Chuyển đến trang chính
        router.replace("/(tabs)");
      } else {
        console.error('❌ Failed to save onboarding survey');
        Toast.show("Không thể lưu thông tin onboarding. Vui lòng thử lại!", {
          position: Toast.positions.TOP,
        });
      }
    } catch (error) {
      console.error('❌ Error saving onboarding survey:', error);
      Toast.show("Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại!", {
        position: Toast.positions.TOP,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
  
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.safe}>
          <Text style={styles.title}>ĐÁNH GIÁ</Text>

        {/* Voice Score Display */}
        {!loading && voiceAnalysisResult?.metrics && (
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreTitle}>Điểm tổng</Text>
            <Text style={styles.scoreValue}>{voiceAnalysisResult.metrics.voiceScore}</Text>
            <Text style={styles.scoreSubtitle}>/ 100</Text>
            {creatingVoiceTest && (
              <Text style={styles.creatingVoiceTestText}>
                🔄 Đang tạo bài test giọng...
              </Text>
            )}
            {voiceTestCreated && (
              <Text style={styles.voiceTestCreatedText}>
                ✅ Đã tạo bài test giọng thành công!
              </Text>
            )}
          </View>
        )}

        <View style={{ gap: 18, marginTop: 16, flex: 1 }}>
          {getProgressRows().map((r) => (
            <View key={r.id}>
              <View style={styles.rowLabel}>
                <Text style={styles.metricLabel}>{r.label}</Text>
                <Text style={styles.metricPct}>{Math.round(r.value * 100)}%</Text>
              </View>
              <View style={{ marginBottom: 36 }}>
                <ProgressBar
                  progress={r.value}
                  height={36}
                  trackColor="#EEF1F4"
                  tintColor="#58BDF8"
                  rounded
                  showLabel={true}
                />
              </View>
            </View>
          ))}
        </View>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
            <ShareButton
              title="Làm lại nào!"
              onPress={() => {
                router.push("/(onboarding)/voiceCheck");
              }}
              buttonStyle={{
                height: 44,
                width: 135,
                backgroundColor: "white",
                borderWidth: 1,
                borderColor: "black",
              }}
              textStyle={{ color: "black", fontSize: 14 }}
            />
            <View style={{ flex: 1 }} />
            <ShareButton
              title={
                creatingVoiceTest 
                  ? "Đang tạo test..." 
                  : isSaving 
                    ? "Đang lưu..." 
                    : "Hoàn thành"
              }
              onPress={handleComplete}
              buttonStyle={[
                styles.cta, 
                (isSaving || creatingVoiceTest) && { opacity: 0.7 }
              ]}
              textStyle={{ color: "black", fontSize: 16  }}
              disabled={isSaving || creatingVoiceTest}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
   
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: responsiveSpacing(8),
    paddingHorizontal: responsiveSpacing(16),
  },
  title: {
    fontSize: 46,
    fontWeight: "900",
    color: "#0f3d2e",
    textAlign: "center",
    marginBottom: 60,
    marginTop: 16,
  },
  rowLabel: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  metricLabel: { color: "#273B47", fontWeight: "700", fontSize: 20 },
  metricPct: { marginLeft: 8, color: "#7A8B96" },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  cta: {
    height: 44,
    width: 140,
  },
  scoreContainer: {
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "900",
    color: "#2E7D32",
  },
  scoreSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  voiceTestCreatedText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  creatingVoiceTestText: {
    fontSize: 14,
    color: "#3AA1E0",
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
});
export default EvaluationScreen;
