import { api } from "@/config/api";
import {
  mockAnalyzeVoiceAPI,
  mockCheckOnboardingStatusWithAccountsAPI,
  mockGetReadingPassageByCategoryAPI,
  mockGetReadingPassageByIdAPI,
  mockGetUserSurveyAPI
} from "@/utils/mockApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

//AI

// Đổi lại cho đồng bộ với backend mới:
export const registerApi = (
  username: string,
  email: string,
  password: string,
  role: string = "CUSTOMER"
) => {
  return api.post<IBackendRes<any>>("auth/register", {
    username,
    email,
    password,
    role,
  });
};
// Xác nhận email từ link, cần userId và token
export const confirmEmailAPI = (userId: string, token: string) => {
  return api.get<IBackendRes<any>>("Auth/confirm-email", {
    params: { userId, token },
  });
};

export const resendConfirmationAPI = (email: string) => {
  return api.post<IBackendRes<any>>("Auth/resend-confirmation", { email });
};

// Verify OTP API
export const verifyOtpAPI = (email: string, otp: string) => {
  console.log('🌐 API Call - POST /auth/verify-otp');
  console.log('🌐 Request data:', { email, otp: "***" });
  
  return api.post<IBackendRes<any>>("auth/verify-otp", { email, otp });
};

export const loginAPI = (username: string, password: string) => {
  console.log("🌐 API Call - URL:", "auth/login");
  console.log("🌐 API Call - Body:", { username, password: "***" });

  return api.post<IBackendRes<any>>("auth/login", { username, password });
};
// Google
export const googleLoginAPI = (tokenId: string) => {
  return api.post<IBackendRes<any>>("Auth/google-login-token", { tokenId });
};

export const getUserInfoAPI = () => {
  return api.get<IBackendRes<any>>("Auth/current-user");
}

// Lấy profile user hiện tại
export const getUserProfileAPI = () => {
  return api.get<IBackendRes<any>>("users/profile");
}

// Forgot Password API
export const forgotPasswordAPI = (email: string) => {
  console.log('🌐 API Call - POST /auth/forgot-password');
  console.log('🌐 Request data:', { email });

  return api.post<IBackendRes<any>>("auth/forgot-password", { email });
};

// Reset Password API
export const resetPasswordAPI = (email: string, otp: string, newPassword: string) => {
  console.log('🌐 API Call - POST /auth/reset-password');
  console.log('🌐 Request data:', { email, otp: "***", newPassword: "***" });

  return api.post<IBackendRes<any>>("auth/reset-password", {
    email,
    otp,
    newPassword
  });
};

// User Survey APIs
export const createUserSurveyAPI = (surveyData: {
  userId: number;
  categoryIds: number[];
  discoverSource: string;
  selfAssessment: string;
  skillFocus: string;
  trainingGoal: string;
  allowReminder: boolean;
}) => {
  console.log('🌐 API Call - POST /user-surveys');
  console.log('🌐 Request data:', JSON.stringify(surveyData, null, 2));

  return api.post<IBackendRes<any>>("user-surveys", surveyData);
};

export const getUserSurveyAPI = async () => {
  try {
    console.log('🔍 Getting all surveys from API');
    return await api.get<IBackendRes<any>>(`user-surveys`);
  } catch (error) {
    console.log('⚠️ API Error, using mock data:', error);
    return mockGetUserSurveyAPI();
  }
};

export const checkUserSurveyExistsAPI = (userId: number) => {
  return api.get<IBackendRes<any>>(`user-surveys?userId=${userId}`);
};

