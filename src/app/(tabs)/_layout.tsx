import { ENHANCED_COLORS } from "@/app/utils/constant";
import {
  isLargeScreen,
  isSmallScreen,
  responsiveIconSize,
  responsiveSize,
  responsiveSpacing
} from "@/utils/responsive";
import Entypo from "@expo/vector-icons/Entypo";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
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
    case "package":
    case "saved":
      return "bookmark";
    case "profile":
    case "profiles":
      return "user";
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
          size={responsiveIconSize(isSmallScreen() ? 18 : isLargeScreen() ? 20 : 19)}
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
  // Force navigate to home tab when tabs layout mounts
  useFocusEffect(
    useCallback(() => {
      console.log('🏠 TabLayout mounted - ensuring home tab is focused');
    }, [])
  );

  return (
    <View style={{ flex: 1}}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ 
          headerShown: false,
          tabBarStyle: { display: 'none' } // Hide default tab bar
        }}
        initialRouteName="index" // Đảm bảo tab home được hiển thị đầu tiên
        backBehavior="initialRoute" // Luôn quay về tab đầu tiên khi back
      >
        <Tabs.Screen 
          name="index" 
          options={{ 
            title: "Trang chủ",
            tabBarLabel: "Trang chủ"
          }} 
        />
        <Tabs.Screen 
          name="notification" 
          options={{ 
            title: "Thông báo",
            tabBarLabel: "Thông báo"
          }} 
        />
        <Tabs.Screen 
          name="package" 
          options={{ 
            title: "Gói dịch vụ",
            tabBarLabel: "Gói dịch vụ"
          }} 
        />
        <Tabs.Screen 
          name="profile" 
          options={{ 
            title: "Profile",
            tabBarLabel: "Profile"
          }} 
        />
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
   
    backgroundColor: 'white',
    paddingBottom: 10, // Remove any bottom padding
  },
  tabBarContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: responsiveSize(60), // Reduced height
    backgroundColor: ENHANCED_COLORS.background.primary,
    // Subtle shadow
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
    paddingVertical: responsiveSpacing(6),
    paddingHorizontal: responsiveSpacing(2),
    minHeight: responsiveSize(40),
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    width: responsiveSize(32),
    height: responsiveSize(32),
  },
});

export default TabLayout;
