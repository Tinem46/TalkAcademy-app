import PathCard from "@/components/card/pathCard";
import { useOnboarding } from "@/context/onboarding.context";
import { getOnboardingCompleted, saveOnboardingSurvey, SurveyData } from "@/utils/onboarding";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-root-toast";

type Item = { id: string; title: string; desc: string };

const DATA: Item[] = [
  {
    id: "pron",
    title: "Phát âm",
    desc: "A small description about the feature title. Its better to only...",
  },
  {
    id: "speed",
    title: "Tốc độ",
    desc: "A small description about the feature title. Its better to only...",
  },
  {
    id: "energy",
    title: "Năng lượng",
    desc: "A small description about the feature title. Its better to only...",
  },
  {
    id: "tone",
    title: "Ngữ điệu",
    desc: "A small description about the feature title. Its better to only...",
  },
];

const PathScreen = ({ navigation }: any) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { surveyData, clearSurveyData } = useOnboarding();

  // Function để kiểm tra user đã có survey chưa
  const checkExistingSurvey = async (userId: number): Promise<boolean> => {
    try {
      const hasCompleted = await getOnboardingCompleted();
      console.log('📊 Check existing survey for userId:', userId, 'Result:', hasCompleted);
      return hasCompleted;
    } catch (error) {
      console.error('❌ Error checking existing survey:', error);
      return false;
    }
  };

  const handlePathSelection = async (itemId: string) => {
    setSelected(itemId);
    setLoading(true);

    try {
      // Lấy userId từ AsyncStorage
      const userId = await AsyncStorage.getItem('accountId');
      if (!userId) {
        Toast.show("Không tìm thấy thông tin user!", {
          position: Toast.positions.TOP,
        });
        return;
      }

      // Tạo dữ liệu survey hoàn chỉnh theo format API documentation
      const completeSurveyData: SurveyData = {
        userId: parseInt(userId),
        categoryId: 1, // Mặc định categoryId = 1 (English Pronunciation)
        discoverSource: (surveyData.discoverSource && surveyData.discoverSource.trim() !== '') ? surveyData.discoverSource : "Facebook",
        selfAssessment: (surveyData.selfAssessment && surveyData.selfAssessment.trim() !== '') ? surveyData.selfAssessment : "Trung bình",
        skillFocus: (surveyData.skillFocus && surveyData.skillFocus.trim() !== '') ? surveyData.skillFocus : "Nghe và nói",
        trainingGoal: (surveyData.trainingGoal && surveyData.trainingGoal.trim() !== '') ? surveyData.trainingGoal : "2 lần/tuần",
        allowReminder: surveyData.allowReminder !== undefined ? surveyData.allowReminder : true,
      };

      // Validate dữ liệu trước khi gửi
      if (!completeSurveyData.userId || isNaN(completeSurveyData.userId)) {
        console.error('❌ Invalid userId:', completeSurveyData.userId);
        Toast.show("Lỗi: Không tìm thấy thông tin user!", {
          position: Toast.positions.TOP,
        });
        return;
      }

      console.log('📝 Complete survey data:', completeSurveyData);
      console.log('📝 Survey context data:', surveyData);
      console.log('📝 Data validation:', {
        userId: typeof completeSurveyData.userId,
        categoryId: typeof completeSurveyData.categoryId,
        discoverSource: typeof completeSurveyData.discoverSource,
        selfAssessment: typeof completeSurveyData.selfAssessment,
        skillFocus: typeof completeSurveyData.skillFocus,
        trainingGoal: typeof completeSurveyData.trainingGoal,
        allowReminder: typeof completeSurveyData.allowReminder,
      });

      // Kiểm tra xem user đã có survey chưa trước khi lưu
      const hasExistingSurvey = await checkExistingSurvey(parseInt(userId));
      
      if (hasExistingSurvey) {
        console.log('📊 User already has survey, skipping save');
        Toast.show("Bạn đã hoàn thành onboarding rồi!", {
          position: Toast.positions.TOP,
        });
        
        // Xóa dữ liệu survey khỏi context
        clearSurveyData();
        
        // Chuyển đến trang chính
        router.replace("/(tabs)");
        return;
      }

      // Lưu survey lên server
      const success = await saveOnboardingSurvey(completeSurveyData);
      
      if (success) {
        // Xóa dữ liệu survey khỏi context
        clearSurveyData();
        
        Toast.show("Hoàn thành onboarding!", {
          position: Toast.positions.TOP,
        });
        
        // Chuyển đến trang chính
        router.replace("/(tabs)");
      } else {
        Toast.show("Có lỗi xảy ra khi lưu dữ liệu! Vui lòng thử lại.", {
          position: Toast.positions.TOP,
        });
      }
    } catch (error) {
      console.error('Error saving survey:', error);
      Toast.show("Có lỗi xảy ra khi lưu dữ liệu!", {
        position: Toast.positions.TOP,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safe}>
        <Text style={styles.title}>Chọn lộ trình</Text>

        <FlatList
          data={DATA}
          keyExtractor={(it) => it.id}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 12 }}>
              <PathCard
                title={item.title}
                desc={item.desc}
                selected={selected === item.id}
                onPress={() => handlePathSelection(item.id)}
              />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16, paddingTop: 0 },
  title: {
    fontSize: 44,
    fontWeight: "900",
    color: "#083019",
    marginBottom: 18,
  },
});
export default PathScreen;
