import QuestionLayout, {
  OptionItem,
} from "@/components/onboarding/questionLayout";
import { useOnboarding } from "@/context/onboarding.context";
import { router } from "expo-router";

const GoalScreen = ({ navigation }: any) => {
  const { updateSurveyData } = useOnboarding();
  
  const options: OptionItem[] = [
    { id: "1d", label: "1 ngày / tuần" },
    { id: "2d", label: "2 ngày / tuần" },
    { id: "3d", label: "3 ngày / tuần" },
    { id: "5d", label: "5 ngày / tuần" },
    { id: "daily", label: "Hằng ngày" },
  ];

  return (
    <QuestionLayout
      progress={0.8}
      progressText="85%"
      question="Mục tiêu luyện tập của bạn là tần suất nào?"
      options={options}
      selectionMode="single"
      nextLabel="Hoàn tất"
      onBack={() => router.back()}
      onNext={(answers) => {
        // Lưu trainingGoal
        const firstAnswer = answers.length > 0 ? answers[0] : "2 ngày / tuần";
        const trainingGoal = typeof firstAnswer === 'string' ? firstAnswer : firstAnswer.label;
        updateSurveyData({ trainingGoal });
        router.push({
          pathname: "/(onboarding)/notificationStep",
          params: { interests: JSON.stringify(answers) },
        });
      }}
    />
  );
};
export default GoalScreen;
