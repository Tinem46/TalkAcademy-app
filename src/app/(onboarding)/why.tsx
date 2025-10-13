import QuestionLayout, {
  OptionItem,
} from "@/components/onboarding/questionLayout";
import { router } from "expo-router";
import React from "react";

const WhyScreen = ({ navigation }: any) => {
  const options: OptionItem[] = [
    { id: "work", label: "Công việc" },
    { id: "study", label: "Học tập" },
    { id: "personal", label: "Mục tiêu cá nhân" },
    { id: "other", label: "Khác" },
    { id: "other_text", label: "Nhập lý do của bạn", type: "text" }, // ô nhập tự do
  ];

  return (
    <QuestionLayout
      progress={0.65}
      progressText="50%"
      question="Tại sao bạn muốn rèn luyện kỹ năng này?"
      options={options}
      selectionMode="multiple"
      onBack={() => router.back()}
      onNext={(answers) =>
        router.push({
          pathname: "/(onboarding)/goal",
          params: { interests: JSON.stringify(answers) },
        })
      }
    />
  );
};
export default WhyScreen;
