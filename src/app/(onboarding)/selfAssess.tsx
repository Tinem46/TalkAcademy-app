import QuestionLayout, {
  OptionItem,
} from "@/components/onboarding/questionLayout";
import { useOnboarding } from "@/context/onboarding.context";
import { router } from "expo-router";

const SelfAssessScreen = ({ navigation }: any) => {
  const { updateSurveyData } = useOnboarding();
  
  const options: OptionItem[] = [
    { id: "newbie", label: "Mới bắt đầu" },
    { id: "ok", label: "Tạm ổn" },
    { id: "good", label: "Khá tốt" },
    { id: "pro", label: "Thành thạo" },
    { id: "unknown", label: "Tôi không rõ" },
  ];

  return (
    <QuestionLayout
      progress={0.45}
      progressText="15%"
      question="Bạn tự đánh giá trình độ hiện tại của mình về kỹ năng này như thế nào?"
      options={options}
      selectionMode="single"
      onBack={() => router.back()}
      onNext={(answers) => {
        // Lưu selfAssessment
        const firstAnswer = answers.length > 0 ? answers[0] : "Tạm ổn";
        const selfAssessment = typeof firstAnswer === 'string' ? firstAnswer : firstAnswer.label;
        updateSurveyData({ selfAssessment });
        router.push({
          pathname: "/(onboarding)/journeyDesign",
          params: { interests: JSON.stringify(answers) },
        });
      }}
    />
  );
};

export default SelfAssessScreen;
