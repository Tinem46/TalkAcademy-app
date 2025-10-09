import { createUserSurveyAPI, getUserSurveyAPI } from '@/app/utils/apiall';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

// Interface cho dữ liệu survey
export interface SurveyData {
    userId: number;
    categoryId: number;
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
        if (response && (response.id || response.user || response.category)) {
            // Lưu trạng thái local
            await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
            console.log('✅ Onboarding survey saved successfully');
            return true;
        } else {
            console.error('❌ Failed to save survey - unexpected response format:', response);
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

// Kiểm tra xem user đã hoàn thành onboarding chưa (qua API)
export const getOnboardingCompleted = async (): Promise<boolean> => {
    try {
        // Lấy userId từ AsyncStorage
        const userId = await AsyncStorage.getItem('accountId');
        if (!userId) {
            console.log('❌ No userId found');
            return false;
        }

        // Kiểm tra qua API
        const response = await getUserSurveyAPI(parseInt(userId));

        console.log('📊 Survey check response:', response);
        console.log('📊 Response type:', typeof response);

        if (response) {
            // Kiểm tra xem có dữ liệu survey không
            const hasSurvey = Array.isArray(response) ? response.length > 0 : (response && Object.keys(response).length > 0);
            console.log('📊 Survey exists check:', hasSurvey);

            // Cập nhật trạng thái local để đồng bộ
            await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, hasSurvey ? 'true' : 'false');

            return hasSurvey;
        } else {
            // Fallback về kiểm tra local nếu API lỗi
            console.log('⚠️ API check failed, falling back to local storage');
            const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
            return completed === 'true';
        }
    } catch (error: any) {
        console.error('❌ Error checking onboarding status:', error);

        // Xử lý các loại lỗi khác nhau
        if (error?.response?.status === 404) {
            // User chưa có survey (404 = Not Found)
            console.log('📊 User has no survey (404)');
            await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'false');
            return false;
        } else if (error?.response?.status === 500) {
            // Server error, fallback về local storage
            console.log('⚠️ Server error (500), falling back to local storage');
        } else {
            // Các lỗi khác, fallback về local storage
            console.log('⚠️ API error, falling back to local storage');
        }

        // Fallback về kiểm tra local nếu có lỗi
        try {
            const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
            return completed === 'true';
        } catch (localError) {
            console.error('❌ Error checking local storage:', localError);
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
