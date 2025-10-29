import {
    responsiveFontSize,
    responsiveSize,
    responsiveSpacing
} from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface Assessment {
  id: number;
  title: string;
  description: string;
  level: string;
  passages: {
    id: number;
    title: string;
    content: string;
    level: string;
    createdAt: string;
    isActive: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface AssessmentCardProps {
  assessment: Assessment;
  onPress: () => void;
}

const getLevelColor = (level: string) => {
  switch (level.toUpperCase()) {
    case 'BEGINNER':
      return '#4CAF50';
    case 'INTERMEDIATE':
      return '#FF9800';
    case 'ADVANCED':
      return '#F44336';
    default:
      return '#2FA6F3';
  }
};

export default function AssessmentCard({ assessment, onPress }: AssessmentCardProps) {
  return (
    <Pressable
      style={styles.assessmentCard}
      onPress={onPress}
    >
      <View style={styles.assessmentContent}>
        <View style={styles.assessmentHeader}>
          <Text style={styles.assessmentTitle}>{assessment.title}</Text>
          <View style={[styles.levelBadge, { backgroundColor: getLevelColor(assessment.level) }]}>
            <Text style={styles.levelText}>{assessment.level}</Text>
          </View>
        </View>
        <Text style={styles.assessmentDescription}>{assessment.description}</Text>
        <View style={styles.assessmentFooter}>
          <Text style={styles.passageCount}>{assessment.passages.length} bài đọc</Text>
          <Ionicons name="chevron-forward" size={16} color="#2FA6F3" />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  assessmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: responsiveSize(16),
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  assessmentContent: {
    flex: 1,
  },
  assessmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: responsiveSpacing(8),
  },
  assessmentTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: responsiveSpacing(12),
  },
  levelBadge: {
    paddingHorizontal: responsiveSpacing(8),
    paddingVertical: responsiveSpacing(4),
    borderRadius: responsiveSize(12),
  },
  levelText: {
    fontSize: responsiveFontSize(12),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  assessmentDescription: {
    fontSize: responsiveFontSize(14),
    color: '#64748B',
    lineHeight: responsiveSize(20),
    marginBottom: responsiveSpacing(12),
  },
  assessmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passageCount: {
    fontSize: responsiveFontSize(12),
    color: '#2FA6F3',
    fontWeight: '600',
  },
});
