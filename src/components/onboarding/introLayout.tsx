import ShareButton from "@/components/button/share.button";
import { MascotType, useMascotManager } from "@/components/mascotWithBubble/MascotManager";
import MascotWithBubble from "@/components/mascotWithBubble/mascotWithBubble";
import {
    getResponsivePadding,
    isSmallScreen,
    isTablet,
    responsiveBorderRadius,
    responsiveFontSize,
    responsiveSize,
    responsiveSpacing
} from "@/utils/responsive";
import React, { useMemo } from "react";
import {
    ImageSourcePropType,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
    useWindowDimensions,
} from "react-native";

type BubbleConfig = {
  containerStyle?: StyleProp<ViewStyle>;
  tail?: boolean;
  tailBigOffset?: Partial<Record<"left" | "right" | "top" | "bottom", number>>;
  tailSmallOffset?: Partial<
    Record<"left" | "right" | "top" | "bottom", number>
  >;
  bgColor?: string;
  borderColor?: string;
  radius?: number;
  bubbleStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  numberOfLines?: number;
};

type LocalMascotConfig = {
  width?: number;
  height?: number;
  position?: { left?: number; right?: number; top?: number; bottom?: number };
  style?: StyleProp<ViewStyle>;
  bubblePosition?: { left?: number; right?: number; top?: number; bottom?: number };
  mascotPosition?: { left?: number; right?: number; top?: number; bottom?: number };
};

interface IntroLayoutProps {
  message: string;
  illustrationUri?: string | ImageSourcePropType;
  mascotType?: MascotType; // Thêm prop để chọn mascot

  title?: string;
  titleStyle?: StyleProp<TextStyle>;
  titleContainerStyle?: StyleProp<ViewStyle>;

  mascotConfig?: LocalMascotConfig;
  bubbleConfig?: BubbleConfig;

  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;

  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  footerStyle?: StyleProp<ViewStyle>;
}

