import { api } from "@/config/api";
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

export const getUserSurveyAPI = () => {
  console.log('🔍 Getting all surveys from API');
  return api.get<IBackendRes<any>>(`user-surveys`);
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
        ? surveys.some(survey => survey.username === username)
        : false;
      console.log('📊 Survey check from cache:', hasSurvey);
      return hasSurvey;
    }

    // Nếu không có cache, gọi API
    const response = await getUserSurveyAPI();
    console.log('📊 Survey check response:', response);

    if (response && Array.isArray(response)) {
      const hasSurvey = response.some(survey => survey.username === username);
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
    console.error('❌ Error checking onboarding status with accounts:', error);
    return false;
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

// Lấy thông tin account theo ID
export const getAccountByIdAPI = (accountId: string) => {
  return api.get<IBackendRes<any>>(`accounts/${accountId}`);
}

export const updateUserAPI = (id: string, data: any) => {
  return api.put<IBackendRes<any>>(`Auth/profile`, data);
};

export const fetchProductsAPI = (params: any) => {
  // "Product" là route backend trả về danh sách sản phẩm
  return api.get<IBackendRes<any>>("Product", { params });
};
export const fetchCouponAPI = () => {
  // "Coupon" là route backend trả về danh sách mã giảm giá
  return api.get<IBackendRes<any>>("Coupons");
};

export const updatePasswordAPI = (oldPassword: string, newPassword: string, confirmPassword: string) => {
  return api.post<IBackendRes<any>>("Auth/change-password", {
    oldPassword,
    newPassword,
    confirmPassword,
  })
};




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
export const getReadingPassageByCategoryAPI = (categoryId: number) => {
  console.log('🌐 API Call - GET /reading-passage/category');
  console.log('🌐 Request params:', { categoryId });

  return api.get<IBackendRes<any>>("reading-passage/category", {
    params: { categoryId }
  });
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

// mockApi.ts





