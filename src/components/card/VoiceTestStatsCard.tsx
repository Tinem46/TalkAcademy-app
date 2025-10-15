import { responsiveFontSize, responsiveSize, responsiveSpacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

interface VoiceTestStatsCardProps {
  totalTests: number;
  averageScore: number;
  bestScore: number;
  latestScore?: number;
  improvement?: number;
}

export default function VoiceTestStatsCard({
  totalTests,
  averageScore,
  bestScore,
  latestScore,
  improvement,
}: VoiceTestStatsCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 80) return '#8BC34A';
    if (score >= 70) return '#FFC107';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const getImprovementColor = (improvement?: number) => {
    if (!improvement) return '#666';
    return improvement > 0 ? '#4CAF50' : improvement < 0 ? '#F44336' : '#666';
  };

  const getImprovementIcon = (improvement?: number) => {
    if (!improvement) return 'remove';
    return improvement > 0 ? 'trending-up' : improvement < 0 ? 'trending-down' : 'remove';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="stats-chart" size={responsiveSize(24)} color="#3AA1E0" />
        <Text style={styles.title}>Thống kê tổng quan</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalTests}</Text>
          <Text style={styles.statLabel}>Tổng số test</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: getScoreColor(averageScore) }]}>
            {averageScore.toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>Điểm trung bình</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: getScoreColor(bestScore) }]}>
            {bestScore}
          </Text>
          <Text style={styles.statLabel}>Điểm cao nhất</Text>
        </View>

        {latestScore && (
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: getScoreColor(latestScore) }]}>
              {latestScore}
            </Text>
            <Text style={styles.statLabel}>Lần gần nhất</Text>
          </View>
        )}
      </View>

      {improvement !== undefined && (
        <View style={styles.improvementContainer}>
          <Ionicons 
            name={getImprovementIcon(improvement)} 
            size={responsiveSize(16)} 
            color={getImprovementColor(improvement)} 
          />
          <Text style={[styles.improvementText, { color: getImprovementColor(improvement) }]}>
            {improvement > 0 ? '+' : ''}{improvement.toFixed(1)} điểm so với lần trước
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: responsiveSize(12),
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing(16),
  },
  title: {
    fontSize: responsiveFontSize(16),
    fontWeight: '600',
    color: '#333',
    marginLeft: responsiveSpacing(8),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: responsiveSpacing(12),
  },
  statValue: {
    fontSize: responsiveFontSize(24),
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: responsiveFontSize(12),
    color: '#666',
    marginTop: responsiveSpacing(4),
    textAlign: 'center',
  },
  improvementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: responsiveSpacing(8),
    paddingTop: responsiveSpacing(12),
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  improvementText: {
    fontSize: responsiveFontSize(14),
    fontWeight: '500',
    marginLeft: responsiveSpacing(4),
  },
});
