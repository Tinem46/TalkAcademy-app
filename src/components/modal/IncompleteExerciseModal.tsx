import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

interface IncompleteExerciseModalProps {
  visible: boolean;
  score: number;
  onRetry: () => void;
  onBackToCategory: () => void;
  onClose: () => void;
}

export default function IncompleteExerciseModal({
  visible,
  score,
  onRetry,
  onBackToCategory,
  onClose,
}: IncompleteExerciseModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </Pressable>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="alert-circle" size={64} color="#F59E0B" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Bài tập chưa hoàn thành</Text>

          {/* Score */}
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Điểm của bạn:</Text>
            <Text style={styles.scoreValue}>{score}/100</Text>
          </View>

          {/* Message */}
          <Text style={styles.message}>
            Bạn cần đạt ít nhất 80 điểm để hoàn thành bài tập này. Hãy thử lại
            để cải thiện kết quả của bạn nhé!
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable style={styles.retryButton} onPress={onRetry}>
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </Pressable>

            <Pressable style={styles.backButton} onPress={onBackToCategory}>
              <Ionicons name="list" size={20} color="#00BFFF" />
              <Text style={styles.backButtonText}>Chọn bài khác</Text>
            </Pressable>
          </View>

          {/* View Analysis button */}
          <Pressable style={styles.viewAnalysisButton} onPress={onClose}>
            <Text style={styles.viewAnalysisText}>Xem phân tích</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "center",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#F59E0B",
  },
  message: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  retryButton: {
    backgroundColor: "#00BFFF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#00BFFF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  backButtonText: {
    color: "#00BFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  viewAnalysisButton: {
    width: "100%",
    paddingVertical: 8,
    marginTop: 8,
  },
  viewAnalysisText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
