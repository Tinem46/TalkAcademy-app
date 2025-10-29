import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";

// Function để lấy IP của máy
const getLocalIP = () => {
  // Các IP phổ biến cho development
  const commonIPs = [
    "192.168.1.100",
    "192.168.0.100",
    "10.0.2.2", // Android emulator
    "localhost"
  ];
  return commonIPs[0]; // Sử dụng IP đầu tiên làm mặc định
};

// Function để tạo API instance với IP cụ thể
const createAPIInstance = (baseURL: string) => {
  return axios.create({
    baseURL: `${baseURL}/`,
    timeout: 60 * 1000,
  });
};

// Sử dụng IP thực thay vì localhost cho React Native
const URL_ANROID_BACKEND = process.env.EXPO_PUBLIC_ANDROID_API_URL || `http://${getLocalIP()}:3000`;
const URL_IOS_BACKEND = process.env.EXPO_PUBLIC_IOS_API_URL || `http://${getLocalIP()}:3000`;
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
  error => {
    console.log("AXIOS ERROR:", error?.message, error?.response);

    // Nếu là Network Error, thử các IP khác
    if (error?.message === "Network Error") {
      console.log("🔄 Network Error detected, trying alternative IPs...");
    }

    return Promise.reject(error);
  }
);

