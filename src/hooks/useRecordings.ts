import { Audio } from 'expo-av';
import { useCallback, useState } from 'react';

export interface RecordingItem {
    id: string;
    uri: string;
    duration: number; // in seconds
    timestamp: number; // when recorded
    name: string;
}

export const useRecordings = () => {
    const [recordings, setRecordings] = useState<RecordingItem[]>([]);

    const addRecording = useCallback(async (uri: string) => {
        try {
            // Get recording duration
            const { sound } = await Audio.Sound.createAsync({ uri });
            const status = await sound.getStatusAsync();

            if (status.isLoaded) {
                const duration = status.durationMillis ? status.durationMillis / 1000 : 0;

                // Safely unload the sound
                try {
                    await sound.unloadAsync();
                } catch (unloadError) {
                    console.warn('Sound already unloaded:', unloadError);
                }

                const newRecording: RecordingItem = {
                    id: Date.now().toString(),
                    uri,
                    duration,
                    timestamp: Date.now(),
                    name: `Bản ghi âm ${recordings.length + 1}`,
                };

                setRecordings(prev => [newRecording, ...prev]);
                return newRecording;
            }
        } catch (error) {
            console.error('Error getting recording duration:', error);
            // Still add recording even if we can't get duration
            const newRecording: RecordingItem = {
                id: Date.now().toString(),
                uri,
                duration: 0,
                timestamp: Date.now(),
                name: `Bản ghi âm ${recordings.length + 1}`,
            };

            setRecordings(prev => [newRecording, ...prev]);
            return newRecording;
        }
    }, [recordings.length]);

    const deleteRecording = useCallback((id: string) => {
        setRecordings(prev => prev.filter(recording => recording.id !== id));
    }, []);

    const clearAllRecordings = useCallback(() => {
        setRecordings([]);
    }, []);

    const updateRecordingName = useCallback((id: string, name: string) => {
        setRecordings(prev =>
            prev.map(recording =>
                recording.id === id ? { ...recording, name } : recording
            )
        );
    }, []);

    return {
        recordings,
        addRecording,
        deleteRecording,
        clearAllRecordings,
        updateRecordingName,
    };
};

