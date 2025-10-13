import { getAllCategoriesAPI } from "@/app/utils/apiall";
import QuestionLayout, {
  OptionItem,
} from "@/components/onboarding/questionLayout";
import { useOnboarding } from "@/context/onboarding.context";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

// Fallback options nếu API không hoạt động
const fallbackOptions: OptionItem[] = [
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
  const [options, setOptions] = useState<OptionItem[]>(fallbackOptions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('📚 Fetching categories from API...');
        
        const response = await getAllCategoriesAPI();
        console.log('📚 Categories API Response:', response);
        
        if (response && Array.isArray(response) && response.length > 0) {
          // Convert API response thành OptionItem format
          const categoryOptions: OptionItem[] = response.map((category: any) => ({
            id: category.id.toString(),
            label: category.name || category.title || 'Unknown Category'
          }));
          
          // Thêm option "Tiêu đề khác..." vào cuối
          categoryOptions.push({ id: "other", label: "Tiêu đề khác...", type: "text" });
          
          setOptions(categoryOptions);
          console.log('📚 Categories loaded successfully:', categoryOptions);
        } else {
          console.log('⚠️ No categories found, using fallback options');
          setOptions(fallbackOptions);
        }
      } catch (err) {
        console.error('❌ Error fetching categories:', err);
        setError('Không thể tải danh mục học tập');
        // Sử dụng fallback options khi có lỗi
        setOptions(fallbackOptions);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Hiển thị loading nếu đang fetch data
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2AA0FF" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
          Đang tải danh mục học tập...
        </Text>
      </View>
    );
  }
  
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
        // Lưu skillFocus và categoryIds từ các options được chọn
        const firstAnswer = answers.length > 0 ? answers[0] : "Luyện phát âm";
        const skillFocus = typeof firstAnswer === 'string' ? firstAnswer : firstAnswer.label;
        
        // Lấy categoryIds từ các options được chọn (loại bỏ "other")
        const categoryIds: number[] = answers
          .filter(answer => typeof answer === 'object' && answer.id !== 'other')
          .map(answer => parseInt((answer as any).id))
          .filter(id => !isNaN(id));
        
        // Nếu không có categoryIds nào, sử dụng default
        if (categoryIds.length === 0) {
          categoryIds.push(1); // Default category ID
        }
        
        updateSurveyData({ 
          skillFocus,
          categoryIds 
        });
        
        console.log('📚 Selected categories:', { skillFocus, categoryIds });
        
        router.push({
          pathname: "/(onboarding)/heard-from",
          params: { interests: JSON.stringify(answers) },
        });
      }}
    />
  );
};
export default WantToLearnScreen;
