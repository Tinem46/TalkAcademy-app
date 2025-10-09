import ShareButton from "@/components/button/share.button";
import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import QuoteCard from "../card/quoteCard";
import ProgressBar from "./progressBar";

export type OptionItem = {
  id: string;
  label: string;
  icon?: React.ReactNode | ImageSourcePropType;
  type?: "choice" | "text";
};

interface QuestionLayoutProps {
  progress?: number; // 0..1
  progressText?: string; // "15%"
  question: string;
  options: OptionItem[];
  selectionMode?: "single" | "multiple";
  initialSelected?: string[];
  nextLabel?: string;
  onBack?: () => void;
  onNext: (answers: { id: string; value?: string }[]) => void;
}
const BRAND_GREEN = "#1B7A6C";
const CARD_BG = "#E7F4FF"; // Light blue background
const CHIP_BG = "#E7F4FF"; // Light blue for chips
const CHIP_BORDER = "#2AA0FF"; // Bright blue border
const CTA_BLUE = "#2AA0FF"; // Primary blue for CTAs
const CTA_TEXT = "#FFFFFF"; // White text on CTAs

const QuestionLayout: React.FC<QuestionLayoutProps> = ({
  progress = 0,
  progressText,
  question,
  options,
  selectionMode = "single",
  initialSelected = [],
  nextLabel = "Tiếp tục",
  onBack,
  onNext,
}) => {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [textValues, setTextValues] = useState<Record<string, string>>({});

  const canContinue = useMemo(
    () =>
      selected.length > 0 ||
      options.some(
        (o) => o.type === "text" && (textValues[o.id] || "").trim() !== ""
      ),
    [selected, textValues, options]
  );

  const toggle = (id: string) => {
    if (selectionMode === "single") {
      setSelected((prev) => (prev.includes(id) ? [] : [id]));
    } else {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    }
  };

  const handleNext = () => {
    const answers = options
      .filter((o) => selected.includes(o.id) || o.type === "text")
      .map((o) => ({
        id: o.id,
        value: o.type === "text" ? (textValues[o.id] || "").trim() : undefined,
      }))
      .filter((a) => (a.value ? a.value.length > 0 : selected.includes(a.id)));

    onNext(answers);
  };

  return (
    
      <View style={styles.safe}>
        {/* Header: progress */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <ProgressBar
              progress={progress}
              height={36}
              trackColor="#E5E7EA" // Màu nền xám nhạt
              tintColor="#43B7FA" // Màu xanh cho phần tiến độ
              trackPadding={0} // Loại bỏ padding để màu hiển thị đúng
            />
          </View>
        </View>

        {/* Quote card */}
        <QuoteCard
          text={question}
          style={{ marginBottom: 32 }}
          colors={{
            background: CARD_BG,
            quoteMark: BRAND_GREEN,
            question: "#30414A",
            micBg: "#E7F4FF",
            micIcon: "#49A0D7",
          }}
        />

        {/* Options */}
        <ScrollView
          contentContainerStyle={styles.optionsWrap}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {options.map((o) => {
            const isSelected = selected.includes(o.id);
            const isText = o.type === "text";

            return (
              <View key={o.id} style={styles.optionContainer}>
                {isText ? (
                  <View style={[styles.optionBase, styles.optionInput]}>
                    <TextInput
                      value={textValues[o.id] || ""}
                      onChangeText={(t) =>
                        setTextValues((prev) => ({ ...prev, [o.id]: t }))
                      }
                      placeholder={o.label}
                      placeholderTextColor="#7E7E7E"
                      style={styles.input}
                    />
                  </View>
                ) : (
                  <Pressable
                    onPress={() => toggle(o.id)}
                    style={({ pressed }) => [
                      styles.optionBase,
                      isSelected && styles.optionSelected,
                      pressed && { opacity: 0.9 },
                    ]}
                  >
                    {!!o.icon &&
                      (React.isValidElement(o.icon) ? (
                        o.icon
                      ) : (
                        <Image
                          source={o.icon as ImageSourcePropType}
                          style={styles.optionIcon}
                          resizeMode="contain"
                        />
                      ))}
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && { color: "white", fontWeight: "700" },
                      ]}
                      numberOfLines={2}
                    >
                      {o.label}
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Footer actions */}
        <View style={styles.footer}>
          <Pressable onPress={onBack} hitSlop={10} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#0F3D57" />
          </Pressable>

          <View style={styles.footerSpacer} />

          <View style={styles.nextButtonContainer}>
            <ShareButton
              title={nextLabel}
              onPress={handleNext}
              variant="primary"
              size="md"
              block
              disabled={!canContinue}
              buttonStyle={styles.nextButton}
              textStyle={styles.nextButtonText}
            />
          </View>
        </View>
      </View>
   
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16, // Giảm margin bottom từ 32 xuống 16
    paddingHorizontal: 4,
  },

  // quote card
  quoteCard: {
    minHeight: 160,
    backgroundColor: CARD_BG,
    borderRadius: 14,
    paddingTop: 12,
    paddingBottom: 28,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 32,
  },
  quoteMark: {
    fontSize: 28,
    color: BRAND_GREEN,
    marginBottom: 6,
    lineHeight: 28,
  },
  question: {
    fontSize: 24,
    textAlign: "center",
    color: "#30414A",
    marginBottom: 26,
  },
  cardMic: {
    position: "absolute",
    left: 14,
    bottom: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E7F4FF",
    alignItems: "center",
    justifyContent: "center",
  },

  // options grid
  optionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  optionContainer: {
    width: "48%",
    marginBottom: 16,
    minHeight: 80,
  },
  optionBase: {
    flex: 1,
    minHeight: 80,
    borderRadius: 10,
    backgroundColor: CHIP_BG,
    borderWidth: 1,
    borderColor: CHIP_BORDER,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",

    // bóng nhẹ như mockup
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  optionInput: {
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  optionSelected: {
    backgroundColor: "#0F3D57",
    borderColor: "#0F3D57",
  },
  optionIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  optionText: {
    color: "#2B2B2B",
    fontSize: 13,
    textAlign: "center",
    flex: 1,
    lineHeight: 16,
  },
  input: {
    width: "100%",
    fontSize: 14,
    paddingVertical: 8,
    color: "#000",
    textAlign: "center",
  },

  // footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  backButton: {
    padding: 8,
  },
  footerSpacer: {
    flex: 1,
  },
  nextButtonContainer: {
    minWidth: 120,
    maxWidth: 160,
    flex: 0,
  },
  nextButton: {
    backgroundColor: CTA_BLUE,
    borderRadius: 12,
    height: 46,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  nextButtonText: {
    color: CTA_TEXT,
    fontWeight: "800",
    fontSize: 16,
  },
});

export default QuestionLayout;
