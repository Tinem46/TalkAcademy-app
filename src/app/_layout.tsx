import CustomHeader from "@/components/header/header";
import { AppProvider } from "@/context/app.context";
import { OnboardingProvider } from "@/context/onboarding.context";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { ErrorBoundaryProps, Stack } from "expo-router";
import { Button, StatusBar, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootSiblingParent } from "react-native-root-siblings";
import { SafeAreaView } from "react-native-safe-area-context";
import { APP_COLOR } from "./utils/constant";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingHorizontal: 10, gap: 15 }}>
        <View
          style={{
            backgroundColor: "#333",
            padding: 10,
            borderRadius: 3,
            gap: 10,
          }}
        >
          <Text style={{ color: "red", fontSize: 20 }}>
            Something went wrong
          </Text>
          <Text style={{ color: "#fff" }}>{error.message}</Text>
        </View>
        <Button title="Try Again ?" onPress={retry} />
      </View>
    </SafeAreaView>
  );
}

const RootLayout = () => {
  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "white",
    },
  };
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <RootSiblingParent>
        <AppProvider>
          <OnboardingProvider>
            <SafeAreaView style={{ flex: 1 }}>
            <ThemeProvider value={navTheme}>
              <CustomHeader />
              <Stack
                screenOptions={{
                  headerTintColor: APP_COLOR.ORANGE,
                  headerStyle: {
                    backgroundColor: "white",
                  },
                  headerShown: false,
                }}
              ></Stack>
            </ThemeProvider>
            </SafeAreaView>
          </OnboardingProvider>
        </AppProvider>
      </RootSiblingParent>
    </GestureHandlerRootView>
  );
};
export default RootLayout;
