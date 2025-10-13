import SafeAreaTabWrapper from "@/components/layout/SafeAreaTabWrapper";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

type NoticeKind = "done" | "speaker" | "minus";

type Notice = {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  kind: NoticeKind;
};

const DATA: Notice[] = [
  {
    id: "1",
    title: "Luyện tập hoàn thành",
    desc: "Bạn vừa hoàn thành bài",
    time: "2 phút hơn",
    read: false,
    kind: "done",
  },
  {
    id: "2",
    title: "Luyện tập hoàn thành",
    desc: "Bạn vừa hoàn thành bài",
    time: "2 phút hơn",
    read: true,
    kind: "speaker",
  },
  {
    id: "3",
    title: "Luyện tập hoàn thành",
    desc: "Bạn vừa hoàn thành bài",
    time: "2 phút hơn",
    read: true,
    kind: "minus",
  },
];

const ICON_COLOR = "#2AB6FF";

export default function NotificationsScreen() {
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [refreshing, setRefreshing] = useState(false);
  
  const data = useMemo(
    () => (tab === "all" ? DATA : DATA.filter((d) => !d.read)),
    [tab]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const renderKindIcon = (kind: NoticeKind) => {
    switch (kind) {
      case "done":
        return (
          <Ionicons name="checkmark-circle" size={44} color={ICON_COLOR} />
        );
      case "speaker":
        return <Ionicons name="volume-high" size={44} color={ICON_COLOR} />;
      case "minus":
        return <Ionicons name="remove-circle" size={44} color={ICON_COLOR} />;
      default:
        return <Ionicons name="notifications" size={44} color={ICON_COLOR} />;
    }
  };

  return (
    <SafeAreaTabWrapper style={styles.safe}>
      <Text style={styles.h1}>Thông Báo</Text>

      <View style={styles.segment}>
        <Pressable
          onPress={() => setTab("all")}
          style={[styles.segBtn, tab === "all" && styles.segActive]}
        >
          <Text style={[styles.segText, tab === "all" && styles.segTextActive]}>
            Tất cả
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("unread")}
          style={[styles.segBtn, tab === "unread" && styles.segActive]}
        >
          <Text
            style={[styles.segText, tab === "unread" && styles.segTextActive]}
          >
            Chưa Đọc
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 8 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2AB6FF']} // Android
            tintColor="#2AB6FF" // iOS
          />
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.iconWrap}>{renderKindIcon(item.kind)}</View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDesc}>{item.desc}</Text>
            </View>
            {/* thời gian ở góc dưới bên phải */}
            <Text style={styles.time}>{item.time}</Text>
          </View>
        )}
      />
    </SafeAreaTabWrapper>
  );
}

const BLUE_LIGHT = "#E8F4FF";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  h1: { fontSize: 45, fontWeight: "800", color: "#1B1B1B", marginBottom: 24 },

  segment: { flexDirection: "row", gap: 10, marginBottom: 10 },
  segBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  segActive: { borderBottomColor: "#0c80d8ff", borderBottomWidth: 2 },
  segText: { color: "#7B7B7B", fontWeight: "600", fontSize: 25 },
  segTextActive: { color: "#000000ff" },

  item: {
    position: "relative", // để đặt time tuyệt đối trong card
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: BLUE_LIGHT,
    marginBottom: 26,

  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 26,
    backgroundColor: "#F0FAFF",
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: {
    fontSize: 25,
    fontWeight: "700",
    color: "#1E2A33",
    marginBottom: 16,
  },
  itemDesc: { color: "#3E5561", marginTop: 2, fontSize: 15, marginBottom: 42 },

  // góc dưới bên phải
  time: {
    position: "absolute",
    right: 12,
    bottom: 12,
    color: "#8D99A5",
    fontSize: 15,
  },
});
