import { getReadingPassageByCategoryAPI } from "@/app/utils/apiall";
import { useMascotManager } from "@/components/mascotWithBubble/MascotManager";
import MascotWithBubble from "@/components/mascotWithBubble/mascotWithBubble";
import { RecordingListModal } from "@/components/modal";
import VoiceRecorder from "@/components/voiceRecorder/VoiceRecorder";
import { useRecordings } from "@/hooks/useRecordings";
import { responsiveSize, responsiveSpacing } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Toast from "react-native-root-toast";

// Interface cho Reading Passage
interface ReadingPassage {
  id: number;
  title: string;
  content: string;
  level: string;
  createdAt: string;
  category: {
    id: number;
    name: string;
    description: string;
  };
}

export default function PassageDetailScreen() {
  const params = useLocalSearchParams();
  const passageId = params.id as string;
  const passageTitle = params.title as string;
  const categoryId = params.categoryId as string;
  const { getMascotByType } = useMascotManager();
  const { recordings, addRecording, deleteRecording } = useRecordings();
  const { width: screenWidth } = useWindowDimensions();
  
  const [passage, setPassage] = useState<ReadingPassage | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRecordingsModal, setShowRecordingsModal] = useState(false);
  
  console.log('🔍 PassageDetailScreen params:', params);
  console.log('🔍 passageId:', passageId);
  console.log('🔍 passageTitle:', passageTitle);
  console.log('🔍 categoryId:', categoryId);

  const fetchPassage = useCallback(async () => {
    if (!categoryId) {
      console.log('❌ No categoryId provided');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('📚 Fetching reading passages for categoryId:', categoryId);
      
      const response = await getReadingPassageByCategoryAPI(parseInt(categoryId));
      console.log('📚 Reading passages response:', response);
      
      if (response && Array.isArray(response)) {
        // Tìm passage theo ID
        const foundPassage = response.find((p: ReadingPassage) => p.id === parseInt(passageId));
        if (foundPassage) {
          setPassage(foundPassage);
          console.log('📚 Found passage:', foundPassage);
        } else {
          console.log('❌ Passage not found with id:', passageId);
          Toast.show("Không tìm thấy bài đọc!", { position: Toast.positions.TOP });
        }
      } else {
        console.log('❌ No passages found');
        Toast.show("Không có bài đọc nào!", { position: Toast.positions.TOP });
      }
    } catch (error: any) {
      console.error('❌ Error fetching passage:', error);
      Toast.show("Không thể tải bài đọc. Vui lòng thử lại!", { 
        position: Toast.positions.TOP 
      });
    } finally {
      setLoading(false);
    }
  }, [categoryId, passageId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchPassage();
    } catch (error) {
      console.error('Error refreshing passage:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchPassage]);

  useEffect(() => {
    if (categoryId && passageId) {
      fetchPassage();
    }
  }, [categoryId, passageId, fetchPassage]);

  // Responsive calculations
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 768;
  const isTablet = screenWidth >= 768;
  
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2AA0FF" />
        <Text style={styles.loadingText}>Đang tải bài đọc...</Text>
      </View>
    );
  }

  if (!passage) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.loadingText}>Không tìm thấy bài đọc</Text>
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#2AA0FF']} // Android
          tintColor="#2AA0FF" // iOS
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={responsiveSize(24)} color="#2FA6F3" />
        </Pressable>
        <Text style={styles.headerTitle}>{passage.title}</Text>
        <Pressable
          onPress={handleShowRecordings}
          style={({ pressed }) => [
            styles.recordingsButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons 
            name="list" 
            size={isTablet ? 28 : 24} 
            color="#3AA1E0" 
          />
          {recordings.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{recordings.length}</Text>
            </View>
          )}
        </Pressable>
      </View>
     
        {/* Main Content */}
        <View style={styles.content}>
{/*     
        <View style={styles.wordSection}>
          <Text style={styles.mainWord}>{passage.title}</Text>
        </View> */}

<View style={styles.mascotContainer}>
          <MascotWithBubble
            message="Hãy đọc kỹ bài này và chú ý đến cách phát âm nhé! Sau đó bấm vào micro để luyện tập phát âm! 🎯"
            mascotSource={getMascotByType('longlanh').source}
            containerStyle={StyleSheet.absoluteFill}
            mascotWidth={responsiveSize(130)}
            mascotHeight={responsiveSize(130)}
            mascotPosition={{ 
              left: responsiveSize(-15), 
              bottom: responsiveSize(170) 
            }}
            bubblePosition={{ 
              left: responsiveSize(100), 
              top: responsiveSize(-120) 
            }}
            bubbleStyle={{
              height: responsiveSize(130), 
              width: responsiveSize(240)
            }}
            bgColor={getMascotByType('longlanh').recommendedBubbleColor?.bgColor}
            borderColor={getMascotByType('longlanh').recommendedBubbleColor?.borderColor}
            responsive={true}
          />
        </View>

        {/* Reading Passage Content */}
        <View style={styles.passageContainer}>
          <Text style={styles.passageText}>
            {passage.content}
          </Text>
        </View>

        {/* Mascot Reading Guide - giống introLayout */}

        

        {/* Pronunciation Guide */}
        {/* <View style={styles.pronunciationBox}>
          <View style={styles.pronunciationContent}>
          
            <View style={styles.diagramContainer}>
              <View style={styles.mouthDiagram}>
                <View style={styles.tongueLine} />
                <View style={styles.mouthOutline} />
              </View>
            </View>
            
           
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsText}>
                Mở miệng - đầu lưỡi chạm lợi trên (&quot;n&quot;) - môi tròn (&quot;o&quot;) - kéo môi lại, nâng lưỡi (&quot;i&quot;) - kết thúc bằng giọng lên cao.
              </Text>
            </View>
          </View>
        </View> */}

        {/* Voice Recording Section */}
        <View style={styles.voiceRecordingSection}>
          <VoiceRecorder
            onRecordingStart={handleRecordingStart}
            onRecordingStop={handleRecordingStop}
            micButtonSize={responsiveMicSize}
            micButtonColor="#58BDF8"
            micButtonActiveColor="#fff"
            showStatusText={true}
          />
        </View>
      </View>

      <RecordingListModal
        visible={showRecordingsModal}
        onClose={handleCloseRecordings}
        recordings={recordings}
        onDeleteRecording={deleteRecording}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: "#2AA0FF",
    fontWeight: "600",
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#2AA0FF",
    borderRadius: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: responsiveSize(44),
    height: responsiveSize(44),
    borderRadius: responsiveSize(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: responsiveSpacing(12),
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#123E2D",
    flex: 1,
    marginRight: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  wordSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  mainWord: {
    fontSize: 32,
    fontWeight: "800",
    color: "#2AA0FF",
    marginBottom: 8,
  },
  passageContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  passageText: {
    fontSize: 18,
    lineHeight: 28,
    color: "#4B5563",
    textAlign: "left",
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  pronunciationBox: {
    backgroundColor: "#F0F9FF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0F2FE",
    marginBottom: 60,
    padding: 20,
  },
  pronunciationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  diagramContainer: {
    width: 120,
    height: 100,
    marginRight: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  mouthDiagram: {
    width: 80,
    height: 60,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  mouthOutline: {
    width: 60,
    height: 40,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#9CA3AF",
    backgroundColor: "transparent",
  },
  tongueLine: {
    position: "absolute",
    width: 40,
    height: 3,
    backgroundColor: "#EF4444",
    borderRadius: 2,
    top: 20,
    left: 20,
  },
  instructionsContainer: {
    flex: 1,
  },
  instructionsText: {
    fontSize: 16,
    color: "#1F2937",
    lineHeight: 24,
    fontWeight: "500",
  },
  voiceRecordingSection: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  recordingsButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#B3D9FF',
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mascotContainer: {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: 180,
    marginTop: 100,
  },
});
