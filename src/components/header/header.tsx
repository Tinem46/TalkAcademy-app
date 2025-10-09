import { ENHANCED_COLORS } from "@/app/utils/constant";
import { AnimationUtils } from "@/utils/animations";
import { Feather } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

const CustomHeader = () => {
  const pathname = usePathname();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    // Entrance animation for header
    Animated.parallel([
      AnimationUtils.fadeIn(fadeAnim, 400),
      AnimationUtils.slideInFromTop(slideAnim, 400),
    ]).start();
  }, []);

  // Các path chính không hiển thị nút back
  const mainScreens = ["/", "/search", "/account"];
  // Các route auth không hiển thị icon
  const authRoutes = [
    "/login",
    "/signup",
    "/forgot.password",
    "/request.password",
    "/verify",
    "/intro",
  ];
  const isMainScreen = mainScreens.includes(pathname);
  const isAuthScreen = authRoutes.includes(pathname);
  
  if (isAuthScreen) {
    return (
      <Animated.View 
        style={[
          styles.headerContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {isMainScreen ? (
          <TouchableOpacity
            style={styles.leftIcon}
            onPress={() => router.push("/")}
          >
            <Feather name="home" size={24} color={ENHANCED_COLORS.secondary[500]} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.leftIcon}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color={ENHANCED_COLORS.secondary[500]} />
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  }
  
  return (
    <Animated.View 
      style={[
        styles.headerContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Enhanced header with subtle background */}
      <View style={styles.headerBackground} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    height: 100,
    backgroundColor: "transparent",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10, // Giảm zIndex để không đè lên progress bar
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent", // Thay đổi thành transparent
    opacity: 1,
    // Subtle shadow
    shadowColor: ENHANCED_COLORS.secondary[500],
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  leftIcon: {
    paddingRight: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: ENHANCED_COLORS.secondary[50],
    // Subtle shadow
    shadowColor: ENHANCED_COLORS.secondary[500],
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    minWidth: 44, // Ensure minimum touchable area
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGroup: {
    flexDirection: "row",
    gap: 15,
  },
  iconButton: {
    marginLeft: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: ENHANCED_COLORS.secondary[50],
    // Subtle shadow
    shadowColor: ENHANCED_COLORS.secondary[500],
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    minWidth: 44, // Ensure minimum touchable area
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CustomHeader;
