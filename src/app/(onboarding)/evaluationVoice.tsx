import ShareButton from "@/components/button/share.button";
import ProgressBar from "@/components/onboarding/progressBar";
import { useOnboarding } from "@/context/onboarding.context";
import { saveOnboardingSurvey } from "@/utils/onboarding";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Toast from "react-native-root-toast";
import { SafeAreaView } from "react-native-safe-area-context";

const rows = [
  { id: "speed", label: "Tốc độ", value: 0.35 },
  { id: "intonation", label: "Ngữ điệu", value: 0.7 },
  { id: "energy", label: "Năng lượng", value: 0.55 },
  { id: "pronunciation", label: "Phát âm", value: 0.2 },
];

const EvaluationScreen = ({ navigation }: any) => {
  const { surveyData } = useOnboarding();
  const [isSaving, setIsSaving] = useState(false);

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
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.safe}>
        <Text style={styles.title}>ĐÁNH GIÁ</Text>

        <View style={{ gap: 18, marginTop: 16 }}>
          {rows.map((r) => (
            <View key={r.id}>
              <View style={styles.rowLabel}>
                <Text style={styles.metricLabel}>{r.label}</Text>
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

        <View style={styles.footer}>
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
            title={isSaving ? "Đang lưu..." : "Hoàn thành"}
            onPress={handleComplete}
            buttonStyle={[styles.cta, isSaving && { opacity: 0.7 }]}
            textStyle={{ color: "black", fontSize: 16  }}
            disabled={isSaving}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 8,
    paddingHorizontal: 16,
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
    marginTop: "auto",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  cta: {
    height: 44,
    width: 140,
  },
});
export default EvaluationScreen;
