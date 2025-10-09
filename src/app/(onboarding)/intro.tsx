import IntroLayout from "@/components/onboarding/introLayout";
import { router } from "expo-router";

const IntroScreen = () => {
  return (
    <IntroLayout
      message="Hãy giúp tớ trả lời một số câu hỏi sau để chúng ta cùng tìm hiểu nhau"
      mascotType="talking" // Sử dụng mascot mặc định
      onBack={() => router.back()}
      onNext={() => router.push("/(onboarding)/want-to-learn")}
      nextLabel="Tiếp tục"
    />
  );
}
export default IntroScreen;