import { ENHANCED_COLORS } from "@/app/utils/constant";
import {
  isLargeScreen,
  isSmallScreen,
  responsiveBorderRadius,
  responsiveIconSize,
  responsiveSize,
  responsiveSpacing
} from "@/utils/responsive";
import Entypo from "@expo/vector-icons/Entypo";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const INACTIVE = ENHANCED_COLORS.neutral[400]; // Inactive icon color

function iconFor(
  routeName: string
): React.ComponentProps<typeof Entypo>["name"] {
  switch (routeName) {
    case "index":
    case "home":
      return "home";
    case "notification":
    case "notifications":
      return "bell";
    case "account":
    case "saved":
      return "bookmark";
    case "profile":
    case "profiles":
      return "pie-chart";
    case "stats":
      return "bar-graph";
    default:
      return "dot-single";
  }
}


// Simple tab component - no complex animations
const TabButton = ({ 
  route, 
  isFocused, 
  options, 
  navigation 
}: {
  route: any;
  isFocused: boolean;
  options: any;
  navigation: any;
}) => {
  const handlePress = () => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name as never);
    }
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      onPress={handlePress}
      style={styles.tabBtn}
      activeOpacity={0.7}
    >
      <View style={styles.tabContent}>
        <Entypo
          name={iconFor(route.name)}
          size={responsiveIconSize(isSmallScreen() ? 20 : isLargeScreen() ? 24 : 22)}
          color={isFocused ? ENHANCED_COLORS.primary[500] : INACTIVE}
        />
      </View>
    </TouchableOpacity>
  );
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          return (
            <TabButton
              key={route.key}
              route={route}
              isFocused={isFocused}
              options={options}
              navigation={navigation}
            />
          );
        })}
      </View>
    </View>
  );
}

const TabLayout = () => {
  return (
    <View style={{ flex: 1}}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ 
          headerShown: false,
          tabBarStyle: { display: 'none' } // Hide default tab bar
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Trang chủ" }} />
        <Tabs.Screen name="notification" options={{ title: "Thông báo" }} />
        <Tabs.Screen name="account" options={{ title: "Đã lưu" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      </Tabs>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
 
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: 'transparent',
  },
  tabBarContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: responsiveSize(50),
    backgroundColor: ENHANCED_COLORS.background.primary,
    borderTopLeftRadius: responsiveBorderRadius(12),
    borderTopRightRadius: responsiveBorderRadius(12),
    // Simple shadow
    shadowColor: ENHANCED_COLORS.neutral[900],
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -1 },
    elevation: 3,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: responsiveSpacing(8),
    paddingHorizontal: responsiveSpacing(4),
    minHeight: responsiveSize(50),
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    width: responsiveSize(32),
    height: responsiveSize(32),
  },
});

export default TabLayout;
