import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

interface Props {
  progress: number; // 0..1
  height?: number; // độ dày thanh
  trackColor?: string; // màu nền track
  tintColor?: string; // màu phần tiến độ
  rounded?: boolean; // bo tròn
  style?: StyleProp<ViewStyle>; // style ngoài (margin, width...)
  /** Animation options */
  animate?: boolean;
  duration?: number; // ms
  easing?: (value: number) => number;
  trackPadding?: number; // padding ngang của track

  /** Label options (mới) */
  showLabel?: boolean; // hiện % bên phải
  labelPosition?: "right" | "inside"; // đặt % bên phải hoặc nằm trong thanh
  labelStyle?: StyleProp<TextStyle>; // style chữ %
  labelGap?: number; // khoảng cách track <-> label khi "right"
  format?: (p: number) => string; // custom format
}

const ProgressBar: React.FC<Props> = ({
  progress,
  height = 28, // Giảm từ 36 xuống 28
  trackColor = "#E5E7EA", // Đổi màu nền mặc định
  tintColor = "#43B7FA", // Đổi màu tiến độ mặc định
  rounded = true,
  style,
  animate = true,
  duration = 500,
  easing = Easing.out(Easing.cubic),
  trackPadding = 2,
  showLabel = true,
  labelPosition = "right",
  labelStyle,
  labelGap = 8, // Giảm từ 12 xuống 8
  format = (p) => `${Math.round(p * 100)}%`,
}) => {
  const clamp = (n: number) => Math.max(0, Math.min(1, n));
  const pct = clamp(progress);

  const [trackW, setTrackW] = useState(0);
  const animW = useRef(new Animated.Value(0)).current;

  const onTrackLayout = (e: LayoutChangeEvent) => {
    const w = Math.max(0, e.nativeEvent.layout.width - trackPadding * 2);
    setTrackW(w);
  };

  const animateTo = useCallback(
    (p: number, immediate = false) => {
      const target = Math.max(p > 0 ? height : 0, trackW * p);
      if (immediate || !animate) {
        animW.setValue(target);
      } else {
        Animated.timing(animW, {
          toValue: target,
          duration,
          easing,
          useNativeDriver: false, // width không hỗ trợ native driver
        }).start();
      }
    },
    [animate, animW, duration, easing, height, trackW]
  );

  useEffect(() => {
    if (trackW === 0) return;
    animateTo(pct);
  }, [pct, trackW, animateTo]);

  return (
    <View style={[styles.row, style]}>
      {/* Track + Bar */}
      <View
        onLayout={onTrackLayout}
        style={[
          styles.track,
          {
            height,
            backgroundColor: trackColor,
            borderRadius: rounded ? height / 2 : 0,
            paddingHorizontal: trackPadding,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.bar,
            {
              height,
              backgroundColor: tintColor,
              borderRadius: rounded ? height / 2 : 0,
              width: animW,
            },
          ]}
        />
        {showLabel && labelPosition === "inside" && (
          <Text numberOfLines={1} style={[styles.insideLabel, labelStyle]}>
            {format(pct)}
          </Text>
        )}
      </View>

      {/* Label bên phải */}
      {showLabel && labelPosition === "right" && (
        <Text style={[styles.rightLabel, { marginLeft: labelGap }, labelStyle]}>
          {format(pct)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  track: {
    flex: 1,
    overflow: "hidden",
  },
  bar: {},
  rightLabel: { color: "#7A7A7A", fontSize: 14 },
  insideLabel: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: [{ translateY: -10 }],
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
});

export default ProgressBar;
