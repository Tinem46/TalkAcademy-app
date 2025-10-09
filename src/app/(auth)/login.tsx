import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { Formik } from "formik";
import { useState } from "react";
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Toast from "react-native-root-toast";
import { SafeAreaView } from "react-native-safe-area-context";

import SocialButton from "@/components/button/social.button";
import TextBetweenLine from "@/components/text/textline";
import { useCurrentApp } from "@/context/app.context";
import { getOnboardingCompleted } from "@/utils/onboarding";
import { loginAPI } from "../utils/apiall";
import { LoginSchema } from "../utils/validate.schema";

const BORDER = "#D7D7D7";
const LABEL = "#2F2F2F";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [secure, setSecure] = useState(true);
  const { setAppState } = useCurrentApp();
  const params = useLocalSearchParams();

  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    try {
      console.log("🔐 Attempting login with:", { username, password: "***" });
      
      // Gọi API với format đúng theo documentation
      const res = (await loginAPI(username, password)) as any;
      console.log("✅ Login response:", res);

      // Kiểm tra response thành công (status code 201)
      const isSuccess = res?.statusCode === 201;

      if (isSuccess && res?.data?.accessToken) {
        // Lưu token và thông tin user vào AsyncStorage
        await AsyncStorage.setItem("access_token", res.data.accessToken);
        await AsyncStorage.setItem("refreshToken", res.data.refreshToken);
        await AsyncStorage.setItem("accountType", res.data.accountType || "TRIAL");
        await AsyncStorage.setItem("trialExpiresAt", res.data.trialExpiresAt || "");
        
        // Lưu accountId từ response nếu có, hoặc sử dụng default
        const accountId = res.data?.accountId || res.data?.user?.id || "1";
        await AsyncStorage.setItem("accountId", String(accountId));
        console.log('💾 Saved accountId:', accountId);

        // Cập nhật app state
        setAppState?.({
          token: res.data.accessToken,
          role: res.data.accountType || "TRIAL",
          refreshToken: res.data.refreshToken,
          trialExpiresAt: res.data.trialExpiresAt,
        });

        // Kiểm tra xem user đã hoàn thành onboarding chưa
        const hasCompletedOnboarding = await getOnboardingCompleted();
        
        if (hasCompletedOnboarding) {
          // Nếu đã hoàn thành onboarding, chuyển đến trang chính
          router.replace("/(tabs)");
        } else {
          // Nếu chưa hoàn thành onboarding, chuyển đến onboarding
          router.replace("/(onboarding)/intro");
        }
        
        Toast.show("Đăng nhập thành công!", { position: Toast.positions.TOP });
      } else {
        console.log("❌ Login failed:", res);
        Toast.show(res?.message || "Đăng nhập thất bại!", {
          position: Toast.positions.TOP,
        });
      }
    } catch (error: any) {
      console.error("💥 Login error:", error);
      console.error("💥 Error response:", error?.response?.data);
      console.error("💥 Error status:", error?.response?.status);
      console.error("💥 Full error:", JSON.stringify(error, null, 2));
      
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.";
      Toast.show(msg, { position: Toast.positions.TOP });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Formik
        validationSchema={LoginSchema}
        initialValues={{ 
          username: (params.username as string) || "", 
          password: "" 
        }}
        onSubmit={(values) => handleLogin(values.username, values.password)}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <View style={styles.container}>
            {/* Logo + Title */}
            <View style={styles.hero}>
              <View style={styles.logoWrap}>
                <Ionicons name="mic-outline" size={30} color="#1D7BF2" />
              </View>
              <Text style={styles.brand}>TALKADEMY</Text>
            </View>

            {/* Welcome text */}
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>Chào mừng trở lại!</Text>
              <Text style={styles.welcomeSubtitle}>
                Đăng nhập để tiếp tục hành trình học tập
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Tên đăng nhập</Text>
                <View style={styles.inputBox}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#A6A6A6"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Nhập tên đăng nhập"
                    placeholderTextColor="#A6A6A6"
                    autoCapitalize="none"
                    autoComplete="username"
                    value={values.username}
                    onChangeText={handleChange("username")}
                    onBlur={handleBlur("username")}
                    style={styles.input}
                  />
                </View>
                {touched.username && !!errors.username && (
                  <Text style={styles.errorText}>{errors.username}</Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Mật khẩu</Text>
                <View style={styles.inputBox}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#A6A6A6"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Nhập mật khẩu"
                    placeholderTextColor="#A6A6A6"
                    secureTextEntry={secure}
                    autoCapitalize="none"
                    autoComplete="current-password"
                    value={values.password}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    style={styles.input}
                  />
                  <TouchableOpacity
                    onPress={() => setSecure((s) => !s)}
                    style={styles.showBtn}
                  >
                    <Ionicons
                      name={secure ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#153F57"
                    />
                  </TouchableOpacity>
                </View>
                {touched.password && !!errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              <Text
                style={styles.forgot}
                onPress={() => router.navigate("/(auth)/request.password")}
              >
                Forgot Password?
              </Text>

              {/* Nút đăng nhập + FAB */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSubmit as any}
                  disabled={loading}
                  style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color="#43B7FA" size="small" />
                      <Text style={styles.primaryText}>Đang đăng nhập...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContainer}>
                      <Ionicons
                        name="log-in-outline"
                        size={20}
                        color="#43B7FA"
                      />
                      <Text style={styles.primaryText}>Đăng nhập</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => router.navigate("/(auth)/signup")}
                  style={styles.fab}
                >
                  <Ionicons name="create-outline" size={20} color="#E7FFF4" />
                </TouchableOpacity>
              </View>

              <View style={{ marginTop: 10, paddingHorizontal: 14 }}>
                <TextBetweenLine color="#7A7A7A" paddingHorizontal={50} />
              </View>

              <Text
                style={styles.createLink}
                onPress={() => router.navigate("/(auth)/signup")}
              >
                Create Account
              </Text>

              {/* Google button */}
              <SocialButton containerStyle={{ paddingHorizontal: 20 }} />
            </View>
          </View>
        )}
      </Formik>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, paddingHorizontal: 24 },

  hero: { alignItems: "center", marginTop: 60, marginBottom: 20 },
  logoWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#84C5F3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  brand: {
    fontSize: 32,
    letterSpacing: 1,
    color: "#111",
    fontFamily: Platform.OS === "ios" ? "Times New Roman" : "serif",
  },

  welcomeContainer: { alignItems: "center", marginBottom: 30 },
  welcomeTitle: { fontSize: 24, fontWeight: "700", color: "#1D1D1D" },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },

  form: { marginTop: 8 },
  field: { marginTop: 18, marginBottom: 6, marginHorizontal: 20 },
  label: { fontSize: 14, color: LABEL, marginBottom: 6, fontWeight: "600" },
  inputBox: {
    height: 44,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 0, fontSize: 15, color: "#000" },
  showBtn: { position: "absolute", right: 10 },

  forgot: {
    alignSelf: "flex-end",
    marginTop: 6,
    marginRight: 40,
    fontSize: 11,
    color: LABEL,
    marginBottom: 20,
  },

  actionsRow: { marginTop: 16, flexDirection: "row", alignItems: "center" },
  primaryBtn: {
    flex: 1,
    height: 46,
    backgroundColor: "#0F3D57",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 20,
    marginRight: 6,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  primaryText: { color: "#43B7FA", fontSize: 16, fontWeight: "800" },

  buttonContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  loadingContainer: { flexDirection: "row", alignItems: "center", gap: 8 },

  fab: {
    width: 34,
    height: 34,
    borderRadius: 22,
    backgroundColor: "#1B7A6C",
    alignItems: "center",
    justifyContent: "center",
  },

  createLink: {
    textAlign: "center",
    fontSize: 16,
    color: LABEL,
    marginTop: 14,
    marginBottom: 44,
  },

  errorText: { color: "#D64545", fontSize: 12, marginTop: 6 },
});

export default Login;
