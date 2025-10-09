import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

type Props = {
  appName?: string; // "Legion"
  title?: string; // override toàn bộ câu hỏi nếu muốn
  style?: StyleProp<ViewStyle>; // margin ngoài thẻ
  allowLabel?: string; // "Cho phép"
  denyLabel?: string; // "Không cho phép"
  loading?: boolean; // đang xử lý xin quyền
  onAllow: () => void;
  onDeny?: () => void;
};

const BORDER = "#000000ff";
const TEXT = "#1A2B39";
const BLUE = "#49A0D7";
const BLUE_BG = "#E8F3FF";
const GREY = "#8C95A3";
const GREY_BG = "#F2F4F7";

const NotificationPermissionCard: React.FC<Props> = ({
  appName = "Legion",
  title,
  style,
  allowLabel = "Cho phép",
  denyLabel = "Không cho phép",
  loading = false,
  onAllow,
  onDeny,
}) => {
  const question = title ?? `Cho phép ${appName} gửi thông báo ?`;

  return (
    <View style={[styles.wrap, style]}>
      {/* Icon chuông */}
      <View style={styles.icon}>
        <Ionicons name="notifications-outline" size={22} color="#2E3E32" />
      </View>

      {/* Câu hỏi */}
      <Text style={styles.title}>
        {`Cho phép `}
        <Text style={styles.appName}>{appName}</Text>
        {` gửi thông báo ?`}
      </Text>

      {/* Nút hành động */}
      <View style={styles.actions}>
        <Pressable
          onPress={onAllow}
          disabled={loading}
          style={({ pressed }) => [
            styles.btnPrimary,
            pressed && styles.pressed,
          ]}
        >
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.btnPrimaryText}>{allowLabel}</Text>
          )}
        </Pressable>

        <Pressable
          onPress={onDeny}
          disabled={loading}
          style={({ pressed }) => [styles.btnGhost, pressed && styles.pressed]}
        >
          <Text style={styles.btnGhostText}>{denyLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#FFFFFF",

    // bóng rất nhẹ như mock
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2EE",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    textAlign: "center",
    color: TEXT,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
  },
  appName: {
    fontWeight: "700",
  },
  actions: {
    gap: 12,
  },

  // Primary = viền xanh, nền xanh nhạt và bóng như ảnh
  btnPrimary: {
    height: 44,
    marginHorizontal: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BLUE_BG,
    borderWidth: 1.5,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  btnPrimaryText: {
    color: BLUE,
    fontWeight: "700",
    fontSize: 15,
  },

  // Ghost xám nhạt
  btnGhost: {
    height: 44,
    marginHorizontal: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREY_BG,
    borderWidth: 1.5,
    borderColor: "black",
    marginBottom: 32,
  },
  btnGhostText: {
    color: GREY,
    fontWeight: "600",
    fontSize: 15,
  },

  pressed: { opacity: 0.9 },
});

export default NotificationPermissionCard;
