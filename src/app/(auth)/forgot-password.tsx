import { forgotPasswordAPI } from "@/app/utils/apiall";
import ShareButton from "@/components/button/share.button";
import { responsiveSpacing } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Toast.show("Vui lòng nhập email!", {
        position: Toast.positions.TOP,
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show("Email không hợp lệ!", {
        position: Toast.positions.TOP,
      });
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Sending forgot password request...');
      
      const response = await forgotPasswordAPI(email);
      console.log('✅ Forgot password response:', response);
      
      setEmailSent(true);
      Toast.show("Đã gửi mã OTP đến email của bạn!", {
        position: Toast.positions.TOP,
      });
      
    } catch (error: any) {
      console.error('❌ Forgot password error:', error);
      
      let errorMessage = "Có lỗi xảy ra. Vui lòng thử lại!";
      
      if (error?.response?.status === 404) {
        errorMessage = "Email không tồn tại trong hệ thống!";
      } else if (error?.response?.status === 400) {
        errorMessage = "Email không hợp lệ!";
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

  const handleGoToResetPassword = () => {
    router.push({
      pathname: "/(auth)/reset-password",
      params: { email: email }
    });
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header */}


        <View style={styles.content}>
          {!emailSent ? (
            <>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed-outline" size={80} color="#2FA6F3" />
              </View>

              {/* Title */}
              <Text style={styles.title}>Quên mật khẩu?</Text>
              <Text style={styles.subtitle}>
                Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
              </Text>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              {/* Send Button */}
              <ShareButton
                title={loading ? "Đang gửi..." : "Gửi mã OTP"}
                onPress={handleForgotPassword}
                buttonStyle={[
                  styles.sendButton,
                  loading && { opacity: 0.7 }
                ]}
                textStyle={styles.sendButtonText}
                disabled={loading}
              />

              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#2FA6F3" />
                  <Text style={styles.loadingText}>Đang gửi email...</Text>
                </View>
              )}
            </>
          ) : (
            <>
              {/* Success Icon */}
              <View style={styles.iconContainer}>
                <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
              </View>

              {/* Success Message */}
              <Text style={styles.title}>Email đã được gửi!</Text>
              <Text style={styles.subtitle}>
                Chúng tôi đã gửi mã OTP đến email{" "}
                <Text style={styles.emailText}>{email}</Text>
              </Text>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <ShareButton
                  title="Đặt lại mật khẩu"
                  onPress={handleGoToResetPassword}
                  buttonStyle={styles.resetButton}
                  textStyle={styles.resetButtonText}
                />
                
                <Pressable
                  onPress={() => setEmailSent(false)}
                  style={styles.resendButton}
                >
                  <Text style={styles.resendText}>Gửi lại mã OTP</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: responsiveSpacing(66),
  },
  keyboardView: {
    flex: 1,
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
    marginBottom: responsiveSpacing(40),
  },
  emailText: {
    fontWeight: "600",
    color: "#2FA6F3",
  },
  inputContainer: {
    marginBottom: responsiveSpacing(24),
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
  sendButton: {
    backgroundColor: "#2FA6F3",
    borderRadius: 12,
    paddingVertical: responsiveSpacing(16),
    alignItems: "center",
    marginBottom: responsiveSpacing(16),
  },
  sendButtonText: {
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
  buttonContainer: {
    marginTop: responsiveSpacing(32),
  },
  resetButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: responsiveSpacing(16),
    alignItems: "center",
    marginBottom: responsiveSpacing(16),
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  resendButton: {
    alignItems: "center",
    paddingVertical: responsiveSpacing(12),
  },
  resendText: {
    color: "#2FA6F3",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ForgotPasswordScreen;
