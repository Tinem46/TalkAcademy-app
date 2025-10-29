
export { };
declare global {
    interface IBackendRes<T> {
        error?: string | string[];
        message: string;
        statusCode: number | string;
        data?: T;
        results?: T[];
        totalCount?: number;
        messages?: string[];
        items?: any;
    }

    interface VoiceTestHistoryItem {
        voiceScore: number;
        cerRatio: number;
        spm: number;
        pauseRatio: number;
        mptSeconds: number;
        finalConsonantAccuracy: number;
        level: string;
        audioUrl: string | null;
        createdAt: string;
    }

    interface VoiceStatsByPassage {
        passageTitle: string;
        avgScore: number;
        avgCer: number;
        avgSpm: string;
        avgPause: number;
    }

    interface UserOverviewData {
        completedPassages: number;
        voiceStatsByPassage: VoiceStatsByPassage[];
        latestvoiceLevel: string;
    }
}

// Default export to avoid route warning
export default {};

