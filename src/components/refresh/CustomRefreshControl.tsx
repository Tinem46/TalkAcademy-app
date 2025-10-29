import MascotWithBubble from "@/components/mascotWithBubble/mascotWithBubble";
import { responsiveSize } from "@/utils/responsive";
import React, { useCallback, useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

interface CustomRefreshControlProps {
  refreshing: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
  refreshMessage?: string;
}

const CustomRefreshControl: React.FC<CustomRefreshControlProps> = ({
  refreshing,
  onRefresh,
  children,
  refreshMessage = "Đang làm mới dữ liệu...",
}) => {
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  const startRefreshingAnimation = useCallback(() => {
    // Fade in
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnimation]);

  const stopRefreshingAnimation = useCallback(() => {
    // Fade out
    Animated.timing(fadeAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnimation]);

  useEffect(() => {
    if (refreshing) {
      startRefreshingAnimation();
    } else {
      stopRefreshingAnimation();
    }
  }, [refreshing, startRefreshingAnimation, stopRefreshingAnimation]);

  return (
    <View style={styles.container}>
      {children}

      {refreshing && (
        <Animated.View
          style={[
            styles.refreshOverlay,
            {
              opacity: fadeAnimation,
            },
          ]}
        >
          <View style={styles.refreshContent}>
            <MascotWithBubble
              message={refreshMessage}
              mascotSource={require("@/assets/Mascot/Asset 1longlanh.png")}
              mascotPosition={{
                left: responsiveSize(-200),
                bottom: responsiveSize(250),
              }}
              bubblePosition={{
                left: responsiveSize(-50),
                top: responsiveSize(170),
              }}
              bubbleStyle={{
                height: responsiveSize(60),
                width: responsiveSize(200),
              }}
            />
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  refreshOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  refreshContent: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
});

export default CustomRefreshControl;
