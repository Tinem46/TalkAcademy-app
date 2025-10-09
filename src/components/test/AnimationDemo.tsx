import { ENHANCED_COLORS } from '@/app/utils/constant';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AnimatedCard from '../animation/AnimatedCard';
import ScreenWrapper from '../layout/ScreenWrapper';

const AnimationDemo = () => {
  return (
    <ScreenWrapper style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Animation Demo</Text>
        <Text style={styles.subtitle}>Các hiệu ứng animation đã được cải thiện</Text>

        {/* Card animations with different delays */}
        <AnimatedCard delay={0} style={styles.card}>
          <Text style={styles.cardTitle}>Card 1 - No Delay</Text>
          <Text style={styles.cardText}>Hiệu ứng xuất hiện ngay lập tức</Text>
        </AnimatedCard>

        <AnimatedCard delay={200} style={styles.card}>
          <Text style={styles.cardTitle}>Card 2 - 200ms Delay</Text>
          <Text style={styles.cardText}>Hiệu ứng xuất hiện sau 200ms</Text>
        </AnimatedCard>

        <AnimatedCard delay={400} style={styles.card}>
          <Text style={styles.cardTitle}>Card 3 - 400ms Delay</Text>
          <Text style={styles.cardText}>Hiệu ứng xuất hiện sau 400ms</Text>
        </AnimatedCard>

        <AnimatedCard delay={600} style={styles.card}>
          <Text style={styles.cardTitle}>Card 4 - 600ms Delay</Text>
          <Text style={styles.cardText}>Hiệu ứng xuất hiện sau 600ms</Text>
        </AnimatedCard>

        {/* Interactive card */}
        <AnimatedCard 
          delay={800} 
          style={styles.interactiveCard}
          onPress={() => console.log('Card pressed!')}
          scaleOnPress={true}
        >
          <Text style={styles.cardTitle}>Interactive Card</Text>
          <Text style={styles.cardText}>Nhấn để xem hiệu ứng scale</Text>
        </AnimatedCard>

        {/* Feature list */}
        <View style={styles.featureList}>
          <Text style={styles.featureTitle}>Các tính năng đã cải thiện:</Text>
          <Text style={styles.featureItem}>✅ Tab bar với gradient background</Text>
          <Text style={styles.featureItem}>✅ Spring animations cho tab switching</Text>
          <Text style={styles.featureItem}>✅ Glow effect cho tab active</Text>
          <Text style={styles.featureItem}>✅ Labels tiếng Việt với animation</Text>
          <Text style={styles.featureItem}>✅ Screen transition mượt mà</Text>
          <Text style={styles.featureItem}>✅ Card animations với delay</Text>
          <Text style={styles.featureItem}>✅ Ripple effect khi nhấn</Text>
          <Text style={styles.featureItem}>✅ Responsive design</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ENHANCED_COLORS.background.secondary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: ENHANCED_COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: ENHANCED_COLORS.text.secondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  card: {
    backgroundColor: ENHANCED_COLORS.background.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: ENHANCED_COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: ENHANCED_COLORS.border.light,
  },
  interactiveCard: {
    backgroundColor: ENHANCED_COLORS.primary[50],
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: ENHANCED_COLORS.primary[500],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: ENHANCED_COLORS.primary[200],
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ENHANCED_COLORS.text.primary,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: ENHANCED_COLORS.text.secondary,
    lineHeight: 20,
  },
  featureList: {
    backgroundColor: ENHANCED_COLORS.background.primary,
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: ENHANCED_COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ENHANCED_COLORS.text.primary,
    marginBottom: 16,
  },
  featureItem: {
    fontSize: 14,
    color: ENHANCED_COLORS.text.secondary,
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default AnimationDemo;
