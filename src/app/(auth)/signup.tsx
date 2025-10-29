import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Formik } from "formik";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-root-toast";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Yup from "yup";

import SocialButton from "@/components/button/social.button";
import TextBetweenLine from "@/components/text/textline";
import { registerApi, verifyOtpAPI } from "../utils/apiall";

// ===== Validation theo API mới =====
const SignUpSchema = Yup.object({
  username: Yup.string()
    .min(3, "Tên đăng nhập tối thiểu 3 ký tự")
    .max(20, "Tên đăng nhập tối đa 20 ký tự")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"
    )
    .required("Tên đăng nhập là bắt buộc"),
  email: Yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  password: Yup.string()
    .min(6, "Mật khẩu tối thiểu 6 ký tự")
    .required("Mật khẩu là bắt buộc"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Mật khẩu không khớp")
    .required("Xác nhận mật khẩu là bắt buộc"),
});

const SignUpPage = () => {
  const [loading, setLoading] = useState(false);
  const [seePass, setSeePass] = useState(false);
  const [seeRepass, setSeeRepass] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Toast.show("Vui lòng nhập mã OTP gồm 6 số", {
        position: Toast.positions.TOP,
      });
      return;
    }

    try {
      setVerifyingOtp(true);
      const res = (await verifyOtpAPI(registeredEmail, otp)) as any;
      console.log("Verify OTP response:", res);

      const isSuccess = res?.statusCode === 201 || res?.statusCode === 200;

      if (isSuccess) {
        Toast.show("Xác thực thành công!", {
          position: Toast.positions.TOP,
        });

        // Lưu token vào AsyncStorage nếu có
        if (res?.data?.accessToken) {
          await AsyncStorage.setItem("access_token", res.data.accessToken);
          await AsyncStorage.setItem(
            "refreshToken",
            res.data.refreshToken || ""
          );
          await AsyncStorage.setItem(
            "accountType",
            res.data?.accountType || "TRIAL"
          );
          await AsyncStorage.setItem(
            "trialExpiresAt",
            res.data?.trialExpiresAt || ""
          );

          // Lưu userId từ response
          const userId = res.data?.id || res.data?.user?.id || "1";
          await AsyncStorage.setItem("userId", String(userId));
          await AsyncStorage.setItem("accountId", String(userId)); // Giữ accountId để tương thích
          console.log("💾 Saved userId from verify:", userId);

          // Lưu username từ response
          const savedUsername =
            res.data?.username || res.data?.user?.username || registeredEmail;
          await AsyncStorage.setItem("username", savedUsername);
          console.log("💾 Saved username from verify:", savedUsername);
        }

        // Chuyển đến onboarding vì đây là lần đầu đăng ký
        router.replace("/(onboarding)/intro");
      } else {
        Toast.show(res?.message || "Mã OTP không chính xác!", {
          position: Toast.positions.TOP,
        });
      }
    } catch (err: any) {
      console.error("Verify OTP error:", err);

      let errorMessage = "Xác thực OTP thất bại!";
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      Toast.show(errorMessage, { position: Toast.positions.TOP });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSignUp = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      setLoading(true);

      const res = (await registerApi(
        username,
        email,
        password,
        "CUSTOMER"
      )) as any;
      console.log("Full response:", res);
      console.log("Response data:", res?.data);
      console.log("Status code:", res?.statusCode);
      console.log("Message:", res?.message);

      // Kiểm tra thành công dựa trên statusCode
      const isSuccess = res?.statusCode === 201;

      console.log("Is success:", isSuccess);

      if (isSuccess) {
        Toast.show(
          "Đăng ký thành công! Vui lòng kiểm tra email để nhận mã OTP.",
          {
            position: Toast.positions.TOP,
            duration: Toast.durations.LONG,
          }
        );

        // Lưu email và chuyển sang màn hình nhập OTP
        setRegisteredEmail(email);
        setShowOtpScreen(true);
      } else {
        console.log("Registration failed:", res);
        Toast.show(res?.message || "Đăng ký thất bại!", {
          position: Toast.positions.TOP,
        });
      }
    } catch (err: any) {
      console.error("Registration error:", err);

      // Xử lý các loại lỗi khác nhau
      let errorMessage = "Có lỗi xảy ra khi đăng ký!";

      if (err?.response?.status === 409) {
        errorMessage =
          "Email hoặc tên đăng nhập này đã được sử dụng. Vui lòng chọn thông tin khác.";
      } else if (err?.response?.status === 400) {
        errorMessage = "Thông tin không hợp lệ. Vui lòng kiểm tra lại.";
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      Toast.show(errorMessage, { position: Toast.positions.TOP });
    } finally {
      setLoading(false);
    }
  };

  // Render OTP Screen
  if (showOtpScreen) {
    return (
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              {/* Header */}
              <View style={styles.headerRow}>
                <View style={styles.logoWrap}>
                  <Ionicons name="mail-outline" size={30} color="#1D7BF2" />
                </View>
                <Text style={styles.brand}>TALKADEMY</Text>
              </View>

              {/* Welcome text */}
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeTitle}>Xác thực OTP</Text>
                <Text style={styles.welcomeSubtitle}>
                  Vui lòng nhập mã OTP đã được gửi đến email: {registeredEmail}
                </Text>
              </View>

              {/* OTP Input */}
              <View style={styles.form}>
                <View style={styles.field}>
                  <Text style={styles.label}>Mã OTP</Text>
                  <View style={styles.inputBox}>
                    <Ionicons
                      name="key-outline"
                      size={20}
                      color="#A6A6A6"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder="Nhập mã OTP 6 số"
                      placeholderTextColor="#A6A6A6"
                      keyboardType="number-pad"
                      maxLength={6}
                      value={otp}
                      onChangeText={setOtp}
                      style={styles.input}
                    />
                  </View>
                </View>

                {/* Verify button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleVerifyOtp}
                  disabled={verifyingOtp}
                  style={[styles.primaryBtn, verifyingOtp && { opacity: 0.7 }]}
                >
                  {verifyingOtp ? (
                    <View style={styles.loadingContainer}>
                      <Ionicons
                        name="hourglass-outline"
                        size={20}
                        color="#43B7FA"
                      />
                      <Text style={styles.primaryText}>Đang xác thực...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContainer}>
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={20}
                        color="#43B7FA"
                      />
                      <Text style={styles.primaryText}>Xác thực</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Back to signup */}
                <View style={styles.loginLinkContainer}>
                  <TouchableOpacity onPress={() => setShowOtpScreen(false)}>
                    <Text style={styles.loginLink}>← Quay lại đăng ký</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Formik
            validationSchema={SignUpSchema}
            initialValues={{
              username: "",
              email: "",
              password: "",
              confirmPassword: "",
            }}
            onSubmit={(v) => handleSignUp(v.username, v.email, v.password)}
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
                {/* Header logo + brand */}
                <View style={styles.headerRow}>
                  <View style={styles.logoWrap}>
                    <Ionicons name="mic-outline" size={30} color="#1D7BF2" />
                  </View>
                  <Text style={styles.brand}>TALKADEMY</Text>
                </View>

                {/* Welcome text */}
                <View style={styles.welcomeContainer}>
                  <Text style={styles.welcomeTitle}>Tạo tài khoản mới</Text>
                  <Text style={styles.welcomeSubtitle}>
                    Đăng ký để bắt đầu hành trình học tập của bạn
                  </Text>
                </View>

                {/* Google button */}
                <SocialButton
                  containerStyle={{ paddingHorizontal: 12, marginBottom: 30 }}
                />

                {/* Divider */}
                <View style={{ marginTop: 10 }}>
                  <TextBetweenLine color="#7A7A7A" />
                </View>

                {/* ===== Form fields ===== */}
                <View style={styles.form}>
                  {/* Username */}
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

                  {/* Email */}
                  <View style={styles.field}>
                    <Text style={styles.label}>Email</Text>
                    <View style={styles.inputBox}>
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color="#A6A6A6"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        placeholder="Nhập email của bạn"
                        placeholderTextColor="#A6A6A6"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        value={values.email}
                        onChangeText={handleChange("email")}
                        onBlur={handleBlur("email")}
                        style={styles.input}
                      />
                    </View>
                    {touched.email && !!errors.email && (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    )}
                  </View>

                  {/* Password */}
                  <View style={styles.field}>
                    <Text style={styles.label}>Mật Khẩu</Text>
                    <View style={[styles.inputBox, { position: "relative" }]}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color="#A6A6A6"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        placeholder="Nhập mật khẩu"
                        placeholderTextColor="#A6A6A6"
                        secureTextEntry={!seePass}
                        autoCapitalize="none"
                        autoComplete="new-password"
                        value={values.password}
                        onChangeText={handleChange("password")}
                        onBlur={handleBlur("password")}
                        style={styles.input}
                      />
                      <TouchableOpacity
                        onPress={() => setSeePass((s) => !s)}
                        style={styles.seeBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons
                          name={seePass ? "eye-off-outline" : "eye-outline"}
                          size={20}
                          color="#153F57"
                        />
                      </TouchableOpacity>
                    </View>
                    {touched.password && !!errors.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                  </View>

                  {/* Confirm Password */}
                  <View style={styles.field}>
                    <Text style={styles.label}>Nhập lại mật khẩu</Text>
                    <View style={[styles.inputBox, { position: "relative" }]}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color="#A6A6A6"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        placeholder="Nhập lại mật khẩu"
                        placeholderTextColor="#A6A6A6"
                        secureTextEntry={!seeRepass}
                        autoCapitalize="none"
                        autoComplete="new-password"
                        value={values.confirmPassword}
                        onChangeText={handleChange("confirmPassword")}
                        onBlur={handleBlur("confirmPassword")}
                        style={styles.input}
                      />
                      <TouchableOpacity
                        onPress={() => setSeeRepass((s) => !s)}
                        style={styles.seeBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons
                          name={seeRepass ? "eye-off-outline" : "eye-outline"}
                          size={20}
                          color="#153F57"
                        />
                      </TouchableOpacity>
                    </View>
                    {touched.confirmPassword && !!errors.confirmPassword && (
                      <Text style={styles.errorText}>
                        {errors.confirmPassword}
                      </Text>
                    )}
                  </View>

                  {/* Create account button */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleSubmit as any}
                    disabled={loading}
                    style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
                  >
                    {loading ? (
                      <View style={styles.loadingContainer}>
                        <Ionicons
                          name="hourglass-outline"
                          size={20}
                          color="#43B7FA"
                        />
                        <Text style={styles.primaryText}>Đang tạo...</Text>
                      </View>
                    ) : (
                      <View style={styles.buttonContainer}>
                        <Ionicons
                          name="person-add-outline"
                          size={20}
                          color="#43B7FA"
                        />
                        <Text style={styles.primaryText}>Tạo Tài khoản</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Login link */}
                  <View style={styles.loginLinkContainer}>
                    <Text style={styles.loginText}>Đã có tài khoản? </Text>
                    <TouchableOpacity
                      onPress={() => router.push("/(auth)/login")}
                    >
                      <Text style={styles.loginLink}>Đăng nhập</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Nút tròn nhỏ (tuỳ chọn) */}
                <TouchableOpacity style={styles.fab} onPress={() => {}}>
                  <Ionicons name="create-outline" size={20} color="#E7FFF4" />
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const BORDER = "#1D1D1D";
const LABEL = "#2F2F2F";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingBottom: 24,
  },

  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 28,
    marginBottom: 40,
    justifyContent: "center",
  },
  logoWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#84C5F3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  brand: {
    fontSize: 32,
    letterSpacing: 1,
    color: "#111",
    fontFamily: Platform.OS === "ios" ? "Times New Roman" : "serif",
  },

  // Welcome text
  welcomeContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1D1D1D",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },

  // Form
  form: {
    marginTop: 10,
  },
  field: {
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    color: LABEL,
    marginBottom: 6,
    fontWeight: "600",
  },
  inputBox: {
    height: 44,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: "center",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    fontSize: 15,
    color: "#000",
    paddingVertical: 0,
    flex: 1,
  },
  seeBtn: {
    position: "absolute",
    right: 10,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 6,
  },

  primaryBtn: {
    alignSelf: "center",

    height: 44,
    paddingHorizontal: 40,
    borderRadius: 12,
    backgroundColor: "#0F3D57",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    marginTop: 80,
  },
  primaryText: { color: "#43B7FA", fontSize: 16, fontWeight: "800" },

  // Button containers
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // Login link
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#666",
    fontSize: 14,
  },
  loginLink: {
    color: "#1D7BF2",
    fontSize: 14,
    fontWeight: "600",
  },

  errorText: {
    color: "#D64545",
    fontSize: 12,
    marginTop: 6,
  },

  // Floating action button (optional)
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1B7A6C",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SignUpPage;
