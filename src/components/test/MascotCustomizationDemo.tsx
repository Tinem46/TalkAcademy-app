import { MascotType, useMascotManager } from '@/components/mascotWithBubble/MascotManager';
import MascotWithBubble from '@/components/mascotWithBubble/mascotWithBubble';
import { responsiveFontSize, responsiveSize, responsiveSpacing } from '@/utils/responsive';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

const MascotCustomizationDemo: React.FC = () => {
  const [selectedMascot, setSelectedMascot] = useState<MascotType>('default');
  const { getAllMascots, getMascotByType } = useMascotManager();
  const { width } = useWindowDimensions();
  
  const mascots = getAllMascots();
  const currentMascot = getMascotByType(selectedMascot);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Mascot Customization Demo</Text>
        <Text style={styles.subtitle}>Chọn mascot để xem preview</Text>

        {/* Mascot Preview */}
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Preview: {currentMascot.name}</Text>
          <View style={styles.mascotPreview}>
            <MascotWithBubble
              message={`Xin chào! Tôi là ${currentMascot.name}. ${currentMascot.description || ''}`}
              mascotSource={currentMascot.source}
              mascotWidth={currentMascot.defaultSize?.width}
              mascotHeight={currentMascot.defaultSize?.height}
              mascotPosition={currentMascot.defaultPosition}
              bgColor={currentMascot.recommendedBubbleColor?.bgColor}
              borderColor={currentMascot.recommendedBubbleColor?.borderColor}
              responsive={true}
            />
          </View>
        </View>

        {/* Mascot Selection */}
        <View style={styles.selectionContainer}>
          <Text style={styles.selectionTitle}>Chọn Mascot:</Text>
          <View style={styles.mascotGrid}>
            {Object.entries(getAllMascots()).map(([type, config], index) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.mascotCard,
                  selectedMascot === type && styles.selectedCard
                ]}
                onPress={() => setSelectedMascot(type as MascotType)}
              >
                <View style={styles.mascotImageContainer}>
                  <MascotWithBubble
                    message=""
                    mascotSource={config.source}
                    mascotWidth={80}
                    mascotHeight={80}
                    responsive={false}
                    containerStyle={{ height: 100 }}
                  />
                </View>
                <Text style={[
                  styles.mascotName,
                  selectedMascot === type && styles.selectedText
                ]}>
                  {config.name}
                </Text>
                {config.description && (
                  <Text style={styles.mascotDescription}>
                    {config.description}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Usage Example */}
        <View style={styles.exampleContainer}>
          <Text style={styles.exampleTitle}>Cách sử dụng:</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>
{`<IntroLayout
  message="Tin nhắn của bạn"
  mascotType="${selectedMascot}"
  onNext={() => {}}
  onBack={() => {}}
/>`}
            </Text>
          </View>
        </View>

        {/* Mascot Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Thông tin Mascot:</Text>
          <Text style={styles.infoText}>Tên: {currentMascot.name}</Text>
          <Text style={styles.infoText}>Mô tả: {currentMascot.description || 'Không có mô tả'}</Text>
          <Text style={styles.infoText}>
            Kích thước mặc định: {currentMascot.defaultSize?.width || 'auto'} x {currentMascot.defaultSize?.height || 'auto'}
          </Text>
          <Text style={styles.infoText}>
            Màu bubble: {currentMascot.recommendedBubbleColor?.bgColor} / {currentMascot.recommendedBubbleColor?.borderColor}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: responsiveSpacing(16),
  },
  title: {
    fontSize: responsiveFontSize(24),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: responsiveSpacing(8),
    color: '#333',
  },
  subtitle: {
    fontSize: responsiveFontSize(16),
    textAlign: 'center',
    marginBottom: responsiveSpacing(20),
    color: '#666',
  },
  previewContainer: {
    backgroundColor: '#fff',
    borderRadius: responsiveSize(12),
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: '600',
    marginBottom: responsiveSpacing(12),
    color: '#333',
    textAlign: 'center',
  },
  mascotPreview: {
    height: responsiveSize(300),
    position: 'relative',
  },
  selectionContainer: {
    backgroundColor: '#fff',
    borderRadius: responsiveSize(12),
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectionTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: '600',
    marginBottom: responsiveSpacing(12),
    color: '#333',
  },
  mascotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mascotCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: responsiveSize(8),
    padding: responsiveSpacing(12),
    marginBottom: responsiveSpacing(12),
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#64B5F6',
    backgroundColor: '#E8F4FD',
  },
  mascotImageContainer: {
    alignItems: 'center',
    marginBottom: responsiveSpacing(8),
  },
  mascotName: {
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: responsiveSpacing(4),
    color: '#333',
  },
  selectedText: {
    color: '#1565C0',
  },
  mascotDescription: {
    fontSize: responsiveFontSize(12),
    textAlign: 'center',
    color: '#666',
    lineHeight: responsiveFontSize(16),
  },
  exampleContainer: {
    backgroundColor: '#fff',
    borderRadius: responsiveSize(12),
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exampleTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: '600',
    marginBottom: responsiveSpacing(12),
    color: '#333',
  },
  codeBlock: {
    backgroundColor: '#f8f9fa',
    borderRadius: responsiveSize(8),
    padding: responsiveSpacing(12),
    borderLeftWidth: 4,
    borderLeftColor: '#64B5F6',
  },
  codeText: {
    fontSize: responsiveFontSize(14),
    fontFamily: 'monospace',
    color: '#333',
    lineHeight: responsiveFontSize(20),
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: responsiveSize(12),
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: '600',
    marginBottom: responsiveSpacing(12),
    color: '#333',
  },
  infoText: {
    fontSize: responsiveFontSize(14),
    marginBottom: responsiveSpacing(8),
    color: '#666',
    lineHeight: responsiveFontSize(20),
  },
});

export default MascotCustomizationDemo;
