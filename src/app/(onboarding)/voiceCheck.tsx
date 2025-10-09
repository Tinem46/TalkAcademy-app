import ShareButton from "@/components/button/share.button";
import QuoteCard from "@/components/card/quoteCard";
import { RecordingListModal } from "@/components/modal";
import VoiceRecorder from "@/components/voiceRecorder/VoiceRecorder";
import { useRecordings } from "@/hooks/useRecordings";
import {
  getResponsiveMargin,
  getResponsivePadding
} from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const VoiceCheckScreen = ({ navigation }: any) => {
  const [showRecordingsModal, setShowRecordingsModal] = useState(false);
  const { recordings, addRecording, deleteRecording } = useRecordings();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
 
  // Responsive calculations
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 768;
  const isTablet = screenWidth >= 768;
  
  // Dynamic sizing based on screen dimensions
  const responsiveFontSize = {
    title: isSmallScreen ? 28 : isMediumScreen ? 32 : isTablet ? 42 : 36,
    quote: isSmallScreen ? 20 : isMediumScreen ? 22 : isTablet ? 28 : 25,
  };
  
  // Get responsive spacing values
  const paddingValues = getResponsivePadding();
  const marginValues = getResponsiveMargin();
  
  const responsiveSpacing = {
    horizontal: paddingValues.horizontal,
    vertical: paddingValues.vertical,
    headerBottom: marginValues.vertical,
    quoteBottom: marginValues.vertical * 1.5,
  };

  const responsiveMicSize = isSmallScreen ? 35 : isMediumScreen ? 40 : isTablet ? 50 : 45;

  const handleRecordingStart = () => {
    console.log('Recording started');
  };

  const handleRecordingStop = async (uri: string) => {
    console.log('Recording stopped, URI:', uri);
    await addRecording(uri);
  };

  const handleShowRecordings = () => {
    setShowRecordingsModal(true);
  };

  const handleCloseRecordings = () => {
    setShowRecordingsModal(false);
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      marginTop: isSmallScreen ? 34 : 0,
    } as const,
    content: {
      flex: 1,
      paddingTop: responsiveSpacing.vertical * 0.5,
      paddingHorizontal: responsiveSpacing.horizontal,
    } as const,
    headerRow: { 
      flexDirection: "row" as const, 
      alignItems: "center" as const, 
      justifyContent: "space-between" as const,
      marginBottom: responsiveSpacing.headerBottom,
      paddingHorizontal: isTablet ? 8 : 0,
    } as const,
    title: { 
      fontSize: responsiveFontSize.title, 
      fontWeight: "800" as const, 
      color: "#000000ff",
      flex: 1,
      marginRight: 16,
    } as const,
    center: { 
      alignItems: "center" as const, 
      justifyContent: screenHeight < 700 ? "flex-start" as const : "center" as const, 
      marginTop: screenHeight < 700 ? 16 : responsiveSpacing.vertical,
      flex: 1,
      paddingBottom: screenHeight < 700 ? 20 : 40,
      marginBottom: screenHeight < 700 ? 20 : 40,
      minHeight: 200,
    } as const,
    buttonContainer: {
      paddingHorizontal: responsiveSpacing.horizontal,
      paddingBottom: Platform.OS === 'ios' ? (isSmallScreen ? 28 : 34) : 20,
      paddingTop: screenHeight < 700 ? 16 : 25,
      zIndex: 10,
    } as const,
    recordingsButton: {
      position: 'relative' as const,
      padding: isSmallScreen ? 6 : isTablet ? 10 : 8,
      borderRadius: isTablet ? 24 : 20,
      backgroundColor: '#F0F8FF',
      borderWidth: 1,
      borderColor: '#B3D9FF',
      minWidth: isTablet ? 48 : 40,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    } as const,
    badge: {
      position: 'absolute' as const,
      top: -2,
      right: -2,
      backgroundColor: '#FF6B6B',
      borderRadius: isTablet ? 12 : 10,
      minWidth: isTablet ? 24 : 20,
      height: isTablet ? 24 : 20,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderWidth: 2,
      borderColor: '#fff',
    } as const,
    badgeText: {
      color: '#fff',
      fontSize: isTablet ? 14 : 12,
      fontWeight: 'bold' as const,
    } as const,
    quoteCard: {
      marginHorizontal: isTablet ? 24 : 14,
      marginBottom: responsiveSpacing.quoteBottom,
      maxWidth: isTablet ? screenWidth * 0.8 : undefined,
      alignSelf: isTablet ? 'center' as const : 'stretch' as const,
    } as const,
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={dynamicStyles.content}>
        <View style={dynamicStyles.headerRow}>
          <Text style={dynamicStyles.title}>AI Check</Text>
          <Pressable
            onPress={handleShowRecordings}
            style={({ pressed }) => [
              dynamicStyles.recordingsButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons 
              name="list" 
              size={isTablet ? 28 : 24} 
              color="#3AA1E0" 
            />
            {recordings.length > 0 && (
              <View style={dynamicStyles.badge}>
                <Text style={dynamicStyles.badgeText}>{recordings.length}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <QuoteCard
          text="Xin chào, tôi tên là Hoàng Anh. Tôi rất thích học ngoại ngữ, đặc biệt là tiếng Việt. Mỗi ngày, tôi dành khoảng 30 phút để luyện nói trước gương hoặc qua ứng dụng. Tôi hy vọng giọng nói của mình sẽ rõ ràng và tự nhiên hơn trong tương lai."
          showMicIcon={false}
          style={dynamicStyles.quoteCard}
          colors={{
            background: "#E5E7EA",
            question: "#43b7fa",
            quoteMark: "#1B7A6C",
          }}
          textStyle={{ 
            fontSize: responsiveFontSize.quote, 
            lineHeight: responsiveFontSize.quote * 1.4,
            textAlign: isTablet ? 'center' : 'left',
          }}
        />

        <View style={dynamicStyles.center}>
          <VoiceRecorder
            onRecordingStart={handleRecordingStart}
            onRecordingStop={handleRecordingStop}
            micButtonSize={responsiveMicSize}
            micButtonColor="#3AA1E0"
            micButtonActiveColor="#fff"
            showStatusText={true}
          />
        </View>
      </View>

      <View style={dynamicStyles.buttonContainer}>
        <ShareButton
          title="Tiếp tục"
          onPress={() => {
            router.push("/(onboarding)/evaluationVoice");
          }}
        />
      </View>

      <RecordingListModal
        visible={showRecordingsModal}
        onClose={handleCloseRecordings}
        recordings={recordings}
        onDeleteRecording={deleteRecording}
      />
    </SafeAreaView>
  );
};

export default VoiceCheckScreen;