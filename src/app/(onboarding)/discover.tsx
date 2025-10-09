import IntroLayout from "@/components/onboarding/introLayout";
import { router } from "expo-router";

const DiscoverNowScreen = ({ navigation }: any) => {
  return (
    <IntroLayout
      message="CÙNG KHÁM GIỌNG NÀO!!!"
      mascotType="omg" // Sử dụng mascot OMG cho cảm xúc ngạc nhiên
      bubbleConfig={{
        textStyle: { fontSize: 24, lineHeight: 32 , fontWeight: "700" },
      }}
      onNext={() => router.push("/(onboarding)/voiceCheck")}
      onBack={() => router.back()}
      nextLabel="Khám ngay thôi he he"
    />
  );
};
export default DiscoverNowScreen;
