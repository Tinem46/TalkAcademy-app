import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";

// Function để lấy IP của máy (for future local development)
// const getLocalIP = () => {
//   // Các IP phổ biến cho development
//   const commonIPs = [
//     "192.168.1.100",
//     "192.168.0.100",
//     "10.0.2.2", // Android emulator
//     "localhost"
//   ];
//   return commonIPs[0]; // Sử dụng IP đầu tiên làm mặc định
// };

// Function để tạo API instance với IP cụ thể
const createAPIInstance = (baseURL: string) => {
  return axios.create({
    baseURL: `${baseURL}/`,
    timeout: 60 * 1000,
  });
};

// Sử dụng URL backend thực tế
const URL_ANROID_BACKEND = process.env.EXPO_PUBLIC_ANDROID_API_URL || "https://voice-tranning-be.onrender.com";
const URL_IOS_BACKEND = process.env.EXPO_PUBLIC_IOS_API_URL || "https://voice-tranning-be.onrender.com";
const backend = Platform.OS === "android" ? URL_ANROID_BACKEND : URL_IOS_BACKEND;

console.log("🌐 API Backend URL:", backend);
console.log("🌐 Platform:", Platform.OS);

export const api = createAPIInstance(backend);

api.interceptors.request.use(async function (config: any) {
  const token = await AsyncStorage.getItem("access_token");
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
}, function (error) {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response: any) => response.data,
  async (error) => {
    const status = error?.response?.status;
    const message = error?.message;

    // Xử lý lỗi 401 - Token hết hạn hoặc không hợp lệ
    if (status === 401) {
      console.log("🔓 401 Unauthorized - Token expired or invalid");
      // Xóa token cũ
      await AsyncStorage.removeItem("access_token");
      await AsyncStorage.removeItem("refreshToken");
      // Không cần redirect ở đây, để component xử lý
    }
    
    // Log Network Error chi tiết hơn
    if (message === "Network Error") {
      console.log("🔄 Network Error detected");
      console.log("🌐 Current backend URL:", backend);
      console.log("🌐 Request URL:", error?.config?.url);
    }

    // Log các lỗi khác một cách ngắn gọn
    if (status && status !== 401) {
      console.log(`⚠️ API Error ${status}:`, error?.response?.data?.message || message);
    }

    return Promise.reject(error);
  }
);

