import QuoteCard from "@/components/card/quoteCard";
import NotificationPermissionCard from "@/components/notification/notificationPermissionCard";
import ProgressBar from "@/components/onboarding/progressBar";
import { useOnboarding } from "@/context/onboarding.context";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

const NotificationStep = ({ navigation }: any) => {
  const { updateSurveyData } = useOnboarding();
  
  return (
    <View style={styles.safe}>
        <View style={styles.header}>
          <ProgressBar
            progress={0.9}
            height={36}
            trackColor="#E5E7EA" // Màu nền xám nhạt
            tintColor="#43B7FA" // Màu xanh cho phần tiến độ
          />
        </View>

        <QuoteCard
          text="Tớ sẽ nhắc nhở bạn luyện tập để giúp bạn tạo thói quen học tập nhé!"
          style={{ marginBottom: 24 }}
          colors={{
            background: "#E7F4FF",
            quoteMark: "#1B7A6C", 
            question: "#30414A",
            micBg: "#E7F4FF",
            micIcon: "#1B7A6C"
          }}
        />

        <NotificationPermissionCard
          appName="Legion"
          style={{ marginHorizontal: 14, marginTop: 120 }}
          onAllow={() => {
            // Lưu allowReminder = true
            updateSurveyData({ allowReminder: true });
            router.push("/(onboarding)/discover");
          }}
          onDeny={() => {
            // Lưu allowReminder = false
            updateSurveyData({ allowReminder: false });
            router.push("/(onboarding)/discover");
          }}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  header: { marginBottom: 40, paddingHorizontal: 8 },
});
export default NotificationStep;
