import QuestionLayout, {
    OptionItem,
} from "@/components/onboarding/questionLayout";
import { useOnboarding } from "@/context/onboarding.context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const options: OptionItem[] = [
  {
    id: "tiktok",
    label: "Tiktok",
    icon: <Ionicons name="logo-tiktok" size={20} color="#000" />,
  },
  {
    id: "youtube",
    label: "Youtube",
    icon: <Ionicons name="logo-youtube" size={20} color="#FF0000" />,
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: <Ionicons name="logo-facebook" size={20} color="#1877F2" />,
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: <Ionicons name="logo-instagram" size={20} color="#C837AB" />,
  },
  {
    id: "zalo",
    label: "Zalo",
    icon: (
      <Ionicons name="chatbubble-ellipses-outline" size={20} color="#2962FF" />
    ),
  },
  {
    id: "friends",
    label: "Bạn bè/ Gia đình",
    icon: <Ionicons name="people-outline" size={20} color="#333" />,
  },
  {
    id: "google",
    label: "Google",
    icon: <Ionicons name="logo-google" size={20} color="#4285F4" />,
  },
  { id: "other", label: "Khác (ghi rõ…)", type: "text" },
];

const HeardFromScreen = () => {
  const { updateSurveyData } = useOnboarding();
  
  return (
    <QuestionLayout
      progress={0.4}
      progressText="40%"
      question="Bạn biết tới Talkademy từ đâu?"
      options={options}
      selectionMode="multiple"
      nextLabel="Tiếp tục"
      onBack={() => router.back()}
      onNext={(answers) => {
        // Lưu discoverSource (lấy option đầu tiên được chọn)
        const firstAnswer = answers.length > 0 ? answers[0] : "Khác";
        const discoverSource = typeof firstAnswer === 'string' ? firstAnswer : firstAnswer.id;
        updateSurveyData({ discoverSource });
        router.push("/(onboarding)/selfAssess");
      }}
    />
  );
};
export default HeardFromScreen;