// Kiểm tra xem user đã hoàn thành onboarding chưa (dựa trên survey)
export const checkOnboardingStatusAPI = async (): Promise<boolean> => {
  try {
    console.log('🔍 Checking onboarding status via API...');

    // Lấy username từ AsyncStorage
    const username = await AsyncStorage.getItem('username');
    if (!username) {
      console.log('❌ No username found in AsyncStorage');
      return false;
    }

    // Thử lấy từ cache trước
    const cachedSurveys = await AsyncStorage.getItem('allSurveys');
    if (cachedSurveys) {
      const surveys = JSON.parse(cachedSurveys);
      const hasSurvey = Array.isArray(surveys)
        ? surveys.some(survey => survey.user?.username === username)
        : false;
      console.log('📊 Survey check from cache:', hasSurvey);
      return hasSurvey;
    }

    // Nếu không có cache, gọi API
    const response = await getUserSurveyAPI();
    console.log('📊 Survey check response:', response);

    if (response && Array.isArray(response)) {
      const hasSurvey = response.some(survey => survey.user?.username === username);
      console.log('📊 Survey exists check:', hasSurvey);
      return hasSurvey;
    }

    console.log('❌ User has not completed onboarding (no surveys found)');
    return false;

  } catch (error: any) {
    console.error('❌ Error checking onboarding status:', error);
    return false;
  }
};

// Kiểm tra onboarding status bằng cách so sánh accounts với surveys
export const checkOnboardingStatusWithAccountsAPI = async (): Promise<boolean> => {
  try {
    console.log('🔍 Checking onboarding status with accounts comparison...');

    // Lấy username từ AsyncStorage
    const username = await AsyncStorage.getItem('username');
    if (!username) {
      console.log('❌ No username found in AsyncStorage');
      return false;
    }

    console.log('📊 Current username from AsyncStorage:', username);

    // Lấy tất cả accounts và surveys
    const [accountsResponse, surveysResponse] = await Promise.all([
      getAllAccountsAPI(),
      getUserSurveyAPI()
    ]);

    console.log('📊 Accounts response:', accountsResponse);
    console.log('📊 Surveys response:', surveysResponse);

    // Lấy userId từ AsyncStorage để so sánh chính xác hơn
    const userId = await AsyncStorage.getItem('userId');
    console.log('🔍 UserId from storage:', userId);

    // Kiểm tra xem user có tồn tại trong accounts không (so sánh bằng userId)
    const userExistsInAccounts = Array.isArray(accountsResponse)
      ? accountsResponse.some(account => {
        console.log('🔍 Comparing account userId:', account.user?.id, 'with:', userId);
        return userId ? account.user?.id === parseInt(userId) : account.user?.username === username;
      })
      : false;

    // Kiểm tra xem user có survey không (so sánh bằng userId)
    const userHasSurvey = Array.isArray(surveysResponse)
      ? surveysResponse.some(survey => {
        console.log('🔍 Comparing survey userId:', survey.user?.id, 'with:', userId);
        return userId ? survey.user?.id === parseInt(userId) : survey.user?.username === username;
      })
      : false;

    console.log('📊 User exists in accounts:', userExistsInAccounts);
    console.log('📊 User has survey:', userHasSurvey);

    // Nếu user có trong accounts và có survey thì đã hoàn thành onboarding
    const hasCompletedOnboarding = userExistsInAccounts && userHasSurvey;

    console.log('📊 Onboarding completed:', hasCompletedOnboarding);
    return hasCompletedOnboarding;

  } catch (error: any) {
    console.log('⚠️ Error checking onboarding status with accounts, using mock data:', error);
    return mockCheckOnboardingStatusWithAccountsAPI();
  }
};

