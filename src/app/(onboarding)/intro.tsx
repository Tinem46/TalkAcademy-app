import IntroLayout from "@/components/onboarding/introLayout";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { BackHandler } from "react-native";

const IntroScreen = () => {
  const handleBack = () => {
    // Nếu đây là screen đầu tiên của onboarding, chuyển về welcome thay vì back
    router.replace("/(auth)/welcome");
  };

  // Xử lý hardware back button trên Android
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true; // Ngăn chặn hành vi mặc định
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  return (
    <IntroLayout
      message="Hãy giúp tớ trả lời một số câu hỏi sau để chúng ta cùng tìm hiểu nhau"
      mascotType="talking" // Sử dụng mascot mặc định
      onBack={handleBack}
      onNext={() => router.push("/(onboarding)/want-to-learn")}
      nextLabel="Tiếp tục"
    />
  );
}
export default IntroScreen;