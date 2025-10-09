import gg from "@/assets/auth/google.png";
import { useCurrentApp } from "@/context/app.context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Google from "expo-auth-session/providers/google";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Toast from "react-native-root-toast";

// Helper function to decode JWT token
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

WebBrowser.maybeCompleteAuthSession();

interface SocialButtonProps {
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  textStyle,
  containerStyle,
}) => {
  const [loading, setLoading] = useState(false);
  const { setAppState } = useCurrentApp();

  // Config Google Auth - Sử dụng Web Client ID cho Expo development
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 
    "194923762907-8v9nru3u6duhl9t1a2ajdc7isgf1c6es.apps.googleusercontent.com";
  
  console.log("Google OAuth Config:", {
    clientId: clientId,
    redirectUri: "Auto-detect by Expo"
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: clientId,
    selectAccount: true,
    // Không set redirectUri để Expo tự động detect
  });

  console.log("Google Request Object:", request);
  console.log("Prompt Async Function:", promptAsync);

  useEffect(() => {
    console.log("Google Auth Response:", response);
    
    if (response?.type === "success") {
      const idToken = (response as any)?.params?.id_token;
      const accessToken = response.authentication?.accessToken;
      console.log("Success - ID Token:", idToken);
      console.log("Success - Access Token:", accessToken);
      
      if (idToken) {
        handleGoogle(idToken, accessToken);
      } else {
        Toast.show("Google authentication failed: missing id_token.", {
          position: Toast.positions.TOP,
        });
      }
    } else if (response?.type === "error") {
      console.error("Google Auth Error Details:", response.error);
      console.error("Error Code:", response.error?.code);
      console.error("Error Message:", response.error?.message);
      console.error("Error Description:", response.error?.description);
      
      Toast.show(`Google authentication failed: ${response.error?.message || "Unknown error"}`, {
        position: Toast.positions.TOP,
      });
    } else if (response?.type === "cancel") {
      console.log("User cancelled Google authentication");
      Toast.show("Đăng nhập Google đã bị hủy", {
        position: Toast.positions.TOP,
      });
    }
  }, [response]);

  const handleGoogle = async (idToken: string, accessToken?: string) => {
    try {
      setLoading(true);

      // Test Google OAuth chỉ trên frontend - không cần backend
      console.log("Google ID Token:", idToken);
      console.log("Google Access Token:", accessToken);

      // Decode ID token để lấy thông tin user (chỉ để test)
      try {
        const payload = decodeJWT(idToken);
        console.log("Google User Info:", payload);
        
        if (!payload) {
          throw new Error("Không thể decode ID token");
        }
        
        const userEmail = payload.email;
        const userName = payload.name;
        const userPicture = payload.picture;

        // Tạo mock token cho test
        const mockToken = `google_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const mockUserId = `user_${Date.now()}`;
        const mockRole = "USER";

        // Lưu thông tin vào AsyncStorage
        await AsyncStorage.setItem("access_token", mockToken);
        await AsyncStorage.setItem("role", mockRole);
        await AsyncStorage.setItem("userId", mockUserId);
        await AsyncStorage.setItem("userEmail", userEmail || "");
        await AsyncStorage.setItem("userName", userName || "");
        await AsyncStorage.setItem("userPicture", userPicture || "");

        // Cập nhật app state
        setAppState?.({ 
          token: mockToken, 
          role: mockRole, 
          userId: mockUserId,
          refreshToken: accessToken || ""
        });

        router.replace("/(tabs)");
        Toast.show(`Đăng nhập Google thành công! Chào ${userName || userEmail}!`, {
          position: Toast.positions.TOP,
        });
      } catch (decodeError) {
        console.error("Error decoding ID token:", decodeError);
        Toast.show("Lỗi khi xử lý thông tin Google. Vui lòng thử lại!", {
          position: Toast.positions.TOP,
        });
      }
    } catch (err: any) {
      console.error("Google OAuth Error:", err);
      Toast.show(
        err?.message || "Có lỗi khi đăng nhập Google!",
        { position: Toast.positions.TOP }
      );
    } finally {
      setLoading(false);
    }
  };

  console.log("Button State:", {
    requestAvailable: !!request,
    loading: loading,
    buttonDisabled: !request || loading
  });

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={!request || loading}
        onPress={() => {
          console.log("Google Login Button Pressed!");
          console.log("Request available:", !!request);
          console.log("Loading:", loading);
          if (request) {
            console.log("Calling promptAsync...");
            promptAsync();
          } else {
            console.log("Request not available, cannot proceed");
          }
        }}
        style={[styles.googleBtn, loading && { opacity: 0.7 }]}
      >
        <Text style={[styles.googleText, textStyle]}>Đăng nhập với Google</Text>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Image source={gg} style={styles.googleIcon} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 24,
  },
  googleBtn: {
    height: 64,
    borderRadius: 22,
    backgroundColor: "#0F3D57",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    flexDirection: "row",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  googleText: {
    color: "#43B7FA",
    fontSize: 20,
    fontWeight: "700",
  },
  googleIcon: { width: 32, height: 32 },
});

export default SocialButton;
