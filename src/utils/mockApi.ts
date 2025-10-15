// Mock API Service for development
// This file provides mock data when backend server is not available

export const MOCK_SURVEYS = [
    {
        id: 1,
        title: "English Level Assessment",
        description: "Assess your current English proficiency level",
        questions: [
            {
                id: 1,
                question: "What is your current English level?",
                type: "multiple_choice",
                options: ["Beginner", "Intermediate", "Advanced"]
            }
        ],
        user: {
            id: 1,
            username: "demo_user"
        }
    }
];

export const MOCK_CATEGORIES = [
    {
        id: 1,
        name: "English Pronunciation",
        description: "Bài luyện phát âm tiếng Anh cơ bản",
        isLock: false
    },
    {
        id: 2,
        name: "Luyện phản xạ",
        description: "Bài luyện phát phản xạ",
        isLock: false
    },
    {
        id: 3,
        name: "Luyện phát âm",
        description: "Bài luyện phát âm",
        isLock: true
    }
];

export const MOCK_USER_PROFILE = {
    id: 1,
    username: "demo_user",
    email: "demo@example.com",
    role: "CUSTOMER",
    avatar: null,
    googleId: null,
    password: "",
    refreshToken: "",
    voiceTests: [],
    practices: [],
    userPackages: []
};

export const MOCK_ACCOUNTS = [
    {
        id: 1,
        userId: 1,
        accountType: "BASIC",
        isActive: true,
        createdAt: new Date().toISOString()
    }
];

// Mock API functions
export const mockGetUserSurveyAPI = async () => {
    console.log("🔧 Mock API: getUserSurveyAPI");
    return MOCK_SURVEYS;
};

export const mockGetUserProfileAPI = async () => {
    console.log("🔧 Mock API: getUserProfileAPI");
    return MOCK_USER_PROFILE;
};

export const mockGetCategoriesByAccountAPI = async (userId: number) => {
    console.log("🔧 Mock API: getCategoriesByAccountAPI for userId:", userId);
    return MOCK_CATEGORIES;
};

export const mockCheckOnboardingStatusWithAccountsAPI = async () => {
    console.log("🔧 Mock API: checkOnboardingStatusWithAccountsAPI");
    // Return false to indicate onboarding is not completed
    return false;
};

export const mockGetAllPackagesAPI = async () => {
    console.log("🔧 Mock API: getAllPackagesAPI");
    return [
        {
            id: 1,
            title: "Basic Package",
            price: "Free",
            durationDays: 30,
            isUnlimited: false,
            level: "Beginner",
            features: ["Basic lessons", "Voice recording"],
            description: "Perfect for beginners",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
};

export const MOCK_READING_PASSAGES = [
    {
        id: 1,
        title: "Basic English Pronunciation",
        content: "Xin chào, tôi tên là Hoàng Anh. Tôi rất thích học ngoại ngữ, đặc biệt là tiếng Việt. Mỗi ngày, tôi dành khoảng 30 phút để luyện nói trước gương hoặc qua ứng dụng. Tôi hy vọng giọng nói của mình sẽ rõ ràng và tự nhiên hơn trong tương lai.",
        level: "Beginner",
        createdAt: new Date().toISOString(),
        category: {
            id: 1,
            name: "English Pronunciation",
            description: "Bài luyện phát âm tiếng Anh cơ bản"
        }
    },
    {
        id: 2,
        title: "Daily Conversation Practice",
        content: "Hôm nay là một ngày đẹp trời. Tôi thức dậy lúc 7 giờ sáng và ăn sáng với bánh mì và sữa. Sau đó tôi đi làm bằng xe máy. Công việc của tôi rất thú vị và tôi học được nhiều điều mới mỗi ngày.",
        level: "Intermediate",
        createdAt: new Date().toISOString(),
        category: {
            id: 2,
            name: "Daily Conversation",
            description: "Bài luyện hội thoại hàng ngày"
        }
    }
];

export const mockGetReadingPassageByCategoryAPI = async (categoryId: number) => {
    console.log("🔧 Mock API: getReadingPassageByCategoryAPI for categoryId:", categoryId);
    // Return passages that match the categoryId
    const passages = MOCK_READING_PASSAGES.filter(passage => passage.category.id === categoryId);
    return passages.length > 0 ? passages : [MOCK_READING_PASSAGES[0]]; // Fallback to first passage
};

export const mockGetReadingPassageByIdAPI = async (id: number) => {
    console.log("🔧 Mock API: getReadingPassageByIdAPI for id:", id);
    // Return passage that matches the id
    const passage = MOCK_READING_PASSAGES.find(passage => passage.id === id);
    return passage ? passage : MOCK_READING_PASSAGES[0]; // Fallback to first passage
};

export const mockAnalyzeVoiceAPI = async () => {
    console.log("🔧 Mock API: analyzeVoiceAPI");

    // Generate random metrics based on API response format
    const voiceScore = Math.floor(Math.random() * 40) + 60; // 60-100
    const cerRatio = Math.random() * 0.3; // Character Error Rate (0-0.3)
    const spm = Math.floor(Math.random() * 20) + 120; // Syllables Per Minute (120-140)
    const pauseRatio = Math.random() * 0.2; // Pause ratio (0-0.2)
    const mptSeconds = Math.random() * 2; // Mean Pause Time in seconds (0-2)

    return {
        status: "success",
        metrics: {
            cerRatio: parseFloat(cerRatio.toFixed(3)),
            spm: spm,
            pauseRatio: parseFloat(pauseRatio.toFixed(3)),
            mptSeconds: parseFloat(mptSeconds.toFixed(2)),
            FinalConsonantAccuracy: null,
            voiceScore: voiceScore
        }
    };
};

