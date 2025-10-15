import { useMascotManager } from "@/components/mascotWithBubble/MascotManager";
import MascotWithBubble from "@/components/mascotWithBubble/mascotWithBubble";
import { responsiveSize, responsiveSpacing } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface AIAnalysisLoadingPopupProps {
  visible: boolean;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  mascotType?: string;
}

export default function AIAnalysisLoadingPopup({
  visible,
  onClose,
  title = "AI đang phân tích giọng nói",
  subtitle = "Vui lòng chờ trong giây lát...",
  mascotType = "longlanh"
}: AIAnalysisLoadingPopupProps) {
  const { getMascotByType } = useMascotManager();
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [progressAnim] = useState(new Animated.Value(0));
  const [dot1Anim] = useState(new Animated.Value(0.4));
  const [dot2Anim] = useState(new Animated.Value(0.7));
  const [dot3Anim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false, // width không hỗ trợ native driver
        }),
      ]).start();

      // Start dots animation
      const createDotAnimation = (animValue: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 600,
              delay: delay,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0.4,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const dotsAnimation = Animated.parallel([
        createDotAnimation(dot1Anim, 0),
        createDotAnimation(dot2Anim, 200),
        createDotAnimation(dot3Anim, 400),
      ]);

      dotsAnimation.start();

      return () => {
        dotsAnimation.stop();
      };
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim, progressAnim, dot1Anim, dot2Anim, dot3Anim]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.popupContainer,
            {
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          {/* Background Card */}
          <View style={styles.card}>
            {/* Close Button */}
            {onClose && (
              <View style={styles.closeButtonContainer}>
                <Ionicons 
                  name="close" 
                  size={24} 
                  color="#9CA3AF" 
                  onPress={onClose}
                  style={styles.closeButton}
                />
              </View>
            )}

            {/* Mascot with Bubble */}
            <View style={styles.mascotContainer}>
              <MascotWithBubble
                message="AI đang phân tích giọng nói của bạn... 🤖✨"
                mascotSource={getMascotByType('omg').source}
                containerStyle={styles.mascotBubbleContainer}
                mascotWidth={responsiveSize(120)}
                mascotHeight={responsiveSize(120)}
                mascotPosition={{ 
                  left: responsiveSize(-20), 
                  bottom: responsiveSize(95) 
                }}
                bubblePosition={{ 
                  left: responsiveSize(90), 
                  top: responsiveSize(-20) 
                }}
                bubbleStyle={{
                  height: responsiveSize(100), 
                  width: responsiveSize(200)
                }}
                bgColor={getMascotByType('default').recommendedBubbleColor?.bgColor}
                borderColor={getMascotByType('default').recommendedBubbleColor?.borderColor}
                responsive={true}
              />
            </View>

            {/* Loading Content */}
            <View style={styles.loadingContent}>
              <View style={styles.loadingIcon}>
                <ActivityIndicator size="large" color="#3AA1E0" />
              </View>
              
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
              
              {/* Animated Dots */}
              <View style={styles.dotsContainer}>
                <Animated.View style={[styles.dot, { opacity: dot1Anim }]} />
                <Animated.View style={[styles.dot, { opacity: dot2Anim }]} />
                <Animated.View style={[styles.dot, { opacity: dot3Anim }]} />
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    }
                  ]}
                />
              </View>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(20),
  },
  popupContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: responsiveSpacing(30),
    alignItems: 'center',
    shadowColor: '#3AA1E0',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 15,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    width: '100%',
    position: 'relative',
  },
  closeButtonContainer: {
    position: 'absolute',
    top: responsiveSpacing(15),
    right: responsiveSpacing(15),
    zIndex: 10,
  },
  closeButton: {
    padding: responsiveSpacing(8),
  },
  mascotContainer: {
    position: 'relative',
    width: '100%',
    height: responsiveSize(140),
    marginBottom: responsiveSpacing(20),
  },
  mascotBubbleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  loadingContent: {
    alignItems: 'center',
    marginBottom: responsiveSpacing(20),
  },
  loadingIcon: {
    marginBottom: responsiveSpacing(16),
  },
  title: {
    fontSize: responsiveSize(20),
    fontWeight: '700',
    color: '#1E40AF',
    textAlign: 'center',
    marginBottom: responsiveSpacing(8),
  },
  subtitle: {
    fontSize: responsiveSize(16),
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: responsiveSpacing(20),
    lineHeight: responsiveSize(22),
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: responsiveSize(8),
    height: responsiveSize(8),
    borderRadius: responsiveSize(4),
    backgroundColor: '#3AA1E0',
    marginHorizontal: responsiveSize(4),
  },
  progressContainer: {
    width: '100%',
    marginTop: responsiveSpacing(10),
  },
  progressBar: {
    width: '100%',
    height: responsiveSize(4),
    backgroundColor: '#E5E7EB',
    borderRadius: responsiveSize(2),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3AA1E0',
    borderRadius: responsiveSize(2),
  },
});
