import { getReadingPassageByCategoryWithStatusAPI } from "@/app/utils/apiall";
import SafeAreaTabWrapper from "@/components/layout/SafeAreaTabWrapper";
import CustomFlatList from "@/components/refresh/CustomFlatList";
import {
  getResponsivePadding,
  responsiveFontSize,
  responsiveSize,
  responsiveSpacing,
} from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-root-toast";

interface ReadingPassage {
  id: number;
  title: string;
  content: string;
  level: string;
  createdAt: string;
  isActive: boolean;
  completedUsers: {
    id: number;
    password: string;
    username: string;
    email: string;
    googleId: string | null;
    avatar: string | null;
    refreshToken: string;
    role: string;
  }[];
  isFinished: boolean;
  isUnlocked: boolean;
}

export default function ReadingScreen() {
  const params = useLocalSearchParams();
  const categoryId = params.categoryId as string;
  const categoryName = params.categoryName as string;
  const assessmentId = params.assessmentId as string;
  const assessmentTitle = params.assessmentTitle as string;
  const assessmentLevel = params.assessmentLevel as string;
  const passagesParam = params.passages as string;
  const padding = getResponsivePadding();

  console.log("🔍 ReadingScreen params:", params);
  console.log("🔍 categoryId:", categoryId);
  console.log("🔍 categoryName:", categoryName);
  console.log("🔍 assessmentId:", assessmentId);
  console.log("🔍 assessmentTitle:", assessmentTitle);
  console.log("🔍 assessmentLevel:", assessmentLevel);
  console.log("🔍 passagesParam:", passagesParam);

  const [passages, setPassages] = useState<ReadingPassage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<"BEGINNER" | "ADVANCED">(
    "BEGINNER"
  );
  const [filteredPassages, setFilteredPassages] = useState<ReadingPassage[]>(
    []
  );
  const [hasShownCompletionToast, setHasShownCompletionToast] = useState(false);

  // Function to filter passages based on level and progress
  const filterPassagesByLevel = useCallback(
    (allPassages: ReadingPassage[]) => {
      console.log("🔍 Filtering passages by level:", currentLevel);
      console.log("📊 Total passages received:", allPassages.length);
      console.log(
        "📊 All passages data:",
        allPassages.map((p) => ({
          id: p.id,
          title: p.title,
          level: p.level,
          isFinished: p.isFinished,
        }))
      );

      // Get all BEGINNER passages (case insensitive)
      const beginnerPassages = allPassages.filter(
        (passage) => passage.level && passage.level.toUpperCase() === "BEGINNER"
      );
      // Get all ADVANCED passages (case insensitive)
      const advancedPassages = allPassages.filter(
        (passage) => passage.level && passage.level.toUpperCase() === "ADVANCED"
      );

      console.log("📊 Beginner passages found:", beginnerPassages.length);
      console.log("📊 Advanced passages found:", advancedPassages.length);

      // If no passages match expected levels, show all passages for debugging
      if (beginnerPassages.length === 0 && advancedPassages.length === 0) {
        console.log(
          "⚠️ No passages match BEGINNER or ADVANCED levels, showing all passages"
        );
        setFilteredPassages(allPassages);
        return;
      }

      // Check if all BEGINNER passages are completed
      const allBeginnerCompleted =
        beginnerPassages.length > 0 &&
        beginnerPassages.every((passage) => passage.isFinished);

      console.log("📊 All beginner passages completed:", allBeginnerCompleted);

      if (currentLevel === "BEGINNER") {
        // Show only BEGINNER passages, or all if no BEGINNER found
        const passagesToShow =
          beginnerPassages.length > 0 ? beginnerPassages : allPassages;
        setFilteredPassages(passagesToShow);

        // If all BEGINNER are completed, show notification only once
        if (
          allBeginnerCompleted &&
          advancedPassages.length > 0 &&
          !hasShownCompletionToast
        ) {
          // Toast.show("🎉 Chúc mừng! Bạn đã hoàn thành tất cả bài BEGINNER. Bạn có thể làm lại hoặc chuyển sang ADVANCED!", {
          //   position: Toast.positions.TOP,
          //   duration: 4000
          // });

          // Mark toast as shown to prevent showing again
          setHasShownCompletionToast(true);
          console.log(
            "✅ All BEGINNER completed, ADVANCED unlocked - Toast shown for first time"
          );
        }
      } else {
        // Show ADVANCED passages, or all if no ADVANCED found
        const passagesToShow =
          advancedPassages.length > 0 ? advancedPassages : allPassages;
        setFilteredPassages(passagesToShow);
      }
    },
    [currentLevel, hasShownCompletionToast]
  );

  // Function to check if ADVANCED level is unlocked
  const isAdvancedUnlocked = useCallback(() => {
    const beginnerPassages = passages.filter(
      (passage) => passage.level && passage.level.toUpperCase() === "BEGINNER"
    );
    const advancedPassages = passages.filter(
      (passage) => passage.level && passage.level.toUpperCase() === "ADVANCED"
    );

    // ADVANCED is unlocked if all BEGINNER passages are completed
    const allBeginnerCompleted =
      beginnerPassages.length > 0 &&
      beginnerPassages.every((passage) => passage.isFinished);

    return allBeginnerCompleted && advancedPassages.length > 0;
  }, [passages]);

  const fetchPassages = useCallback(async () => {
    if (!categoryId) {
      console.log("❌ No categoryId provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Check if this is an assessment
      if (categoryId.startsWith("assessment_") && passagesParam) {
        console.log("📝 Loading assessment passages from params");

        // Parse passages from params
        const assessmentPassages = JSON.parse(
          passagesParam
        ) as ReadingPassage[];
        console.log(
          "📝 Assessment passages loaded:",
          assessmentPassages.length,
          "items"
        );

        setPassages(assessmentPassages);

        // For assessments, show all passages regardless of level
        setFilteredPassages(assessmentPassages);

        // Set current level based on assessment level
        if (assessmentLevel) {
          setCurrentLevel(assessmentLevel as "BEGINNER" | "ADVANCED");
        }
      } else {
        console.log(
          "📚 Fetching reading passages with status for categoryId:",
          categoryId
        );

        const response = await getReadingPassageByCategoryWithStatusAPI(
          parseInt(categoryId)
        );
        console.log("📚 Reading passages with status response:", response);

        if (response && Array.isArray(response)) {
          setPassages(response);
          console.log("📚 Reading passages loaded:", response.length, "items");

          // Filter passages based on current level and progress
          filterPassagesByLevel(response);
        } else {
          setPassages([]);
          setFilteredPassages([]);
          console.log("📚 No reading passages found");
        }
      }
    } catch (error: any) {
      console.error("❌ Error fetching reading passages:", error);
      Toast.show("Không thể tải bài đọc. Vui lòng thử lại!", {
        position: Toast.positions.TOP,
      });
    } finally {
      setLoading(false);
    }
  }, [categoryId, passagesParam, assessmentLevel, filterPassagesByLevel]);

  const handleRefresh = useCallback(async () => {
    console.log("🔄 Reading handleRefresh called");
    setRefreshing(true);
    try {
      // Reset toast state when refreshing to allow showing again if needed
      setHasShownCompletionToast(false);
      await fetchPassages();
      console.log("✅ Reading refresh completed successfully");
    } catch (error) {
      console.error("❌ Error refreshing reading passages:", error);
    } finally {
      setRefreshing(false);
      console.log("🔄 Reading refresh finished");
    }
  }, [fetchPassages]);

  useEffect(() => {
    if (categoryId) {
      fetchPassages();
    }
  }, [categoryId, fetchPassages]);

  // Re-filter passages when currentLevel changes
  useEffect(() => {
    if (passages.length > 0) {
      filterPassagesByLevel(passages);
    }
  }, [currentLevel, passages, filterPassagesByLevel]);

  // Reset toast state when level changes
  useEffect(() => {
    setHasShownCompletionToast(false);
  }, [currentLevel]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "#10B981";
      case "INTERMEDIATE":
        return "#F59E0B";
      case "ADVANCED":
        return "#EF4444";
      default:
        return "#2FA6F3";
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "leaf";
      case "INTERMEDIATE":
        return "flame";
      case "ADVANCED":
        return "star";
      default:
        return "book";
    }
  };

  if (!categoryId) {
    return (
      <SafeAreaTabWrapper style={styles.safe}>
        <View style={styles.loadingContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={responsiveSize(72)}
              color="#2FA6F3"
            />
          </View>
          <Text style={styles.errorTitle}>Không tìm thấy danh mục</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={responsiveSize(20)}
              color="#FFFFFF"
            />
            <Text style={styles.errorButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaTabWrapper>
    );
  }

  if (loading) {
    return (
      <SafeAreaTabWrapper style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2FA6F3" />
          <Text style={styles.loadingText}>Đang tải bài đọc...</Text>
        </View>
      </SafeAreaTabWrapper>
    );
  }

  const renderContent = () => (
    <View style={{ paddingHorizontal: padding.horizontal }}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={responsiveSize(24)}
            color="#2FA6F3"
          />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {assessmentTitle
              ? decodeURIComponent(assessmentTitle)
              : categoryName
              ? decodeURIComponent(categoryName)
              : "Bài đọc"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {assessmentId
              ? `Bài kiểm tra • ${filteredPassages.length} bài đọc`
              : `${
                  filteredPassages.length
                } bài đọc ${currentLevel.toLowerCase()} có sẵn`}
            {!assessmentId &&
              currentLevel === "BEGINNER" &&
              isAdvancedUnlocked() && (
                <Text style={styles.unlockIndicator}>
                  {" "}
                  • ADVANCED đã mở khóa!
                </Text>
              )}
          </Text>
        </View>
      </View>

      {/* Level Selector - Only show for categories, not assessments */}
      {!assessmentId && (
        <View style={styles.levelSelectorContainer}>
          <View style={styles.levelSelector}>
            <TouchableOpacity
              style={[
                styles.levelButton,
                currentLevel === "BEGINNER" && styles.levelButtonActive,
              ]}
              onPress={() => setCurrentLevel("BEGINNER")}
            >
              <Text
                style={[
                  styles.levelButtonText,
                  currentLevel === "BEGINNER" && styles.levelButtonTextActive,
                ]}
              >
                BEGINNER
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.levelButton,
                currentLevel === "ADVANCED" && styles.levelButtonActive,
                !isAdvancedUnlocked() && styles.levelButtonDisabled,
              ]}
              onPress={() => {
                if (isAdvancedUnlocked()) {
                  setCurrentLevel("ADVANCED");
                } else {
                  Toast.show("Bạn cần hoàn thành tất cả bài BEGINNER trước!", {
                    position: Toast.positions.TOP,
                  });
                }
              }}
              disabled={!isAdvancedUnlocked()}
            >
              <Text
                style={[
                  styles.levelButtonText,
                  currentLevel === "ADVANCED" && styles.levelButtonTextActive,
                  !isAdvancedUnlocked() && styles.levelButtonTextDisabled,
                ]}
              >
                ADVANCED
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Mascot Reading Introduction - giống introLayout */}
      {/* <View style={styles.mascotContainer}>
      <MascotWithBubble
            message="Hãy cùng Luyện tập nào!!!"
            mascotSource={getMascotByType('talking').source}
            containerStyle={StyleSheet.absoluteFill}
            mascotWidth={responsiveSize(130)}
            mascotHeight={responsiveSize(130)}
            mascotPosition={{ 
              left: responsiveSize(-10), 
              bottom: responsiveSize(230) 
            }}
            bubblePosition={{ 
              left: responsiveSize(100), 
              top: responsiveSize(-120) 
            }}
            bubbleStyle={{
              height: responsiveSize(50), 
              width: responsiveSize(220)
            }}
            bgColor={getMascotByType('longlanh').recommendedBubbleColor?.bgColor}
            borderColor={getMascotByType('longlanh').recommendedBubbleColor?.borderColor}
            responsive={true}
          />
      </View> */}

      {filteredPassages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons
              name="book-outline"
              size={responsiveSize(80)}
              color="#E8F4FD"
            />
          </View>
          <Text style={styles.emptyTitle}>
            {passages.length === 0
              ? "Chưa có bài đọc"
              : currentLevel === "BEGINNER"
              ? "Chưa có bài BEGINNER"
              : "Chưa có bài ADVANCED"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {passages.length === 0
              ? "Hiện tại chưa có bài đọc nào trong danh mục này. Hãy quay lại sau nhé!"
              : currentLevel === "BEGINNER"
              ? "Hiện tại chưa có bài đọc BEGINNER nào. Hãy quay lại sau nhé!"
              : "Bạn cần hoàn thành tất cả bài BEGINNER trước khi học ADVANCED!"}
          </Text>

          {/* Show completion status for BEGINNER level */}
          {currentLevel === "BEGINNER" && passages.length > 0 && (
            <View style={styles.completionStatus}>
              <Text style={styles.completionText}>
                💡 Bạn có thể làm lại các bài đã hoàn thành để cải thiện kỹ
                năng!
              </Text>
            </View>
          )}

          {/* Debug info */}
          {passages.length > 0 && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugText}>
                Debug: {passages.length} passages total
              </Text>
              <Text style={styles.debugText}>
                Levels: {passages.map((p) => p.level).join(", ")}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.passagesContainer}>
          {filteredPassages.map((passage, index) => (
            <TouchableOpacity
              key={passage.id}
              style={[
                styles.passageCard,
                !passage.isUnlocked && { opacity: 0.5 }, // Replace lockedCard style with inline opacity
                {
                  transform: [{ scale: 1 }],
                },
              ]}
              onPress={() => {
                if (passage.isUnlocked) {
                  router.push(
                    `/passage-detail?id=${
                      passage.id
                    }&title=${encodeURIComponent(
                      passage.title
                    )}&categoryId=${categoryId}`
                  );
                } else {
                  Toast.show("Bài đọc này đã bị khóa!", {
                    position: Toast.positions.TOP,
                  });
                }
              }}
              activeOpacity={passage.isUnlocked ? 0.8 : 1}
              disabled={!passage.isUnlocked}
            >
              {/* Gradient background effect */}
              <View style={styles.gradientBg} />

              {/* Soft background effect */}
              <View style={styles.softBg} />

              {/* Icon container */}
              <View style={styles.iconWrap}>
                <View style={styles.iconInner}>
                  <Ionicons
                    name={
                      !passage.isUnlocked
                        ? "lock-closed"
                        : passage.isFinished
                        ? "checkmark-circle"
                        : getLevelIcon(passage.level)
                    }
                    size={responsiveSize(18)}
                    color={
                      !passage.isUnlocked
                        ? "#9CA3AF"
                        : passage.isFinished
                        ? "#10B981"
                        : getLevelColor(passage.level)
                    }
                  />
                </View>
              </View>

              {/* Content */}
              <View style={styles.content}>
                <Text
                  style={[
                    styles.passageTitle,
                    !passage.isUnlocked && styles.lockedText,
                  ]}
                  numberOfLines={2}
                >
                  {passage.title}
                </Text>

                <Text
                  style={[
                    styles.passageContent,
                    !passage.isUnlocked && styles.lockedText,
                  ]}
                  numberOfLines={2}
                >
                  {passage.content}
                </Text>

                {/* Read more button */}
                <View
                  style={[
                    styles.readMore,
                    !passage.isUnlocked && styles.lockedReadMore,
                  ]}
                >
                  <Text
                    style={[
                      styles.readMoreText,
                      !passage.isUnlocked && styles.lockedReadMoreText,
                    ]}
                  >
                    {!passage.isUnlocked
                      ? "Đã khóa"
                      : passage.isFinished
                      ? "Đã hoàn thành"
                      : "Đọc ngay"}
                  </Text>
                  <Ionicons
                    name={
                      !passage.isUnlocked
                        ? "lock-closed"
                        : passage.isFinished
                        ? "checkmark-circle"
                        : "arrow-forward"
                    }
                    size={responsiveSize(16)}
                    color={
                      !passage.isUnlocked
                        ? "#9CA3AF"
                        : passage.isFinished
                        ? "#10B981"
                        : "#2FA6F3"
                    }
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: responsiveSpacing(30) }} />
    </View>
  );

  return (
    <SafeAreaTabWrapper style={styles.safe}>
      <CustomFlatList
        data={[1]} // Dummy data để render một item
        renderItem={renderContent}
        keyExtractor={() => "reading-content"}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </SafeAreaTabWrapper>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveSpacing(40),
  },
  loadingText: {
    marginTop: responsiveSpacing(16),
    fontSize: responsiveFontSize(17),
    color: "#2FA6F3",
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  errorIconContainer: {
    width: responsiveSize(120),
    height: responsiveSize(120),
    borderRadius: responsiveSize(60),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: responsiveSpacing(24),
  },
  errorTitle: {
    fontSize: responsiveFontSize(22),
    fontWeight: "800",
    color: "#2C5530",
    marginBottom: responsiveSpacing(24),
  },
  errorButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2FA6F3",
    paddingHorizontal: responsiveSpacing(24),
    paddingVertical: responsiveSpacing(14),
    borderRadius: responsiveSize(16),
    gap: responsiveSpacing(8),
    shadowColor: "#2FA6F3",
    shadowOpacity: 0.3,
    shadowRadius: responsiveSize(12),
    shadowOffset: { width: 0, height: responsiveSize(4) },
    elevation: 6,
  },
  errorButtonText: {
    fontSize: responsiveFontSize(16),
    color: "#FFFFFF",
    fontWeight: "700",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveSpacing(24),
    marginTop: responsiveSpacing(20), // Increased for status bar
  },
  backButton: {
    width: responsiveSize(44),
    height: responsiveSize(44),
    borderRadius: responsiveSize(22),
    alignItems: "center",
    justifyContent: "center",
    marginRight: responsiveSpacing(12),
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: responsiveFontSize(26),
    fontWeight: "800",
    color: "#2C5530",
    letterSpacing: 0.55,
  },
  headerSubtitle: {
    fontSize: responsiveFontSize(14),
    color: "#2FA6F3",
    marginTop: responsiveSpacing(4),
    fontWeight: "600",
  },
  unlockIndicator: {
    color: "#10B981",
    fontWeight: "700",
  },
  completionStatus: {
    marginTop: responsiveSpacing(16),
    padding: responsiveSpacing(12),
    backgroundColor: "#F0FDF4",
    borderRadius: responsiveSize(8),
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  completionText: {
    fontSize: responsiveFontSize(14),
    color: "#166534",
    textAlign: "center",
    fontWeight: "600",
  },
  levelSelectorContainer: {
    marginTop: responsiveSpacing(16),
    marginBottom: responsiveSpacing(8),
  },
  levelSelector: {
    flexDirection: "row",
    backgroundColor: "#F0F8FF",
    borderRadius: responsiveSize(12),
    padding: responsiveSpacing(4),
  },
  levelButton: {
    flex: 1,
    paddingVertical: responsiveSpacing(8),
    paddingHorizontal: responsiveSpacing(12),
    borderRadius: responsiveSize(8),
    alignItems: "center",
    justifyContent: "center",
  },
  levelButtonActive: {
    backgroundColor: "#2FA6F3",
    shadowColor: "#2FA6F3",
    shadowOpacity: 0.3,
    shadowRadius: responsiveSize(4),
    shadowOffset: { width: 0, height: responsiveSize(2) },
    elevation: 3,
  },
  levelButtonText: {
    fontSize: responsiveFontSize(12),
    fontWeight: "700",
    color: "#6B7280",
  },
  levelButtonTextActive: {
    color: "#FFFFFF",
  },
  levelButtonDisabled: {
    opacity: 0.5,
  },
  levelButtonTextDisabled: {
    color: "#9CA3AF",
  },
  passagesContainer: {
    paddingTop: responsiveSpacing(8),
  },
  passageCard: {
    position: "relative",
    flexDirection: "row",
    gap: responsiveSpacing(19),
    padding: responsiveSpacing(16),
    borderRadius: responsiveSize(20),
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: responsiveSpacing(16),
    // Enhanced shadow
    shadowColor: "#2FA6F3",
    shadowOpacity: 0.1,
    shadowRadius: responsiveSize(12),
    shadowOffset: { width: 0, height: responsiveSize(6) },
    elevation: 8,
    overflow: "hidden",
  },
  // Gradient background effect
  gradientBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: responsiveSize(20),
    backgroundColor: "#F0F8FF",
    opacity: 0.3,
  },

  // Soft background effect
  softBg: {
    position: "absolute",
    left: responsiveSpacing(8),
    top: responsiveSpacing(10),
    width: responsiveSize(74),
    height: responsiveSize(84),
    borderRadius: responsiveSize(16),
    backgroundColor: "#F0F8FF",
    opacity: 0.6,
    // Enhanced shadow effect
    shadowColor: "#2FA6F3",
    shadowOpacity: 0.3,
    shadowRadius: responsiveSize(20),
    shadowOffset: { width: 0, height: responsiveSize(4) },
    elevation: 4,
  },

  iconWrap: {
    width: responsiveSize(54),
    height: responsiveSize(54),
    borderRadius: responsiveSize(16),
    backgroundColor: "#F0F8FF",
    borderWidth: 1,
    borderColor: "#B3D9FF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    // Enhanced shadow
    shadowColor: "#2FA6F3",
    shadowOpacity: 0.2,
    shadowRadius: responsiveSize(8),
    shadowOffset: { width: 0, height: responsiveSize(2) },
    elevation: 3,
  },
  iconInner: {
    width: responsiveSize(36),
    height: responsiveSize(36),
    borderRadius: responsiveSize(10),
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#B3D9FF",
    alignItems: "center",
    justifyContent: "center",
    // Subtle shadow
    shadowColor: "#2FA6F3",
    shadowOpacity: 0.1,
    shadowRadius: responsiveSize(4),
    shadowOffset: { width: 0, height: responsiveSize(1) },
    elevation: 1,
  },

  content: {
    flex: 1,
    paddingRight: responsiveSpacing(4),
  },
  passageTitle: {
    fontSize: responsiveFontSize(24),
    lineHeight: responsiveSize(28),
    fontWeight: "800",
    color: "#2C5530",
    marginBottom: responsiveSpacing(16),
  },
  passageContent: {
    fontSize: responsiveFontSize(16),
    lineHeight: responsiveSize(24),
    color: "#6B7280",
    marginRight: responsiveSpacing(10),
  },

  readMore: {
    alignSelf: "flex-end",
    marginTop: responsiveSpacing(20),
    flexDirection: "row",
    alignItems: "center",
    gap: responsiveSpacing(6),
    paddingHorizontal: responsiveSpacing(14),
    paddingVertical: responsiveSpacing(7),
    borderRadius: responsiveSize(20),
    borderWidth: 1.5,
    backgroundColor: "transparent",
    borderColor: "#2FA6F3",
    // Subtle shadow
    shadowColor: "#2FA6F3",
    shadowOpacity: 0.1,
    shadowRadius: responsiveSize(4),
    shadowOffset: { width: 0, height: responsiveSize(2) },
    elevation: 2,
  },
  readMoreText: {
    color: "#2FA6F3",
    fontWeight: "800",
    fontSize: responsiveFontSize(14),
  },
  completionBadge: {
    position: "absolute",
    top: -responsiveSize(4),
    right: -responsiveSize(4),
    width: responsiveSize(20),
    height: responsiveSize(20),
    borderRadius: responsiveSize(10),
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#10B981",
    shadowOpacity: 0.3,
    shadowRadius: responsiveSize(4),
    shadowOffset: { width: 0, height: responsiveSize(2) },
    elevation: 4,
  },
  lockBadge: {
    position: "absolute",
    top: -responsiveSize(4),
    right: -responsiveSize(4),
    width: responsiveSize(20),
    height: responsiveSize(20),
    borderRadius: responsiveSize(10),
    backgroundColor: "#9CA3AF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#9CA3AF",
    shadowOpacity: 0.3,
    shadowRadius: responsiveSize(4),
    shadowOffset: { width: 0, height: responsiveSize(2) },
    elevation: 4,
  },
  lockedText: {
    color: "#9CA3AF",
  },
  lockedReadMore: {
    borderColor: "#9CA3AF",
    shadowColor: "#9CA3AF",
    shadowOpacity: 0.05,
  },
  lockedReadMoreText: {
    color: "#9CA3AF",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveSpacing(40),
    paddingVertical: responsiveSpacing(80),
  },
  emptyIconContainer: {
    width: responsiveSize(140),
    height: responsiveSize(140),
    borderRadius: responsiveSize(70),
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: responsiveSpacing(24),
  },
  emptyTitle: {
    fontSize: responsiveFontSize(24),
    fontWeight: "800",
    color: "#2C5530",
    marginBottom: responsiveSpacing(12),
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: responsiveFontSize(16),
    color: "#2FA6F3",
    textAlign: "center",
    lineHeight: responsiveSize(26),
    fontWeight: "600",
  },
  debugContainer: {
    marginTop: responsiveSpacing(20),
    padding: responsiveSpacing(16),
    backgroundColor: "#F9FAFB",
    borderRadius: responsiveSize(8),
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  debugText: {
    fontSize: responsiveFontSize(12),
    color: "#6B7280",
    textAlign: "center",
    marginBottom: responsiveSpacing(4),
  },
  mascotContainer: {
    width: "100%",
    height: 400,
    marginTop: 140,
  },
});
