import MascotWithBubble from '@/components/mascotWithBubble/mascotWithBubble';
import {
    getScreenSize,
    isLargeScreen,
    isSmallScreen,
    isTablet,
    responsiveFontSize,
    responsiveSize,
    responsiveSpacing
} from '@/utils/responsive';
import React from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

const MascotTest: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const screenSize = getScreenSize();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Mascot Responsive Test</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Screen Information</Text>
          <Text style={styles.infoText}>Width: {width}px</Text>
          <Text style={styles.infoText}>Height: {height}px</Text>
          <Text style={styles.infoText}>Screen Size: {screenSize}</Text>
          <Text style={styles.infoText}>Is Small Screen: {isSmallScreen() ? 'Yes' : 'No'}</Text>
          <Text style={styles.infoText}>Is Large Screen: {isLargeScreen() ? 'Yes' : 'No'}</Text>
          <Text style={styles.infoText}>Is Tablet: {isTablet() ? 'Yes' : 'No'}</Text>
        </View>

        <View style={styles.mascotContainer}>
          <Text style={styles.sectionTitle}>Mascot Test - Screen Size: {screenSize}</Text>
          <MascotWithBubble
            message="Hãy giúp tớ trả lời một số câu hỏi sau để chúng ta cùng tìm hiểu nhau"
            mascotSource={{ uri: "https://tse3.mm.bing.net/th/id/OIP.vocmRxcM-70XSnNT-31akwHaHa?cb=ucfimgc2&rs=1&pid=ImgDetMain&o=7&rm=3" }}
            responsive={true}
            bgColor="#E8F4FD"
            borderColor="#64B5F6"
            radius={20}
            tail={true}
          />
        </View>

         <View style={styles.mascotContainer}>
           <Text style={styles.sectionTitle}>Mascot Test - Small Screen Mode</Text>
           <MascotWithBubble
             message="Test trên màn hình nhỏ"
             mascotSource={{ uri: "https://tse3.mm.bing.net/th/id/OIP.vocmRxcM-70XSnNT-31akwHaHa?cb=ucfimgc2&rs=1&pid=ImgDetMain&o=7&rm=3" }}
             responsive={true}
             bgColor="#FFF3E0"
             borderColor="#FF9800"
             radius={16}
             tail={true}
             mascotPosition={{ left: -width * 0.15, bottom: height * 0.25 }}
             bubblePosition={{ left: width * 0.15, top: height * 0.15 }}
           />
         </View>

         <View style={styles.mascotContainer}>
           <Text style={styles.sectionTitle}>Mascot Test - Tablet Mode</Text>
           <MascotWithBubble
             message="Test trên tablet"
             mascotSource={{ uri: "https://tse3.mm.bing.net/th/id/OIP.vocmRxcM-70XSnNT-31akwHaHa?cb=ucfimgc2&rs=1&pid=ImgDetMain&o=7&rm=3" }}
             responsive={true}
             bgColor="#E8F5E8"
             borderColor="#4CAF50"
             radius={24}
             tail={true}
             mascotPosition={{ left: -width * 0.1, bottom: height * 0.2 }}
             bubblePosition={{ left: width * 0.08, top: height * 0.18 }}
           />
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
    marginBottom: responsiveSpacing(20),
    color: '#333',
  },
  infoCard: {
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
    marginBottom: responsiveSpacing(8),
    color: '#333',
  },
  infoText: {
    fontSize: responsiveFontSize(14),
    marginBottom: responsiveSpacing(4),
    color: '#666',
  },
  mascotContainer: {
    backgroundColor: '#fff',
    borderRadius: responsiveSize(12),
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(20),
    minHeight: responsiveSize(300),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: responsiveFontSize(16),
    fontWeight: '600',
    marginBottom: responsiveSpacing(12),
    color: '#333',
    textAlign: 'center',
  },
});

export default MascotTest;
