import {
    getResponsiveShadow,
    responsiveBorderRadius,
    responsiveFontSize,
    responsiveSize,
    responsiveSpacing
} from "@/utils/responsive";
import React from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "lg" | "md" | "sm";

interface ShareButtonProps {
  title: string;
  onPress: () => void;
  leftIcon?: React.ReactNode; // icon bên trái
  rightIcon?: React.ReactNode; // icon bên phải
  /** Giữ tương thích ngược với code cũ */
  icon?: React.ReactNode;

  /** Tuỳ chọn style bổ sung */
  textStyle?: StyleProp<TextStyle>;
  buttonStyle?: StyleProp<ViewStyle>; // style của container
  pressStyle?: StyleProp<ViewStyle>; // alias cũ -> sẽ merge vào container

  /** State */
  loading?: boolean;
  disabled?: boolean;

  /** Tuỳ biến nhanh */
  variant?: Variant; // "primary" | "secondary"
  size?: Size; // "lg" | "md" | "sm"
  block?: boolean; // full width
}

const COLORS = {
  primaryBg: "#43B7FA",
  primaryText: "#FFFFFF",
  primaryText2: "black",
  secondaryBg: "#FFFFFF",
  secondaryBorder: "#E7E7E7",
  secondaryText: "#1C8B5A",
};

const ShareButton: React.FC<ShareButtonProps> = ({
  title,
  onPress,
  leftIcon,
  rightIcon,
  icon, // giữ tương thích ngược
  textStyle,
  buttonStyle,
  pressStyle,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "lg",
  block = true,
}) => {
  // Map variant -> màu container / text
  const isPrimary = variant === "primary";
  const containerVariantStyle: ViewStyle = isPrimary
    ? styles.primary
    : styles.secondary;

  const textColor = isPrimary ? COLORS.primaryText : COLORS.secondaryText;

  // Map size
  const sizeStyle =
    size === "lg"
      ? styles.sizeLg
      : size === "md"
      ? styles.sizeMd
      : styles.sizeSm;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        containerVariantStyle,
        sizeStyle,
        block && { alignSelf: "stretch", width: "100%" },
        pressed && { opacity: 0.9 },
        pressStyle,
        buttonStyle, // merge thêm style từ ngoài
      ]}
    >
      {/* Nội dung */}
      {leftIcon || icon ? (
        <View style={styles.iconWrap}>{leftIcon || icon}</View>
      ) : null}

      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }, textStyle]}>
          {title}
        </Text>
      )}

      {rightIcon ? <View style={styles.iconWrap}>{rightIcon}</View> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: responsiveSpacing(10),
    paddingHorizontal: responsiveSpacing(22),
    borderRadius: responsiveBorderRadius(16),

    // bóng đổ hợp lệ RN
    ...getResponsiveShadow({
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    }),
  },

  primary: {
    backgroundColor: COLORS.primaryBg,
  },
  secondary: {
    backgroundColor: COLORS.secondaryBg,
    borderWidth: responsiveSize(1),
    borderColor: COLORS.secondaryBorder,
  },

  sizeLg: { 
    height: responsiveSize(56), 
    borderRadius: responsiveBorderRadius(16) 
  },
  sizeMd: { 
    height: responsiveSize(48), 
    borderRadius: responsiveBorderRadius(12) 
  },
  sizeSm: { 
    height: responsiveSize(40), 
    borderRadius: responsiveBorderRadius(10) 
  },

  text: {
    fontSize: responsiveFontSize(18),
    fontWeight: "700",
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ShareButton;
