import { getAllPackagesAPI } from "@/app/utils/apiall";
import ShareButton from "@/components/button/share.button";
import SafeAreaTabWrapper from "@/components/layout/SafeAreaTabWrapper";
import LoadingSpinner from "@/components/loading/LoadingSpinner";
import { useMascotManager } from "@/components/mascotWithBubble/MascotManager";
import MascotWithBubble from "@/components/mascotWithBubble/mascotWithBubble";
import TextBetweenLine from "@/components/text/textline";
import { responsiveSize } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

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

export default function PricingScreen() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
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

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchPackages();
    } catch (error) {
      console.error('Error refreshing packages:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchPackages]);

  const handleSubscribe = (packageData: Package) => {
    Alert.alert(
      "Đăng ký gói",
      `Bạn có muốn đăng ký gói "${packageData.title}" với giá ${packageData.price} VNĐ không?`,
      [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng ký", onPress: () => {
          // TODO: Implement subscription logic
          console.log("Subscribing to package:", packageData);
        }}
      ]
    );
  };

  
  if (loading) {
    return (
      <SafeAreaTabWrapper style={styles.safe}>
        <LoadingSpinner />
      </SafeAreaTabWrapper>
    );
  }

  if (error) {
    return (
      <SafeAreaTabWrapper style={styles.safe}>
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
      </SafeAreaTabWrapper>
    );
  }

  // Get the first package or use default values
  const currentPackage = packages[0] || {
    level: "BASIC",
    price: "0",
    features: []
  };
  
  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#3B82F6']} // Android
          tintColor="#3B82F6" // iOS
        />
      }
    >
     <SafeAreaTabWrapper style={styles.safe}>
       <View style={styles.header}>
         <Text style={styles.h1}>Gói nâng cao</Text>
        
       </View>
       <View style={styles.mascotContainer}>
          <MascotWithBubble
            message="Hãy chọn gói phù hợp với nhu cầu của bạn"
            mascotSource={getMascotByType('longlanh').source}
            containerStyle={StyleSheet.absoluteFill}
            mascotWidth={responsiveSize(130)}
            mascotHeight={responsiveSize(130)}
            mascotPosition={{ 
              left: responsiveSize(-8), 
              bottom: responsiveSize(200) 
            }}
            bubblePosition={{ 
              left: responsiveSize(100), 
              top: responsiveSize(-120) 
            }}
            bubbleStyle={{
              height: responsiveSize(70), 
              width: responsiveSize(220)
            }}
            bgColor={getMascotByType('longlanh').recommendedBubbleColor?.bgColor}
            borderColor={getMascotByType('longlanh').recommendedBubbleColor?.borderColor}
            responsive={true}
          />
        </View>

      <View style={styles.card}>
        {/* top row */}
        <View style={styles.cardHeader}>
          <View style={styles.row}>
            <View style={styles.badge}>
              <Ionicons
                name="person-circle-outline"
                size={24}
                color="#454a53"
              />
              <Text style={styles.badgeTxt}>
                Cá nhân 
              </Text>
              <Text style={styles.duration}>{currentPackage.durationDays} ngày</Text>
            </View>
            <View style={styles.badgeOutline}>
              <Text style={styles.badgeOutlineTxt}>{currentPackage.level}</Text>
            </View>
          </View>

          <Text style={styles.price}>
            {parseFloat(currentPackage.price).toLocaleString('vi-VN')} <Text style={styles.unit}>vnđ/ tháng</Text>
          </Text>
          <Text style={styles.description}>{currentPackage.description}</Text>

          <ShareButton
            title="Đăng ký ngay"
            onPress={() => handleSubscribe(currentPackage)}
            variant="primary"
            block
            buttonStyle={{
              backgroundColor: "#3B82F6",
              height: 52,
              borderRadius: 16,
              paddingHorizontal: 24,
              marginTop: 20,
              width: "100%",
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
        <View style={styles.features}>
          {currentPackage.features.map((feature: string, i: number) => (
            <View style={styles.feature} key={i}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
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
              <Ionicons name="lock-closed" size={20} color="#94A3B8" />
              <Text style={[styles.fTxt, { color: "#94A3B8" }]}>{t}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaTabWrapper>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    paddingHorizontal: 20,
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
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 20,
    fontWeight: "600",
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
    width: '100%',
    height: 140,
    marginTop: 140,
  },
});
