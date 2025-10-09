import QuestionLayout, {
    OptionItem,
} from "@/components/onboarding/questionLayout";
import { useOnboarding } from "@/context/onboarding.context";
import { router } from "expo-router";

const options: OptionItem[] = [
  { id: "pronounce", label: "Luyện phát âm" },
  { id: "pattern", label: "Luyện nói theo mẫu" },
  { id: "reflex", label: "Luyện phản xạ" },
  { id: "intonation", label: "Luyện ngữ điệu" },
  { id: "daily", label: "Hội thoại đời sống" },
  { id: "topic", label: "Tự do luyện nói theo chủ đề" },
  { id: "other", label: "Tiêu đề khác...", type: "text" },
];

const WantToLearnScreen = () => {
  const { updateSurveyData } = useOnboarding();
  
  return (
    <QuestionLayout
      progress={0.15}
      progressText="15%"
      question="Bạn muốn học gì nhỉ?"
      options={options}
      selectionMode="multiple"
      nextLabel="Tiếp tục"
      onBack={() => router.back()}
      onNext={(answers) => {
        // Lưu skillFocus (lấy option đầu tiên được chọn)
        const firstAnswer = answers.length > 0 ? answers[0] : "Luyện phát âm";
        const skillFocus = typeof firstAnswer === 'string' ? firstAnswer : firstAnswer.id;
        updateSurveyData({ skillFocus });
        router.push({
          pathname: "/(onboarding)/heard-from",
          params: { interests: JSON.stringify(answers) },
        });
      }}
    />
  );
};
export default WantToLearnScreen;