const IntroLayout: React.FC<IntroLayoutProps> = ({
  message,
  illustrationUri,
  mascotType = 'default', // Mặc định sử dụng mascot default
  title,
  titleStyle,
  titleContainerStyle,
  mascotConfig,
  bubbleConfig,
  onNext,
  nextLabel = "Tiếp tục",
  containerStyle,
  contentStyle,
  footerStyle,
}) => {
  const { getMascotByType } = useMascotManager();
  
  // Lấy mascot config từ mascotType hoặc sử dụng illustrationUri nếu có
  const selectedMascot = getMascotByType(mascotType);
  
  const src: ImageSourcePropType = illustrationUri
    ? (typeof illustrationUri === "string"
        ? { uri: illustrationUri }
        : (illustrationUri as ImageSourcePropType))
    : selectedMascot.source;

  const { width, height } = useWindowDimensions();
  const padding = getResponsivePadding();

  // Mascot size - responsive calculation - tăng kích thước to hơn
  const autoMascotSize = useMemo(() => {
    const baseSize = Math.min(width * 0.55, height * 0.45);
    const minSize = isSmallScreen() ? 250 : isTablet() ? 400 : 300;
    const maxSize = isTablet() ? 600 : 500;
    return Math.max(minSize, Math.min(maxSize, baseSize));
  }, [width, height]);

  // Content area height - responsive
  const contentHeight = useMemo(() => {
    const baseHeight = height * 0.6;
    const minHeight = isSmallScreen() ? height - 150 : height - 200;
    return Math.max(baseHeight, minHeight);
  }, [height]);

  // Bubble positioning - gần mascot hơn
  const bubbleLeft = useMemo(() => {
    const maxBubbleWidth = Math.min(width * 0.65, isTablet() ? 350 : 260);
    const offset = isSmallScreen() ? 30 : isTablet() ? 70 : 50;
    return Math.max(width * 0.05, width - maxBubbleWidth - offset);
  }, [width]);

  const bubbleTop = useMemo(() => {
    const minTop = isSmallScreen() ? 40 : isTablet() ? 80 : 60;
    const maxTop = isSmallScreen() ? 100 : isTablet() ? 140 : 120;
    return Math.max(minTop, Math.min(maxTop, height * 0.15));
  }, [height]);

  // Mascot config - sử dụng kích thước từ mascot nếu có
  const mWidth = mascotConfig?.width ?? selectedMascot.defaultSize?.width ?? autoMascotSize;
  const mHeight = mascotConfig?.height ?? selectedMascot.defaultSize?.height ?? autoMascotSize;

  // Bubble config with enhanced styling - sử dụng màu từ mascot nếu có
  const bc = {
    bgColor: bubbleConfig?.bgColor ?? selectedMascot.recommendedBubbleColor?.bgColor ?? "#E8F4FD",
    borderColor: bubbleConfig?.borderColor ?? selectedMascot.recommendedBubbleColor?.borderColor ?? "#64B5F6",
    radius: bubbleConfig?.radius ?? responsiveBorderRadius(isSmallScreen() ? 14 : isTablet() ? 28 : 20),
    tail: bubbleConfig?.tail ?? true,
    tailBigOffset: bubbleConfig?.tailBigOffset ?? { 
      left: Math.max(responsiveSize(25), width * 0.1), // Đuôi ở bên trái bubble, trỏ về mascot
      bottom: -Math.max(responsiveSize(13), width * 0.025) 

    },
    tailSmallOffset: bubbleConfig?.tailSmallOffset ?? { 
      left: Math.max(responsiveSize(12), width * 0.05), // Đuôi ở bên trái bubble, trỏ về mascot
      bottom: -Math.max(responsiveSize(23), width * 0.035) 
    },
    bubbleStyle: [
      {
        shadowColor: "#64B5F6",
        shadowOffset: {
          width: 0,
          height: responsiveSize(4),
        },
        shadowOpacity: 0.3,
        shadowRadius: responsiveSize(8),
        elevation: responsiveSize(8),
        borderWidth: responsiveSize(2),
      },
      bubbleConfig?.bubbleStyle,
    ] as StyleProp<ViewStyle>,
    textStyle: [
      {
        fontSize: responsiveFontSize(isSmallScreen() ? 16 : isTablet() ? 20 : 16),
        lineHeight: responsiveFontSize(isSmallScreen() ? 22 : isTablet() ? 26 : 22),
        color: "#1565C0",
        fontWeight: "600",
        textShadowColor: "rgba(255, 255, 255, 0.8)",
        textShadowOffset: { width: 0, height: responsiveSize(1) },
        textShadowRadius: responsiveSize(2),
      },
      bubbleConfig?.textStyle,
    ] as StyleProp<TextStyle>,
    numberOfLines: bubbleConfig?.numberOfLines,
    containerStyle: [
      {
        position: "absolute",
        top: bubbleTop,
        left: bubbleLeft,
        maxWidth: Math.min(width * 0.7, isTablet() ? 400 : 300),
        minWidth: Math.max(width * 0.5, isSmallScreen() ? 160 : 180),
      },
      bubbleConfig?.containerStyle,
    ] as StyleProp<ViewStyle>,
    responsive: true, // Enable responsive mode
  };

  return (
    <View style={[styles.safe, containerStyle]}>
      {!!title && (
        <View
          style={[
            { 
              paddingHorizontal: padding.horizontal, 
              marginTop: responsiveSpacing(8), 
              marginBottom: responsiveSpacing(4) 
            },
            titleContainerStyle,
          ]}
        >
          <Text style={[styles.title, titleStyle]}>{title}</Text>
        </View>
      )}

      {/* Main content area */}
      <View style={[styles.content, { height: contentHeight }, contentStyle]}>
        {/* Combined Mascot with Bubble */}
        <MascotWithBubble
          message={message}
          mascotSource={src}
          containerStyle={StyleSheet.absoluteFill}
          bubbleStyle={bc.bubbleStyle}
          textStyle={bc.textStyle}
          mascotStyle={mascotConfig?.style as any}
          bgColor={bc.bgColor}
          borderColor={bc.borderColor}
          radius={bc.radius}
          tail={bc.tail}
          bubblePosition={mascotConfig?.bubblePosition}
          mascotPosition={mascotConfig?.mascotPosition}
          mascotWidth={mWidth}
          mascotHeight={mHeight}
          responsive={true}
        />
      </View>

      {/* Footer with button */}
      <View style={[styles.footer, footerStyle]}>
        <ShareButton
          title={nextLabel}
          onPress={onNext}
          variant="primary"
          block
          textStyle={{
            color: "black",
            fontSize: responsiveFontSize(16),
            fontWeight: "600",
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: getResponsivePadding().horizontal,
    paddingTop: responsiveSpacing(68),
  },
  title: {
    fontSize: responsiveFontSize(24),
    fontWeight: "700",
    color: "#1565C0",
    textAlign: "center",
  },
  content: {
    flex: 1,
    position: "relative",
    width: "100%",
    paddingHorizontal: responsiveSpacing(20),
  },
  footer: {
    paddingHorizontal: responsiveSpacing(20),
    paddingBottom: responsiveSpacing(40),
    paddingTop: responsiveSpacing(16),
  },
});

export default IntroLayout;
