import { resetPasswordAPI } from "@/app/utils/apiall";
import ShareButton from "@/components/button/share.button";
import { responsiveSpacing } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import Toast from "react-native-root-toast";
import { SafeAreaView } from "react-native-safe-area-context";

const ResetPasswordScreen = () => {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = async () => {
    // Validation
    if (!otp.trim()) {
      Toast.show("Vui lòng nhập mã OTP!", {
        position: Toast.positions.TOP,
      });
      return;
    }

    if (!newPassword.trim()) {
      Toast.show("Vui lòng nhập mật khẩu mới!", {
        position: Toast.positions.TOP,
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show("Mật khẩu phải có ít nhất 6 ký tự!", {
        position: Toast.positions.TOP,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show("Mật khẩu xác nhận không khớp!", {
        position: Toast.positions.TOP,
      });
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Resetting password...');
      
      const response = await resetPasswordAPI(email || "", otp, newPassword);
      console.log('✅ Reset password response:', response);
      
      Toast.show("Đặt lại mật khẩu thành công!", {
        position: Toast.positions.TOP,
      });
      
      // Navigate to login screen
      router.replace("/(auth)/login");
      
    } catch (error: any) {
      console.error('❌ Reset password error:', error);
      
      let errorMessage = "Có lỗi xảy ra. Vui lòng thử lại!";
      
      if (error?.response?.status === 400) {
        errorMessage = "Mã OTP không đúng hoặc đã hết hạn!";
      } else if (error?.response?.status === 404) {
        errorMessage = "Email không tồn tại trong hệ thống!";
      } else if (error?.response?.status === 500) {
        errorMessage = "Lỗi máy chủ. Vui lòng thử lại sau!";
      }
      
      Toast.show(errorMessage, {
        position: Toast.positions.TOP,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForgotPassword = () => {
    router.back();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBackToForgotPassword} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2FA6F3" />
          </Pressable>
          <Text style={styles.headerTitle}>Đặt lại mật khẩu</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="key-outline" size={80} color="#2FA6F3" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Đặt lại mật khẩu</Text>
          <Text style={styles.subtitle}>
            Nhập mã OTP và mật khẩu mới để hoàn tất việc đặt lại mật khẩu
          </Text>

          {/* Email Display */}
          <View style={styles.emailContainer}>
            <Text style={styles.emailLabel}>Email:</Text>
            <Text style={styles.emailText}>{email}</Text>
          </View>

          {/* OTP Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mã OTP</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mã OTP 6 số"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              editable={!loading}
            />
          </View>

          {/* New Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mật khẩu mới</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <Pressable onPress={togglePasswordVisibility} style={styles.eyeButton}>
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="#6B7280" 
                />
              </Pressable>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <Pressable onPress={toggleConfirmPasswordVisibility} style={styles.eyeButton}>
                <Ionicons 
                  name={showConfirmPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="#6B7280" 
                />
              </Pressable>
            </View>
          </View>

          {/* Reset Button */}
          <ShareButton
            title={loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            onPress={handleResetPassword}
            buttonStyle={[
              styles.resetButton,
              loading && { opacity: 0.7 }
            ]}
            textStyle={styles.resetButtonText}
            disabled={loading}
          />

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2FA6F3" />
              <Text style={styles.loadingText}>Đang xử lý...</Text>
            </View>
          )}

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              • Mã OTP có hiệu lực trong 10 phút
            </Text>
            <Text style={styles.helpText}>
              • Mật khẩu phải có ít nhất 6 ký tự
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(16),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: responsiveSpacing(8),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C5530",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: responsiveSpacing(24),
    paddingTop: responsiveSpacing(40),
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: responsiveSpacing(32),
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2C5530",
    textAlign: "center",
    marginBottom: responsiveSpacing(12),
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: responsiveSpacing(32),
  },
  emailContainer: {
    backgroundColor: "#F8F9FA",
    padding: responsiveSpacing(16),
    borderRadius: 12,
    marginBottom: responsiveSpacing(24),
    flexDirection: "row",
    alignItems: "center",
  },
  emailLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: responsiveSpacing(8),
  },
  emailText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C5530",
  },
  inputContainer: {
    marginBottom: responsiveSpacing(20),
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C5530",
    marginBottom: responsiveSpacing(8),
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(14),
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(14),
    fontSize: 16,
  },
  eyeButton: {
    padding: responsiveSpacing(12),
  },
  resetButton: {
    backgroundColor: "#2FA6F3",
    borderRadius: 12,
    paddingVertical: responsiveSpacing(16),
    alignItems: "center",
    marginTop: responsiveSpacing(16),
    marginBottom: responsiveSpacing(24),
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: responsiveSpacing(16),
  },
  loadingText: {
    marginLeft: responsiveSpacing(8),
    fontSize: 14,
    color: "#6B7280",
  },
  helpContainer: {
    marginTop: responsiveSpacing(24),
  },
  helpText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: responsiveSpacing(4),
  },
});

export default ResetPasswordScreen;
