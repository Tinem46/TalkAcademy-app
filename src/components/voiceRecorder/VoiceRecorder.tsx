import {
    getResponsiveShadow,
    isLargeScreen,
    isSmallScreen,
    responsiveFontSize,
    responsiveIconSize,
    responsiveSize,
    responsiveSpacing
} from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Easing,
    Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";

interface VoiceRecorderProps {
  onRecordingStart?: () => void;
  onRecordingStop?: (uri: string) => void;
  micButtonSize?: number;
  micButtonColor?: string;
  micButtonActiveColor?: string;
  showStatusText?: boolean;
  statusText?: string;
  style?: any;
  micButtonStyle?: any;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingStart,
  onRecordingStop,
  micButtonSize,
  micButtonColor = "#3AA1E0",
  micButtonActiveColor = "#fff",
  showStatusText = true,
  statusText,
  style,
  micButtonStyle,
}) => {
  const [recording, setRecording] = useState(false);
  const [recordingObject, setRecordingObject] = useState<Audio.Recording | null>(null);
  const pulse = useRef(new Animated.Value(0)).current;
  
  // Tính toán kích thước responsive cho mic button
  const responsiveMicButtonSize = micButtonSize || responsiveIconSize(isSmallScreen() ? 35 : isLargeScreen() ? 50 : 40);

  // Khởi tạo Audio mode
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('Failed to setup audio:', error);
        Alert.alert('Lỗi', 'Không thể khởi tạo âm thanh');
      }
    };
    setupAudio();
  }, []);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (recordingObject) {
        try {
          recordingObject.stopAndUnloadAsync();
        } catch (error) {
          console.warn('Recording already stopped:', error);
        }
      }
    };
  }, [recordingObject]);

  // Animation cho pulse effect
  useEffect(() => {
    if (recording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 900,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 900,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulse.stopAnimation();
      pulse.setValue(0);
    }
  }, [recording, pulse]);

  // Hàm bắt đầu thu âm
  const startRecording = async () => {
    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecordingObject(recording);
      setRecording(true);
      onRecordingStart?.();
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Lỗi', 'Không thể bắt đầu thu âm');
    }
  };

  // Hàm dừng thu âm
  const stopRecording = async () => {
    if (!recordingObject) return;
    
    try {
      const uri = recordingObject.getURI();
      await recordingObject.stopAndUnloadAsync();
      setRecordingObject(null);
      setRecording(false);
      console.log('Recording stopped, URI:', uri); // Debug log
      onRecordingStop?.(uri || '');
    } catch (error) {
      console.error('Failed to stop recording:', error);
      // Still reset state even if there's an error
      setRecordingObject(null);
      setRecording(false);
      Alert.alert('Lỗi', 'Không thể dừng thu âm');
    }
  };


  // Hàm xử lý khi nhấn nút mic
  const handleMicPress = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const getStatusText = () => {
    if (statusText) return statusText;
    if (recording) return "Đang thu âm...";
    return "Nhấn để thu âm";
  };

  return (
    <View style={[styles.container, style]}>
      {/* Pulse ring animation */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            transform: [
              {
                scale: pulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.15],
                }),
              },
            ],
            opacity: pulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0.4, 0.15],
            }),
          },
        ]}
      />
      
      {/* Mic button */}
      <Pressable
        onPress={handleMicPress}
        style={({ pressed }) => [
          styles.micBtn,
          micButtonStyle,
          pressed && { opacity: 0.8 },
          recording && styles.recordingBtn,
        ]}
      >
        <Ionicons
          name={recording ? "stop" : "mic-outline"}
          size={responsiveMicButtonSize}
          color={recording ? micButtonActiveColor : micButtonColor}
        />
      </Pressable>

      {/* Status text */}
      {showStatusText && (
        <Text style={styles.statusText}>
          {getStatusText()}
        </Text>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: responsiveSize(250),
    paddingVertical: responsiveSpacing(20),
  },
  pulseRing: {
    position: "absolute",
    width: responsiveSize(140),
    height: responsiveSize(140),
    borderRadius: responsiveSize(70),
    backgroundColor: "#BFE4FF",
  },
  micBtn: {
    width: responsiveSize(120),
    height: responsiveSize(120),
    borderRadius: responsiveSize(60),
    backgroundColor: "#E8F3FF",
    borderWidth: responsiveSize(3),
    borderColor: "#9CCEF6",
    alignItems: "center",
    justifyContent: "center",
    ...getResponsiveShadow({
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    }),
  },
  recordingBtn: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF5252",
  },
  statusText: {
    fontSize: responsiveFontSize(16),
    color: "#666",
    marginTop: responsiveSpacing(16),
    textAlign: "center",
    paddingHorizontal: responsiveSpacing(20),
  },
});

export default VoiceRecorder;