// Alternative: Kiểm tra onboarding status bằng user ID (nếu có)
export const checkOnboardingStatusWithUserIdAPI = async (): Promise<boolean> => {
  try {
    console.log('🔍 Checking onboarding status with user ID comparison...');

    // Lấy user ID từ AsyncStorage (nếu có)
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      console.log('❌ No userId found in AsyncStorage, falling back to username check');
      return await checkOnboardingStatusWithAccountsAPI();
    }

    console.log('📊 Current userId from AsyncStorage:', userId);

    // Lấy tất cả accounts và surveys
    const [accountsResponse, surveysResponse] = await Promise.all([
      getAllAccountsAPI(),
      getUserSurveyAPI()
    ]);

    // Kiểm tra xem user có tồn tại trong accounts không
    const userExistsInAccounts = Array.isArray(accountsResponse)
      ? accountsResponse.some(account => account.user?.id === parseInt(userId))
      : false;

    // Kiểm tra xem user có survey không
    const userHasSurvey = Array.isArray(surveysResponse)
      ? surveysResponse.some(survey => survey.user?.id === parseInt(userId))
      : false;

    console.log('📊 User exists in accounts (by ID):', userExistsInAccounts);
    console.log('📊 User has survey (by ID):', userHasSurvey);

    // Nếu user có trong accounts và có survey thì đã hoàn thành onboarding
    const hasCompletedOnboarding = userExistsInAccounts && userHasSurvey;

    console.log('📊 Onboarding completed (by ID):', hasCompletedOnboarding);
    return hasCompletedOnboarding;

  } catch (error: any) {
    console.error('❌ Error checking onboarding status with user ID:', error);
    return false;
  }
};

// Lấy tất cả accounts
export const getAllAccountsAPI = () => {
  console.log('🌐 API Call - GET /accounts');
  return api.get<IBackendRes<any>>("accounts");
};

// Lấy tất cả categories
export const getAllCategoriesAPI = () => {
  console.log('🌐 API Call - GET /categories');
  return api.get<IBackendRes<any>>("categories");
};

// Lấy categories theo userId (account type)
export const getCategoriesByAccountAPI = (userId: number) => {
  console.log('🌐 API Call - GET /categories/by-account');
  console.log('🌐 Request params:', { userId });

  return api.get<IBackendRes<any>>(`categories/by-account/${userId}`);
};

// Lấy danh sách tất cả danh mục kèm trạng thái hoàn thành
export const getCategoriesProgressAPI = () => {
  console.log('🌐 API Call - GET /categories/progress');
  return api.get<IBackendRes<any>>('categories/progress');
};

// Lấy bài đọc theo category kèm trạng thái hoàn thành & khóa
export const getReadingPassageByCategoryWithStatusAPI = (categoryId: number) => {
  console.log('🌐 API Call - GET /reading-passage/category/{categoryId}');
  console.log('🌐 Request params:', { categoryId });
  return api.get<IBackendRes<any>>(`reading-passage/category/${categoryId}`);
};

