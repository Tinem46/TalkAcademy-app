import { router } from "expo-router";

import { useCurrentApp } from "@/context/app.context";
import { useEffect, useState } from "react";

import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkOnboardingStatusWithAccountsAPI, getUserSurveyAPI } from "./utils/apiall";
import { APP_FONT } from "./utils/constant";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();
const RootPage = () => {
  const { setAppState } = useCurrentApp();
  const [state, setState] = useState<any>();

  const [loaded, error] = Font.useFonts({
    [APP_FONT]: require("@/assets/font/OpenSans-Regular.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Lấy tất cả survey trước khi kiểm tra đăng nhập
        console.log('🔍 Fetching all surveys...');
        try {
          const allSurveys = await getUserSurveyAPI();
          await AsyncStorage.setItem('allSurveys', JSON.stringify(allSurveys));
          console.log('✅ All surveys cached:', allSurveys);
        } catch (surveyError) {
          console.log('⚠️ Could not fetch surveys, will check later:', surveyError);
        }

        const access_token = await AsyncStorage.getItem("access_token");
        if (!access_token) {
          // Không có token -> chưa đăng nhập
          router.replace("/(auth)/welcome");
          await SplashScreen.hideAsync();
          return;
        } else {
          // Có token -> đã đăng nhập, kiểm tra onboarding status
          console.log('🔍 Checking onboarding status on app start...');
          const username = await AsyncStorage.getItem('username');
          
          if (username) {
            try {
              // Sử dụng function mới để kiểm tra onboarding status với accounts và surveys
              const hasCompletedOnboarding = await checkOnboardingStatusWithAccountsAPI();
              
              if (hasCompletedOnboarding) {
                // Đã hoàn thành onboarding -> chuyển đến home
                console.log('✅ User has completed onboarding (found in both accounts and surveys), going to home');
                router.replace("/(tabs)");
              } else {
                // Chưa hoàn thành onboarding -> kiểm tra xem đây có phải là app restart không
                const isAppRestart = await AsyncStorage.getItem('app_restart_flag');
                
                if (isAppRestart === 'true') {
                  // Đây là app restart -> xóa session và về welcome
                  console.log('🔄 App restart detected - user not completed onboarding, clearing session and going to welcome');
                  await AsyncStorage.removeItem("access_token");
                  await AsyncStorage.removeItem("username");
                  await AsyncStorage.removeItem("userId");
                  await AsyncStorage.removeItem("accountId");
                  await AsyncStorage.removeItem('app_restart_flag');
                  router.replace("/(auth)/welcome");
                } else {
                  // Đây là lần đầu tiên -> chuyển đến onboarding
                  console.log('📱 First time login - user not completed onboarding, going to onboarding');
                  router.replace("/(onboarding)/intro");
                }
              }
            } catch (error) {
              console.log('⚠️ Error checking onboarding status:', error);
              // Khi có lỗi, cũng kiểm tra app restart
              const isAppRestart = await AsyncStorage.getItem('app_restart_flag');
              
              if (isAppRestart === 'true') {
                console.log('🔄 App restart with error - clearing session and going to welcome');
                await AsyncStorage.removeItem("access_token");
                await AsyncStorage.removeItem("username");
                await AsyncStorage.removeItem("userId");
                await AsyncStorage.removeItem("accountId");
                await AsyncStorage.removeItem('app_restart_flag');
                router.replace("/(auth)/welcome");
              } else {
                console.log('📱 First time login with error - going to onboarding');
                router.replace("/(onboarding)/intro");
              }
            }
          } else {
            // Không có username -> kiểm tra app restart
            const isAppRestart = await AsyncStorage.getItem('app_restart_flag');
            
            if (isAppRestart === 'true') {
              console.log('🔄 App restart - no username, clearing session and going to welcome');
              await AsyncStorage.removeItem("access_token");
              await AsyncStorage.removeItem("username");
              await AsyncStorage.removeItem("userId");
              await AsyncStorage.removeItem("accountId");
              await AsyncStorage.removeItem('app_restart_flag');
              router.replace("/(auth)/welcome");
            } else {
              console.log('📱 First time login - no username, going to onboarding');
              router.replace("/(onboarding)/intro");
            }
          }
          
          await SplashScreen.hideAsync();
          return;
        }
      } catch (e) {
        console.warn('Error in app initialization:', e);
        // Nếu có lỗi, fallback về welcome screen
        router.replace("/(auth)/welcome");
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // if(true){
  //   return(
  //     <Redirect href={"/(tabs)"} />
  //   )
  // }
};

export default RootPage;
