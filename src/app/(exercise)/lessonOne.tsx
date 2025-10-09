import PromptCard from "@/components/card/promptCard";
import ResultCard from "@/components/card/resultCard";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ExerciseScreen from "./exerciseScreen";

export default function LessonOne({
  onBack,
  onNext,
}: {
  onBack?: () => void;
  onNext?: () => void;
}) {
  const [hasResult, setHasResult] = useState(false);

  const paragraph =
    "Mỗi buổi sáng là một khởi đầu mới. Ánh nắng chiếu qua ô cửa sổ làm bừng tỉnh cả căn phòng. Một tách cà phê nóng giúp tôi tỉnh táo và sẵn sàng cho ngày mới. Tôi luôn tin rằng một buổi sáng tốt sẽ dẫn đến một ngày tuyệt vời.";

  const handleRecord = () => {
    // TODO: start recording + evaluate
    setTimeout(() => setHasResult(true), 300);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ExerciseScreen
        header={{ title: "Bài 2", headline: "Đọc", subline: "/naɪt/", onBack }}
        footer={
          hasResult ? (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                style={styles.ghostBtn}
                onPress={() => setHasResult(false)}
              >
                <Text style={styles.ghostText}>Làm lại nào!</Text>
              </Pressable>
              <Pressable style={styles.primaryBtn} onPress={onNext}>
                <Text style={styles.primaryText}>Tiếp tục nhé</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={[
                styles.primaryBtn,
                { minWidth: 200, alignSelf: "center" },
              ]}
              onPress={handleRecord}
            >
              <Text style={styles.primaryText}>Bắt đầu ghi</Text>
            </Pressable>
          )
        }
      >
        {/* --- Main content --- */}
        <PromptCard
          text={paragraph}
          variant={hasResult ? "success" : "default"}
        />

        <View style={styles.micBox}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/727/727245.png",
            }}
            style={{ width: 88, height: 88, opacity: 0.9 }}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.tapToSpeak}>Bấm để nói</Text>

        {/* {hasResult && ( */}
          <View style={{ marginTop: 12 }}>
            <ResultCard
              score={70}
              message="Bạn làm rất tốt nhưng tốc độ vẫn còn chưa ổn định. Hãy cố gắng thêm nữa nhé!"
            />
          </View>
        {/* )} */}
      </ExerciseScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  micBox: { alignItems: "center", marginTop: 18, marginBottom: 10 },
  tapToSpeak: {
    textAlign: "center",
    color: "#343C3F",
    fontWeight: "800",
    fontSize: 18,
    marginBottom: 10,
  },

  primaryBtn: {
    flex: 1,
    backgroundColor: "#58BDF8",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  primaryText: { color: "#1E3A56", fontWeight: "900", fontSize: 16 },

  ghostBtn: {
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#C7CFD7",
    alignItems: "center",
    justifyContent: "center",
  },
  ghostText: { color: "#0F3D57", fontWeight: "800" },
});
