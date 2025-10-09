import ShareButton from "@/components/button/share.button";
import { useMascotManager } from "@/components/mascotWithBubble/MascotManager";
import { router } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";

const WelcomePage = () => {
  const handleStart = () => router.push("/(auth)/signup");
  const handleLogin = () => router.push("/(auth)/login");
  const { getMascotByType } = useMascotManager();
  const mascot = getMascotByType('logoFB');

  return (
    <View style={styles.container}>
      {/* Nội dung giữa */}
      <View style={styles.content}>
      <Image source={mascot.source} style={styles.logo} />

        <Text style={styles.title}>TALKADEMY</Text>
        <Text style={styles.subtitle}>
          Cùng Talkademy khám phá sức mạnh ngôn ngữ Việt – và thắp sáng tiếng
          nói của riêng bạn!
        </Text>
      </View>

      {/* Buttons dưới cùng */}
      <View style={styles.buttonContainer}>
        <ShareButton
          title="Bắt đầu ngay"
          variant="primary"
          size="lg"
          block
          onPress={handleStart}
          textStyle={{ fontSize: 20, color: "black" }}
        />

        <ShareButton
          title="Bạn đã có tài khoản"
          variant="secondary"
          size="lg"
          block
          onPress={handleLogin}
          textStyle={{ fontSize: 20, color: "black" }}
        />
      </View>
    </View>
  );
};

export default WelcomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "600",
    fontFamily: "serif",
    letterSpacing: 2,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginHorizontal: 24,
  },
  buttonContainer: {
    width: "100%",
    gap: 14,
    marginBottom: 36,
  },
});
