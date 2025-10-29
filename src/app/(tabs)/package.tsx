import {
  createPayOSCheckoutAPI,
  getAllPackagesAPI,
  getUserProfileAPI,
} from "@/app/utils/apiall";
import ShareButton from "@/components/button/share.button";
import SafeAreaTabWrapper from "@/components/layout/SafeAreaTabWrapper";
import LoadingSpinner from "@/components/loading/LoadingSpinner";
import { useMascotManager } from "@/components/mascotWithBubble/MascotManager";
import MascotWithBubble from "@/components/mascotWithBubble/mascotWithBubble";
import CustomScrollView from "@/components/refresh/CustomScrollView";
import TextBetweenLine from "@/components/text/textline";
import { responsiveSize, responsiveSpacing } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Alert, Linking, StyleSheet, Text, View } from "react-native";

interface Package {
  id: number;
  title: string;
  price: string;
  durationDays: number;
  isUnlimited: boolean;
  level: string;
  features: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface UserPackage {
  id: number;
  startDate: string;
  endDate: string | null;
  status: string;
  package: {
    id: number;
    title: string;
    price: string;
    level: string;
  };
}

export default function PricingScreen() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing] = useState(false);
  const [activePackage, setActivePackage] = useState<UserPackage | null>(null);
  const { getMascotByType } = useMascotManager();

  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllPackagesAPI();

      if (Array.isArray(response)) {
        setPackages(response);
      } else {
        setError("Không thể tải dữ liệu gói dịch vụ");
      }
    } catch (err: any) {
      console.error("Error fetching packages:", err);
      setError("Lỗi khi tải dữ liệu gói dịch vụ");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActivePackage = useCallback(async () => {
    try {
      const response = await getUserProfileAPI();
      console.log("📦 User Profile Response:", response);

      if (response && (response as any).package) {
        const userPackageData = (response as any).package;
        console.log("📦 Active Package:", userPackageData);

        // Kiểm tra status ACTIVE
        if (userPackageData.status === "ACTIVE") {
          setActivePackage(userPackageData);
        }
      }
    } catch (err: any) {
      console.error("Error fetching active package:", err);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
    fetchActivePackage();
  }, [fetchPackages, fetchActivePackage]);

  const onRefresh = useCallback(async () => {
    try {
      await Promise.all([fetchPackages(), fetchActivePackage()]);
    } catch (error) {
      console.error("Error refreshing packages:", error);
    }
  }, [fetchPackages, fetchActivePackage]);

  // Helper function để format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Không giới hạn";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Kiểm tra xem package có đang active không
  const isPackageActive = (packageId: number) => {
    return (
      activePackage?.package?.id === packageId &&
      activePackage?.status === "ACTIVE"
    );
  };

  const handleSubscribe = async (packageData: Package) => {
    try {
      Alert.alert(
        "Đăng ký gói",
        `Bạn có muốn đăng ký gói "${packageData.title}" với giá ${packageData.price} VNĐ không?`,
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Đăng ký",
            onPress: async () => {
              try {
                // Lấy userId từ AsyncStorage
                const userIdStr = await AsyncStorage.getItem("userId");
                const userId = userIdStr ? parseInt(userIdStr, 10) : 1;

                // Parse amount từ price
                const priceStr = (packageData.price || "").toString().trim();
                const normalized = priceStr.replace(/,/g, "");
                const parsed = Number(normalized);
                const amount = Number.isFinite(parsed) ? Math.round(parsed) : 0;

                if (amount <= 0) {
                  Alert.alert(
                    "Gói miễn phí hoặc chưa có giá",
                    "Gói này không cần thanh toán (amount = 0). Vui lòng chọn gói có phí để tạo thanh toán."
                  );
                  return;
                }

                // Gọi API với đúng format: amount, packageId, userId
                const res: any = await createPayOSCheckoutAPI({
                  amount,
                  packageId: packageData.id,
                  userId,
                });
                console.log(
                  "Checkout API response:",
                  JSON.stringify(res, null, 2)
                );

                const urlCandidate =
                  res?.checkoutUrl ||
                  res?.paymentLink?.checkoutUrl ||
                  res?.data?.checkoutUrl;

                if (
                  typeof urlCandidate === "string" &&
                  urlCandidate.length > 0
                ) {
                  await Linking.openURL(urlCandidate);
                } else {
                  Alert.alert(
                    "Không thể mở trang thanh toán",
                    "Server không trả về checkout URL hợp lệ."
                  );
                }
              } catch (e: any) {
                console.log("Checkout error:", e?.message || e);
                Alert.alert(
                  "Lỗi thanh toán",
                  "Không thể tạo đơn thanh toán. Vui lòng thử lại sau."
                );
              }
            },
          },
        ]
      );
    } catch (err) {
      console.error("handleSubscribe error:", err);
    }
  };

  // Bỏ loading và error state riêng biệt, tích hợp vào CustomScrollView

  // Default fallback card when API returns empty
  const fallbackPackage: Partial<Package> = {
    level: "BASIC",
    price: "0",
    features: [],
    title: "Gói Trial 14 ngày",
    durationDays: 14,
    description: "Mô tả gói dịch vụ",
  } as any;

  return (
    <CustomScrollView
      onRefresh={onRefresh}
      refreshing={refreshing}
      refreshMessage="Đang tải gói dịch vụ..."
    >
      <SafeAreaTabWrapper style={styles.safe}>
        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <LoadingSpinner />
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <ShareButton
              title="Thử lại"
              onPress={fetchPackages}
              variant="primary"
              block
              buttonStyle={{
                backgroundColor: "#3B82F6",
                height: 48,
                borderRadius: 16,
                paddingHorizontal: 24,
                marginTop: 20,
                width: "80%",
                shadowColor: "#3B82F6",
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
              textStyle={{
                color: "#FFFFFF",
                fontWeight: "700",
                fontSize: 16,
                letterSpacing: 0.5,
              }}
            />
          </View>
        )}

        {/* Content - chỉ hiển thị khi không loading và không error */}
        {!loading && !error && (
          <>
            <View style={styles.header}>
              <Text style={styles.h1}>Gói nâng cao</Text>
            </View>
            <View style={styles.mascotContainer}>
              <MascotWithBubble
                message="Hãy chọn gói phù hợp với nhu cầu của bạn"
                mascotSource={getMascotByType("longlanh").source}
                containerStyle={StyleSheet.absoluteFill}
                mascotWidth={responsiveSize(130)}
                mascotHeight={responsiveSize(130)}
                mascotPosition={{
                  left: responsiveSize(-8),
                  bottom: responsiveSize(200),
                }}
                bubblePosition={{
                  left: responsiveSize(100),
                  top: responsiveSize(-120),
                }}
                bubbleStyle={{
                  height: responsiveSize(70),
                  width: responsiveSize(220),
                }}
                bgColor={
                  getMascotByType("longlanh").recommendedBubbleColor?.bgColor
                }
                borderColor={
                  getMascotByType("longlanh").recommendedBubbleColor
                    ?.borderColor
                }
                responsive={true}
              />
            </View>

            {(packages.length > 0
              ? packages
              : [fallbackPackage as Package]
            ).map((pkg, idx) => {
              const isActive = isPackageActive(pkg.id);
              return (
                <View
                  style={[styles.card, isActive && styles.activeCard]}
                  key={pkg.id ?? `pkg-${idx}`}
                >
                  {/* Active badge */}
                  {isActive && (
                    <View style={styles.activeBadgeContainer}>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#10B981"
                      />
                      <Text style={styles.activeBadgeText}>Đang sử dụng</Text>
                    </View>
                  )}

                  {/* top row */}
                  <View style={styles.cardHeader}>
                    <View style={styles.row}>
                      <View style={styles.badge}>
                        <Ionicons
                          name="person-circle-outline"
                          size={24}
                          color="#454a53"
                        />
                        <Text style={styles.badgeTxt}>Cá nhân</Text>
                        <Text style={styles.duration}>
                          {pkg.durationDays} ngày
                        </Text>
                      </View>
                      <View style={styles.badgeOutline}>
                        <Text style={styles.badgeOutlineTxt}>{pkg.level}</Text>
                      </View>
                    </View>

                    <Text style={styles.price}>
                      {parseFloat((pkg.price || "0") as any).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      <Text style={styles.unit}>vnđ/ tháng</Text>
                    </Text>
                    <Text style={styles.description}>{pkg.description}</Text>

                    {/* Hiển thị thông tin active package */}
                    {isActive && activePackage && (
                      <View style={styles.activeInfoContainer}>
                        <View style={styles.activeInfoRow}>
                          <Ionicons
                            name="calendar-outline"
                            size={16}
                            color="#6B7280"
                          />
                          <Text style={styles.activeInfoLabel}>
                            Ngày bắt đầu:
                          </Text>
                          <Text style={styles.activeInfoValue}>
                            {formatDate(activePackage.startDate)}
                          </Text>
                        </View>
                        <View style={styles.activeInfoRow}>
                          <Ionicons
                            name="calendar-outline"
                            size={16}
                            color="#6B7280"
                          />
                          <Text style={styles.activeInfoLabel}>
                            Ngày kết thúc:
                          </Text>
                          <Text style={styles.activeInfoValue}>
                            {formatDate(activePackage.endDate)}
                          </Text>
                        </View>
                      </View>
                    )}

                    <ShareButton
                      title={isActive ? "Đã sử dụng" : "Đăng ký ngay"}
                      onPress={() => !isActive && handleSubscribe(pkg)}
                      variant="primary"
                      disabled={isActive}
                      block
                      buttonStyle={{
                        backgroundColor: isActive ? "#9CA3AF" : "#3B82F6",
                        height: 52,
                        borderRadius: 16,
                        paddingHorizontal: 24,
                        marginTop: 20,
                        width: "100%",
                        shadowColor: isActive ? "#9CA3AF" : "#3B82F6",
                        shadowOffset: {
                          width: 0,
                          height: 4,
                        },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6,
                        opacity: isActive ? 0.6 : 1,
                      }}
                      textStyle={{
                        color: "#FFFFFF",
                        fontWeight: "700",
                        fontSize: 16,
                        letterSpacing: 0.5,
                      }}
                    />
                  </View>
                  <View style={styles.features}>
                    {(pkg.features || []).map((feature: string, i: number) => (
                      <View style={styles.feature} key={i}>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#10B981"
                        />
                        <Text style={styles.fTxt}>{feature}</Text>
                      </View>
                    ))}

                    <View style={styles.upgradeSection}>
                      <TextBetweenLine
                        color="#E2E8F0"
                        paddingHorizontal={24}
                        text="Nâng cấp để truy cập"
                      />
                    </View>
                    {[
                      "Truy cập không giới hạn",
                      "Tính năng cao cấp",
                      "Hỗ trợ ưu tiên",
                    ].map((t, i) => (
                      <View style={styles.feature} key={`b-${i}`}>
                        <Ionicons
                          name="lock-closed"
                          size={20}
                          color="#94A3B8"
                        />
                        <Text style={[styles.fTxt, { color: "#94A3B8" }]}>
                          {t}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </>
        )}
      </SafeAreaTabWrapper>
    </CustomScrollView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: responsiveSpacing(80),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 20,
  },
  header: {
    display: "flex",
    flex: 1,

    justifyContent: "center",
    alignItems: "center",

    marginTop: 20,
    marginBottom: 20,
  },
  h1: {
    fontSize: 36,
    fontWeight: "800",
    color: "#1E293B",
    letterSpacing: -0.5,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 0,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    marginVertical: 8,
    overflow: "hidden",
    marginBottom: responsiveSpacing(30),
  },
  activeCard: {
    borderWidth: 3,
    borderColor: "#10B981",
    shadowColor: "#10B981",
    shadowOpacity: 0.2,
  },
  activeBadgeContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    zIndex: 10,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  activeBadgeText: {
    color: "#047857",
    fontWeight: "700",
    fontSize: 12,
  },
  activeInfoContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  activeInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activeInfoLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
    flex: 1,
  },
  activeInfoValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeTxt: {
    color: "#475569",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.2,
  },
  badgeOutline: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  badgeOutlineTxt: {
    color: "#3B82F6",
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.5,
  },

  price: {
    fontSize: 42,
    fontWeight: "900",
    color: "#1E293B",
    marginVertical: 12,
    letterSpacing: -1,
  },
  unit: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
    letterSpacing: 0.2,
  },

  features: {
    marginTop: 20,
    gap: 16,
    marginLeft: 24,
    paddingBottom: 24,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  fTxt: {
    color: "#334155",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 20,
    marginHorizontal: 24,
  },
  cardHeader: {
    marginBottom: 0,
    backgroundColor: "#FFFFFF",
    position: "relative",
    padding: 24,
    borderRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  duration: {
    color: "#3B82F6",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  description: {
    color: "#64748B",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  upgradeSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  mascotContainer: {
    width: "100%",
    height: 140,
    marginTop: 140,
  },
});
