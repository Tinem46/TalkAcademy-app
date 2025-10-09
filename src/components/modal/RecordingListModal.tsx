import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface RecordingItem {
  id: string;
  uri: string;
  duration: number; // in seconds
  timestamp: number; // when recorded
  name: string;
}

interface RecordingListModalProps {
  visible: boolean;
  onClose: () => void;
  recordings: RecordingItem[];
  onDeleteRecording: (id: string) => void;
}

const { width: screenWidth } = Dimensions.get('window');

const RecordingListModal: React.FC<RecordingListModalProps> = ({
  visible,
  onClose,
  recordings,
  onDeleteRecording,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Cleanup sound when component unmounts or modal closes
  useEffect(() => {
    if (!visible && sound) {
      sound.unloadAsync();
      setSound(null);
    }
  }, [visible, sound]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const playRecording = async (item: RecordingItem) => {
    try {
      // Stop current playing sound
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: item.uri },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setPlayingId(item.id);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingId(null);
          setSound(null);
        }
      });
    } catch (error) {
      console.error('Failed to play recording:', error);
      Alert.alert('Lỗi', 'Không thể phát âm thanh');
    }
  };

  const stopPlaying = async () => {
    if (sound) {
      await sound.stopAsync();
      setSound(null);
      setPlayingId(null);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Xóa bản ghi âm',
      'Bạn có chắc chắn muốn xóa bản ghi âm này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => {
            onDeleteRecording(id);
            if (playingId === id) {
              stopPlaying();
            }
          }
        },
      ]
    );
  };

  const renderRecordingItem = ({ item }: { item: RecordingItem }) => {
    const isPlaying = playingId === item.id;
    
    return (
      <View style={styles.recordingItem}>
        <View style={styles.recordingInfo}>
          <Text style={styles.recordingName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.recordingDetails}>
            <Text style={styles.duration}>
              {formatDuration(item.duration)}
            </Text>
            <Text style={styles.timestamp}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>
        </View>
        
        <View style={styles.recordingActions}>
          <Pressable
            onPress={() => isPlaying ? stopPlaying() : playRecording(item)}
            style={({ pressed }) => [
              styles.playButton,
              pressed && { opacity: 0.7 },
              isPlaying && styles.playingButton,
            ]}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={20}
              color={isPlaying ? "#fff" : "#3AA1E0"}
            />
          </Pressable>
          
          <Pressable
            onPress={() => handleDelete(item.id)}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color="#FF6B6B"
            />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Bản ghi âm</Text>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="close" size={24} color="#666" />
          </Pressable>
        </View>

        {recordings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="mic-off" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có bản ghi âm nào</Text>
            <Text style={styles.emptySubtext}>
              Hãy thu âm để xem danh sách ở đây
            </Text>
          </View>
        ) : (
          <FlatList
            data={recordings}
            keyExtractor={(item) => item.id}
            renderItem={renderRecordingItem}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  recordingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recordingInfo: {
    flex: 1,
    marginRight: 12,
  },
  recordingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  recordingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    fontSize: 14,
    color: '#3AA1E0',
    fontWeight: '500',
    marginRight: 12,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  recordingActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F3FF',
    borderWidth: 1,
    borderColor: '#9CCEF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  playingButton: {
    backgroundColor: '#3AA1E0',
    borderColor: '#2E8BC0',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE8E8',
    borderWidth: 1,
    borderColor: '#FFB3B3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default RecordingListModal;

