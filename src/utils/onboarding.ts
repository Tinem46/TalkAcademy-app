import { createUserSurveyAPI, getUserSurveyAPI } from '@/app/utils/apiall';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

// Interface cho dữ liệu survey
export interface SurveyData {
    userId: number;
    categoryIds: number[];
    discoverSource: string;
    selfAssessment: string;
    skillFocus: string;
    trainingGoal: string;
    allowReminder: boolean;
}

// Lưu dữ liệu survey lên server và đánh dấu onboarding hoàn thành
export const saveOnboardingSurvey = async (surveyData: SurveyData): Promise<boolean> => {
    try {
        console.log('📝 Saving onboarding survey:', surveyData);
        console.log('📝 Survey data type check:', {
            userId: typeof surveyData.userId,
            categoryId: typeof surveyData.categoryId,
            discoverSource: typeof surveyData.discoverSource,
            selfAssessment: typeof surveyData.selfAssessment,
            skillFocus: typeof surveyData.skillFocus,
            trainingGoal: typeof surveyData.trainingGoal,
            allowReminder: typeof surveyData.allowReminder,
        });

        // Gọi API lưu survey
        console.log('🚀 Calling createUserSurveyAPI...');
        const response = await createUserSurveyAPI(surveyData);

        console.log('📊 API Response:', response);
        console.log('📊 Response type:', typeof response);
        console.log('📊 Response keys:', Object.keys(response || {}));

        // Vì interceptor trả về response.data, chúng ta cần kiểm tra khác
        console.log('📊 Response structure check:', {
            hasId: !!response?.id,
            hasUser: !!response?.user,
            hasCategory: !!response?.category,
            hasCategories: !!response?.categories,
            responseKeys: Object.keys(response || {}),
            responseType: typeof response,
            isArray: Array.isArray(response)
        });

        if (response && (response.id || response.user || response.category || response.categories)) {
            // Không lưu vào AsyncStorage nữa, chỉ dựa vào API
            console.log('✅ Onboarding survey saved successfully');
            return true;
        } else {
            console.error('❌ Failed to save survey - unexpected response format:', response);
            console.error('❌ Response details:', JSON.stringify(response, null, 2));
            return false;
        }
    } catch (error: any) {
        console.error('❌ Error saving onboarding survey:', error);
        console.error('❌ Error response:', error?.response?.data);
        console.error('❌ Error status:', error?.response?.status);

        // Xử lý các loại lỗi khác nhau
        if (error?.response?.status === 400) {
            console.error('❌ Bad request - invalid survey data');
            console.error('❌ Server error details:', error?.response?.data);
        } else if (error?.response?.status === 500) {
            console.error('❌ Server error when saving survey');
            console.error('❌ Server error details:', error?.response?.data);
        } else {
            console.error('❌ Unknown error when saving survey');
        }

        return false;
    }
};

// Kiểm tra xem user đã hoàn thành onboarding chưa (chỉ qua API)
export const getOnboardingCompleted = async (): Promise<boolean> => {
    try {
        // Lấy userId từ AsyncStorage
        const userId = await AsyncStorage.getItem('accountId');
        if (!userId) {
            console.log('❌ No userId found');
            return false;
        }

        // Kiểm tra qua API
        const response = await getUserSurveyAPI();

        console.log('📊 Survey check response:', response);
        console.log('📊 Response type:', typeof response);

        if (response) {
            // Kiểm tra xem có dữ liệu survey không
            const hasSurvey = Array.isArray(response) ? response.length > 0 : (response && Object.keys(response).length > 0);
            console.log('📊 Survey exists check:', hasSurvey);
            return hasSurvey;
        } else {
            console.log('❌ No survey data found');
            return false;
        }
    } catch (error: any) {
        console.error('❌ Error checking onboarding status:', error);

        // Xử lý các loại lỗi khác nhau
        if (error?.response?.status === 404) {
            // User chưa có survey (404 = Not Found)
            console.log('📊 User has no survey (404)');
            return false;
        } else if (error?.response?.status === 500) {
            // Server error
            console.log('⚠️ Server error (500)');
            return false;
        } else {
            // Các lỗi khác
            console.log('⚠️ API error');
            return false;
        }
    }
};

// Đánh dấu onboarding hoàn thành (chỉ local, dùng khi không có API)
export const setOnboardingCompleted = async (): Promise<void> => {
    try {
        await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
        console.log('✅ Onboarding completed status saved locally');
    } catch (error) {
        console.error('❌ Error saving onboarding status:', error);
    }
};

// Xóa trạng thái onboarding (dùng cho user mới)
export const clearOnboardingStatus = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
        console.log('✅ Onboarding status cleared');
    } catch (error) {
        console.error('❌ Error clearing onboarding status:', error);
    }
};
