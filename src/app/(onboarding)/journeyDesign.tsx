import IntroLayout from "@/components/onboarding/introLayout";
import { router } from "expo-router";
import React from "react";

const JourneyDesignScreen = ({ navigation }: any) => {
  return (
    <IntroLayout
      message="OK, tớ sẽ đề xuất lộ trình học tập phù hợp cho bạn nhé!"
      mascotType="longlanh"
      nextLabel="Tiếp tục"
      onBack={() => router.back()}
      onNext={() => router.push("/(onboarding)/why")}
    />
  );
};

export default JourneyDesignScreen;
