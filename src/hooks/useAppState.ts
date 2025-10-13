import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export const useAppState = () => {
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        const handleAppStateChange = async (nextAppState: AppStateStatus) => {
            console.log('📱 App state changed from', appState.current, 'to', nextAppState);

            if (appState.current === 'active' && nextAppState === 'background') {
                // App đang chuyển từ active sang background (user tắt app)
                console.log('📱 App going to background - setting restart flag');
                await AsyncStorage.setItem('app_restart_flag', 'true');
            }

            if (appState.current === 'background' && nextAppState === 'active') {
                // App đang chuyển từ background sang active (user mở lại app)
                console.log('📱 App coming back to foreground');
                // Không xóa flag ở đây, để logic trong index.tsx xử lý
            }

            appState.current = nextAppState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription?.remove();
        };
    }, []);
};
