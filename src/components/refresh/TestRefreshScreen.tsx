import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CustomScrollView from './CustomScrollView';

const TestRefreshScreen = () => {
  const [refreshCount, setRefreshCount] = useState(0);

  const handleRefresh = async () => {
    console.log('🔄 Test refresh called');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshCount(prev => prev + 1);
    console.log('✅ Test refresh completed');
  };

  return (
    <View style={styles.container}>
      <CustomScrollView
        onRefresh={handleRefresh}
        refreshing={false}
        refreshTitle="Kéo để test refresh"
        refreshColors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']}
        refreshTintColor="#FF6B6B"
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Test Custom Refresh</Text>
        <Text style={styles.subtitle}>
          Kéo xuống để test custom refresh animation
        </Text>
        <Text style={styles.count}>
          Số lần refresh: {refreshCount}
        </Text>
        <Text style={styles.instruction}>
          Kéo xuống để xem bubble animation!
        </Text>
      </CustomScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  count: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 20,
  },
  instruction: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default TestRefreshScreen;
