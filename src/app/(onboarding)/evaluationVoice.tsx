import ShareButton from "@/components/button/share.button";
import ProgressBar from "@/components/onboarding/progressBar";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const rows = [
  { id: "speed", label: "Tốc độ", value: 0.35 },
  { id: "intonation", label: "Ngữ điệu", value: 0.7 },
  { id: "energy", label: "Năng lượng", value: 0.55 },
  { id: "pronunciation", label: "Phát âm", value: 0.2 },
];

const EvaluationScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.safe}>
        <Text style={styles.title}>ĐÁNH GIÁ</Text>

        <View style={{ gap: 18, marginTop: 16 }}>
          {rows.map((r) => (
            <View key={r.id}>
              <View style={styles.rowLabel}>
                <Text style={styles.metricLabel}>{r.label}</Text>
              </View>
              <View style={{ marginBottom: 36 }}>
                <ProgressBar
                  progress={r.value}
                  height={36}
                  trackColor="#EEF1F4"
                  tintColor="#58BDF8"
                  rounded
                  showLabel={true}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <ShareButton
            title="Làm lại nào!"
            onPress={() => {
              router.push("/(onboarding)/voiceCheck");
            }}
            buttonStyle={{
              height: 44,
              width: 135,
              backgroundColor: "white",
              borderWidth: 1,
              borderColor: "black",
            }}
            textStyle={{ color: "black", fontSize: 16 }}
          />
          <View style={{ flex: 1 }} />
          <ShareButton
            title="Tiếp tục"
            onPress={() => {
              router.push("/(onboarding)/pathScreen");
            }}
            buttonStyle={styles.cta}
            textStyle={{ color: "black", fontSize: 16 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 46,
    fontWeight: "900",
    color: "#0f3d2e",
    textAlign: "center",
    marginBottom: 60,
    marginTop: 16,
  },
  rowLabel: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  metricLabel: { color: "#273B47", fontWeight: "700", fontSize: 20 },
  metricPct: { marginLeft: 8, color: "#7A8B96" },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "auto",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  cta: {
    height: 44,
    width: 110,
  },
});
export default EvaluationScreen;