// Tạo một bài test giọng mới
// Test API để kiểm tra server
export const testVoiceTestAPI = () => {
  console.log('🧪 Testing voice test API with minimal data...');
  const testData = {
    cerRatio: 0.1,
    spm: 100,
    pauseRatio: 0.1,
    mptSeconds: 1,
    finalConsonantAccuracy: 0.5,
    passageId: 1,
    voiceScore: 50,
    level: "L1",
    userId: 1,
  };

  return api.post<IBackendRes<any>>('voice-test', testData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Lấy lịch sử voice test theo passageId
export const getVoiceTestHistoryAPI = (passageId: number) => {
  console.log('📚 API Call - GET /voice-test/history/' + passageId);
  return api.get<IBackendRes<VoiceTestHistoryItem[]>>(`voice-test/history/${passageId}`);
};

export const createVoiceTestAPI = (voiceTestData: {
  cerRatio: number;
  spm: number;
  pauseRatio: number;
  mptSeconds: number;
  finalConsonantAccuracy: number;
  passageId: number;
  voiceScore: number;
  level: string;
  userId: number;
  audio?: {
    uri: string;
    type: string;
    name: string;
  };
}) => {
  console.log('🌐 API Call - POST /voice-test');
  console.log('🌐 Request data:', voiceTestData);

  // Nếu không có audio file, sử dụng JSON
  if (!voiceTestData.audio) {
    console.log('📝 No audio file, using JSON format');
    const jsonData = {
      cerRatio: voiceTestData.cerRatio,
      spm: voiceTestData.spm,
      pauseRatio: voiceTestData.pauseRatio,
      mptSeconds: voiceTestData.mptSeconds,
      finalConsonantAccuracy: voiceTestData.finalConsonantAccuracy,
      passageId: voiceTestData.passageId,
      voiceScore: voiceTestData.voiceScore,
      level: voiceTestData.level,
      userId: voiceTestData.userId,
    };

    console.log('📤 JSON data being sent:', JSON.stringify(jsonData, null, 2));

    // Validation dữ liệu trước khi gửi
    console.log('🔍 Data validation:');
    console.log('  - cerRatio:', typeof jsonData.cerRatio, jsonData.cerRatio);
    console.log('  - spm:', typeof jsonData.spm, jsonData.spm);
    console.log('  - pauseRatio:', typeof jsonData.pauseRatio, jsonData.pauseRatio);
    console.log('  - mptSeconds:', typeof jsonData.mptSeconds, jsonData.mptSeconds);
    console.log('  - finalConsonantAccuracy:', typeof jsonData.finalConsonantAccuracy, jsonData.finalConsonantAccuracy);
    console.log('  - passageId:', typeof jsonData.passageId, jsonData.passageId);
    console.log('  - voiceScore:', typeof jsonData.voiceScore, jsonData.voiceScore);
    console.log('  - level:', typeof jsonData.level, jsonData.level);
    console.log('  - userId:', typeof jsonData.userId, jsonData.userId);

    return api.post<IBackendRes<any>>('voice-test', jsonData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Nếu có audio file, sử dụng FormData
  console.log('📝 Has audio file, using FormData format');

  // Tạo FormData cho multipart/form-data
  const formData = new FormData();

  console.log('📝 Creating FormData...');
  console.log('📝 Voice test data keys:', Object.keys(voiceTestData));

  // Thêm các trường dữ liệu
  formData.append('cerRatio', voiceTestData.cerRatio.toString());
  formData.append('spm', voiceTestData.spm.toString());
  formData.append('pauseRatio', voiceTestData.pauseRatio.toString());
  formData.append('mptSeconds', voiceTestData.mptSeconds.toString());
  formData.append('finalConsonantAccuracy', voiceTestData.finalConsonantAccuracy.toString());
  formData.append('passageId', voiceTestData.passageId.toString());
  formData.append('voiceScore', voiceTestData.voiceScore.toString());
  formData.append('level', voiceTestData.level);
  formData.append('userId', voiceTestData.userId.toString());

  console.log('📝 FormData basic fields added');

  // Thêm file audio
  console.log('🎵 Adding audio file:', voiceTestData.audio);
  console.log('🎵 Audio file exists:', !!voiceTestData.audio.uri);
  console.log('🎵 Audio file type:', voiceTestData.audio.type);
  console.log('🎵 Audio file name:', voiceTestData.audio.name);

  formData.append('audio', {
    uri: voiceTestData.audio.uri,
    type: voiceTestData.audio.type,
    name: voiceTestData.audio.name,
  } as any);

  console.log('📤 FormData created with fields:', Object.keys(voiceTestData));

  return api.post<IBackendRes<any>>('voice-test', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Lấy thông tin account theo ID
export const getAccountByIdAPI = (accountId: string) => {
  return api.get<IBackendRes<any>>(`accounts/${accountId}`);
}






export const printAsyncStorage = () => {
  AsyncStorage.getAllKeys((err, keys) => {
    AsyncStorage.multiGet(keys!, (error, stores) => {
      let asyncStorage: any = {}
      stores?.map((result, i, store) => {
        asyncStorage[store[i][0]] = store[i][1]
      });
      console.log(JSON.stringify(asyncStorage, null, 2));
    });
  });
};

export const backEndURL = () => {
  const URL_ANROID_BACKEND = process.env.EXPO_PUBLIC_ANDROID_API_URL;
  const URL_IOS_BACKEND = process.env.EXPO_PUBLIC_IOS_API_URL;
  const backend =
    Platform.OS === "android" ? URL_ANROID_BACKEND : URL_IOS_BACKEND;
  return backend;
}


// Reading Passage APIs
export const getReadingPassageByCategoryAPI = async (categoryId: number) => {
  try {
    console.log('🌐 Full API URL:', `${api.defaults.baseURL}reading-passage/category`);
    console.log('🌐 Request params:', { categoryId });

    // Thử với endpoint khác nếu endpoint hiện tại không hoạt động
    let response;
    try {
      response = await api.get<IBackendRes<any>>("reading-passage/category", {
        params: { categoryId }
      });
    } catch {
      console.log('🔄 Trying alternative endpoint...');
      // Thử endpoint khác
      response = await api.get<IBackendRes<any>>(`reading-passage?categoryId=${categoryId}`);
    }

    console.log('✅ API Success - Reading passages:', response);
    return response;
  } catch (error: any) {
    console.log('❌ API Error - Reading passages:', error?.response?.status, error?.message);

    // Nếu là lỗi 400 hoặc server không có sẵn, sử dụng mock data
    if (error?.response?.status === 400 || error?.code === 'NETWORK_ERROR') {
      console.log('🔄 Using mock data for reading passages');
      return mockGetReadingPassageByCategoryAPI(categoryId);
    }

    throw error;
  }
};

export const getReadingPassageByIdAPI = async (id: number) => {
  try {
    console.log('🌐 API Call - GET /reading-passage/{id}');
    console.log('🌐 Request params:', { id });

    const response = await api.get<IBackendRes<any>>(`reading-passage/${id}`);

    console.log('✅ API Success - Reading passage by ID:', response);
    return response;
  } catch (error: any) {
    console.log('❌ API Error - Reading passage by ID:', error?.response?.status, error?.message);

    // Nếu là lỗi 400 hoặc server không có sẵn, sử dụng mock data
    if (error?.response?.status === 400 || error?.code === 'NETWORK_ERROR') {
      console.log('🔄 Using mock data for reading passage by ID');
      return mockGetReadingPassageByIdAPI(id);
    }

    throw error;
  }
};

export const analyzeVoiceAPI = async (audioFile: any) => {
  try {
    console.log('🌐 API Call - POST /assemblyai/analyze');
    console.log('🌐 Uploading audio file for analysis');

    const formData = new FormData();
    formData.append('file', {
      uri: audioFile.uri,
      type: audioFile.type || 'audio/mp3',
      name: audioFile.name || 'recording.mp3',
    } as any);

    return await api.post<IBackendRes<any>>("assemblyai/analyze", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error) {
    console.log('⚠️ API Error, using mock data:', error);
    return mockAnalyzeVoiceAPI();
  }
};

export const currencyFormatter = (value: any) => {
  const options = {
    significantDigits: 2,
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbol: 'vnđ'
  }

  if (typeof value !== 'number') value = 0.0
  value = value.toFixed(options.significantDigits)

  const [currency] = value.split('.')
  return `${currency.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    options.thousandsSeparator
  )} ${options.symbol}`
}

// Packages API
export const getAllPackagesAPI = () => {
  console.log('🌐 API Call - GET /packages');
  return api.get<IBackendRes<any>>("packages");
};

// Create user-package link
export const createUserPackageAPI = (payload: {
  userId: number;
  packageId: number;
  endDate: string; 
  status: 'ACTIVE' | 'INACTIVE' | string;
}) => {
  console.log('🌐 API Call - POST /user-packages');
  console.log('🌐 Request data:', payload);
  return api.post<IBackendRes<any>>('user-packages', payload);
};

// PayOS checkout
export const createPayOSCheckoutAPI = (payload: {
  amount: number; 
  packageId: number; 
  userId: number;
}) => {
  console.log('🌐 API Call - POST /checkout/payos');
  console.log('🌐 Request data:', payload);
  return api.post<IBackendRes<any>>('checkout/payos', payload);
};

// Assessments API
export const getAssessmentsAPI = (level?: string) => {
  console.log('🌐 API Call - GET /assessments');
  console.log('🌐 Request params:', { level });

  const params = level ? { level } : {};
  return api.get<IBackendRes<any>>("assessments", { params });
};

// User Overview Statistics API
export const getUserOverviewAPI = () => {
  console.log('🌐 API Call - GET /overview/user');
  return api.get<IBackendRes<any>>("overview/user");
};

// mockApi.ts





