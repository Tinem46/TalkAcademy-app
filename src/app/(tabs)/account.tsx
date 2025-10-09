// import React from "react";
import ShareButton from "@/components/button/share.button";
import SafeAreaTabWrapper from "@/components/layout/SafeAreaTabWrapper";
import TextBetweenLine from "@/components/text/textline";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function PricingScreen() {
  return (
    <SafeAreaTabWrapper style={styles.safe}>
      <Text style={styles.h1}>Gói nâng cao</Text>

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
              <Text style={styles.badgeTxt}>Cá nhân</Text>
            </View>
            <View style={styles.badgeOutline}>
              <Text style={styles.badgeOutlineTxt}>Ưu đãi</Text>
            </View>
          </View>

          <Text style={styles.price}>
            139.000 <Text style={styles.unit}>/ tháng</Text>
          </Text>

          <ShareButton
            title="Đăng ký"
            onPress={() => {}}
            variant="primary"
            block
            buttonStyle={{
              backgroundColor: "#43b7fa",
              height: 44,
              borderRadius: 12,
              paddingHorizontal: 16,
              margin: "auto",
              marginTop: 16,
              width: "80%",
            }}
            textStyle={{ color: "#0E3152", fontWeight: "800" }}
          />
        </View>
        <View style={styles.features}>
          {[
            "Offering one of the plan",
            "Offering Two of the plan",
            "Offering Three of the plan",
            "Offering Four of the plan",
            "Offering Five of the plan",
          ].map((t, i) => (
            <View style={styles.feature} key={i}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.fTxt}>{t}</Text>
            </View>
          ))}
          <View style={{ marginTop: 22, marginBottom: 22 }}>
            <TextBetweenLine
              color="#CFEAFF"
              paddingHorizontal={36}
              text="Upgrade to access"
            />
          </View>
          {[
            "Upgrade to Access",
            "Offering One of the plan",
            "Offering Two of the plan",
          ].map((t, i) => (
            <View style={styles.feature} key={`b-${i}`}>
              <Ionicons name="shield-outline" size={18} color="#DDF2FF" />
              <Text style={[styles.fTxt, { opacity: 0.85 }]}>{t}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaTabWrapper>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent", paddingHorizontal: 26 },
  h1: {
    fontSize: 45,
    fontWeight: "800",
    color: "#1B1B1B",
    marginBottom: 16,
    textAlign: "center",
    marginTop: 24,
  },

  card: {
    backgroundColor: "#43b7fa",
    borderRadius: 16,
    padding: 12,
    elevation: 6,
   
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  badgeTxt: { color: "#454a53", fontWeight: "700", fontSize: 16 },
  badgeOutline: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#C7E8FF",
  },
  badgeOutlineTxt: { color: "#43b7fa", fontWeight: "600", fontSize: 14 },

  price: {
    fontSize: 48,
    fontWeight: "900",
    color: "#454a53",
    marginVertical: 10,
  },
  unit: { fontSize: 16, fontWeight: "600", color: "#9ea2ad" },

  features: { marginTop: 14, gap: 14, marginLeft: 20 },
  feature: { flexDirection: "row", alignItems: "center", gap: 8 },
  fTxt: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  divider: {
    height: 1,
    backgroundColor: "#CFEAFF",
    opacity: 0.6,
    marginVertical: 6,
  },
  cardHeader: {
    marginBottom: 20,
    backgroundColor: "white",
    position: "relative",
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E6EEF5",
  },
});
