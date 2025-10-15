import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


export default function EvaluationResultScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const passageId = params.passageId as string;
  const passageTitle = params.passageTitle as string;
  
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pitchData, setPitchData] = useState<number[]>([]);
  
  // Animation values
  const gaugeAnimation = useState(new Animated.Value(0))[0];
  const speedAnimation = useState(new Animated.Value(0))[0];
  const intonationAnimation = useState(new Animated.Value(0))[0];


  const loadAnalysisResult = useCallback(async () => {
    const generatePitchData = (result: any) => {
      // Generate mock pitch data based on analysis result
      const basePitch = 100 + (result.metrics?.voiceScore || 70) * 0.5;
      const data = [];
      
      for (let i = 0; i <= 15; i++) {
        const variation = Math.sin(i * 0.5) * 20 + Math.random() * 10;
        data.push(Math.max(70, Math.min(160, basePitch + variation)));
      }
      
      setPitchData(data);
    };

    const animateResults = (result: any) => {
      const metrics = result.metrics || {};
      
      // Animate gauge (0-100 scale)
      Animated.timing(gaugeAnimation, {
        toValue: metrics.voiceScore || 70,
        duration: 1500,
        useNativeDriver: false,
      }).start();

      // Animate speed progress (0-1 scale)
      Animated.timing(speedAnimation, {
        toValue: Math.min(1, (metrics.spm || 120) / 150),
        duration: 1200,
        useNativeDriver: false,
      }).start();

      // Animate intonation progress (0-1 scale)
      Animated.timing(intonationAnimation, {
        toValue: Math.min(1, (metrics.voiceScore || 70) / 100),
        duration: 1000,
        useNativeDriver: false,
      }).start();
    };

    try {
      const result = await AsyncStorage.getItem('voiceAnalysisResult');
      if (result) {
        const parsedResult = JSON.parse(result);
        setAnalysisResult(parsedResult);
        generatePitchData(parsedResult);
        animateResults(parsedResult);
      }
    } catch (error) {
      console.error('Error loading analysis result:', error);
    } finally {
      setLoading(false);
    }
  }, [gaugeAnimation, speedAnimation, intonationAnimation]);

  useEffect(() => {
    loadAnalysisResult();
  }, [loadAnalysisResult]);

  const getGaugeColor = (value: number) => {
    if (value < 30) return '#3B82F6'; // Blue
    if (value < 70) return '#10B981'; // Green
    return '#EF4444'; // Red
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2FA6F3" />
        <Text style={styles.loadingText}>Đang tải kết quả...</Text>
      </View>
    );
  }

  if (!analysisResult) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Không tìm thấy kết quả đánh giá</Text>
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  const metrics = analysisResult.metrics || {};
  const voiceScore = metrics.voiceScore || 70;
  const speed = metrics.spm || 120;
  const intonation = voiceScore; // Use voice score as intonation for now

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.content, { paddingTop: insets.top + 20 }]}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ĐÁNH GIÁ</Text>
          {passageTitle && (
            <Text style={styles.passageTitle}>{passageTitle}</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable 
            style={styles.secondaryButton}
            onPress={() => {
              if (passageId) {
                router.push(`/passage-detail?id=${passageId}&title=${encodeURIComponent(passageTitle || '')}&categoryId=1`);
              } else {
                router.back();
              }
            }}
          >
            <Text style={styles.secondaryButtonText}>Làm lại nào!</Text>
          </Pressable>
          
          <Pressable 
            style={styles.primaryButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.primaryButtonText}>Tiếp tục</Text>
          </Pressable>
        </View>

        {/* Speed Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tốc độ</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  {
                    width: speedAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', `${Math.min(100, (speed / 150) * 100)}%`],
                    }),
                    backgroundColor: getGaugeColor(speed / 1.5),
                  }
                ]}
              />
            </View>
            <Text style={styles.progressValue}>{speed}</Text>
          </View>
        </View>

        {/* Gauge */}
        <View style={styles.gaugeContainer}>
          <View style={styles.gauge}>
            {/* Gauge Background */}
            <View style={styles.gaugeBackground}>
              {/* Blue segment */}
              <View style={[styles.gaugeSegment, styles.gaugeBlue, { transform: [{ rotate: '-135deg' }] }]} />
              {/* Green segment */}
              <View style={[styles.gaugeSegment, styles.gaugeGreen, { transform: [{ rotate: '-45deg' }] }]} />
              {/* Red segment */}
              <View style={[styles.gaugeSegment, styles.gaugeRed, { transform: [{ rotate: '45deg' }] }]} />
            </View>
            
            {/* Needle */}
            <Animated.View 
              style={[
                styles.needle,
                {
                  transform: [
                    { rotate: gaugeAnimation.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['-135deg', '135deg'],
                    }) }
                  ]
                }
              ]}
            />
            
            {/* Center dot */}
            <View style={styles.centerDot} />
            
            {/* Value display */}
            <Text style={styles.gaugeValue}>{voiceScore}</Text>
          </View>
        </View>

        {/* Intonation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ngữ điệu</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  {
                    width: intonationAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', `${Math.min(100, intonation)}%`],
                    }),
                    backgroundColor: getGaugeColor(intonation),
                  }
                ]}
              />
            </View>
            <Text style={styles.progressValue}>{intonation}</Text>
          </View>
        </View>

        {/* Pitch Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Pitch(Hz)</Text>
          <View style={styles.chartContainer}>
            {/* Y-axis labels */}
            <View style={styles.yAxis}>
              <Text style={styles.yAxisLabel}>160</Text>
              <Text style={styles.yAxisLabel}>130</Text>
              <Text style={styles.yAxisLabel}>100</Text>
              <Text style={styles.yAxisLabel}>70</Text>
              <Text style={styles.yAxisLabel}>0</Text>
            </View>
            
            {/* Chart area */}
            <View style={styles.chartArea}>
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <View key={i} style={[styles.gridLine, { top: i * 20 }]} />
              ))}
              
              {/* Pitch line */}
              <View style={styles.pitchLine}>
                {pitchData.map((value, index) => {
                  const x = (index / (pitchData.length - 1)) * 100;
                  const y = ((160 - value) / 160) * 100;
                  return (
                    <View
                      key={index}
                      style={[
                        styles.pitchPoint,
                        {
                          left: `${x}%`,
                          top: `${y}%`,
                        }
                      ]}
                    />
                  );
                })}
              </View>
            </View>
            
            {/* X-axis labels */}
            <View style={styles.xAxis}>
              <Text style={styles.xAxisLabel}>0</Text>
              <Text style={styles.xAxisLabel}>5</Text>
              <Text style={styles.xAxisLabel}>10</Text>
              <Text style={styles.xAxisLabel}>15</Text>
            </View>
          </View>
          <Text style={styles.xAxisTitle}>Time(s)</Text>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 50 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#2FA6F3',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2FA6F3',
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f3d2e',
    textAlign: 'center',
  },
  passageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: 'black',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f3d2e',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 40,
    textAlign: 'right',
  },
  gaugeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  gauge: {
    width: 200,
    height: 100,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeBackground: {
    position: 'absolute',
    width: 180,
    height: 90,
  },
  gaugeSegment: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 8,
    borderColor: 'transparent',
  },
  gaugeBlue: {
    borderTopColor: '#3B82F6',
    borderRightColor: '#3B82F6',
  },
  gaugeGreen: {
    borderTopColor: '#10B981',
    borderRightColor: '#10B981',
  },
  gaugeRed: {
    borderTopColor: '#EF4444',
    borderRightColor: '#EF4444',
  },
  needle: {
    position: 'absolute',
    width: 2,
    height: 60,
    backgroundColor: '#1F2937',
    borderRadius: 1,
    transformOrigin: 'bottom center',
  },
  centerDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1F2937',
  },
  gaugeValue: {
    position: 'absolute',
    bottom: -30,
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  chartSection: {
    marginBottom: 30,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 120,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
  },
  yAxis: {
    width: 30,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginRight: 10,
  },
  yAxisLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  pitchLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pitchPoint: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#3B82F6',
  },
  xAxis: {
    position: 'absolute',
    bottom: -20,
    left: 30,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xAxisLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  xAxisTitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
  },
});
