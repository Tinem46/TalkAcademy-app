import HeaderBar from "@/components/header/headerBar";
import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

export type ExerciseScreenProps = {
  header: {
    title: string;
    headline?: string;
    subline?: string;
    onBack?: () => void;
  };
  /** Nội dung chính (ví dụ: PromptCard + mic + caption) */
  children: ReactNode;
  /** Footer buttons (ví dụ: Làm lại, Tiếp tục) */
  footer?: ReactNode;
  /** Khoảng padding cho main */
  contentPadding?: number;
};

export default function ExerciseScreen({
  header,
  children,
  footer,
  contentPadding = 16,
}: ExerciseScreenProps) {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <HeaderBar {...header} />
      <View style={[styles.safe, { paddingHorizontal: contentPadding }]}>
        <View style={{ flex: 1 }}>{children}</View>
        {!!footer && <View style={styles.footer}>{footer}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingTop: 10 },
  footer: { marginTop: "auto", paddingVertical: 16 },
});
