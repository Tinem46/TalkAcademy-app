import {
    getResponsiveShadow,
    isSmallScreen,
    isTablet,
    responsiveFontSize,
    responsiveSize,
    responsiveSpacing
} from "@/utils/responsive";
import React from "react";
import {
    Image,
    ImageSourcePropType,
    ImageStyle,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
    useWindowDimensions,
} from "react-native";

export interface MascotWithBubbleProps {
  message: string;
  mascotSource: ImageSourcePropType;
  containerStyle?: StyleProp<ViewStyle>;
  bubbleStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  mascotStyle?: StyleProp<ImageStyle>;
  
  // Bubble props
  bgColor?: string;
  borderColor?: string;
  radius?: number;
  tail?: boolean;
  
  // Position props
  bubblePosition?: {
    left?: number;
    top?: number;
    right?: number;
    bottom?: number;
  };
  mascotPosition?: {
    left?: number;
    top?: number;
    right?: number;
    bottom?: number;
  };
  
  // Mascot props
  mascotWidth?: number;
  mascotHeight?: number;
  responsive?: boolean;
}

const MascotWithBubble: React.FC<MascotWithBubbleProps> = ({
  message,
  mascotSource,
  containerStyle,
  bubbleStyle,
  textStyle,
  mascotStyle,
  bgColor = "#E8F4FD",
  borderColor = "#64B5F6",
  radius = 20,
  tail = true,
  bubblePosition,
  mascotPosition,
  mascotWidth,
  mascotHeight,
  responsive = true,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Tính toán kích thước mascot - đảm bảo luôn hiển thị đúng
  const getMascotSize = () => {
    if (!responsive) {
      return { width: mascotWidth || 300, height: mascotHeight || 300 };
    }

    // Tính toán dựa trên kích thước màn hình và tỷ lệ
    const screenRatio = screenWidth / screenHeight;
    let baseSize;
    
    if (isSmallScreen()) {
      // Màn hình nhỏ - ưu tiên chiều rộng
      baseSize = Math.min(screenWidth * 0.6, screenHeight * 0.4);
    } else if (isTablet()) {
      // Tablet - cân bằng giữa width và height
      baseSize = Math.min(screenWidth * 0.4, screenHeight * 0.5);
    } else {
      // Màn hình bình thường
      baseSize = Math.min(screenWidth * 0.5, screenHeight * 0.45);
    }
    
    // Đảm bảo kích thước tối thiểu và tối đa
    const minSize = isSmallScreen() ? 200 : isTablet() ? 300 : 250;
    const maxSize = isSmallScreen() ? 280 : isTablet() ? 450 : 350;
    const finalSize = Math.max(minSize, Math.min(maxSize, baseSize));
    
    return {
      width: mascotWidth || finalSize,
      height: mascotHeight || finalSize,
    };
  };

  // Tính toán kích thước bubble - responsive và cân đối
  const getBubbleSize = () => {
    if (!responsive) {
      return { width: 280, height: 120 };
    }

    // Tính toán width dựa trên màn hình
    let bubbleWidth;
    if (isSmallScreen()) {
      bubbleWidth = Math.min(screenWidth * 0.75, 280);
    } else if (isTablet()) {
      bubbleWidth = Math.min(screenWidth * 0.5, 400);
    } else {
      bubbleWidth = Math.min(screenWidth * 0.65, 320);
    }
    
    // Tính toán height dựa trên content và màn hình
    const bubbleHeight = isSmallScreen() ? 90 : isTablet() ? 130 : 110;
    
    return { width: bubbleWidth, height: bubbleHeight };
  };

  const mascotSize = getMascotSize();
  const bubbleSize = getBubbleSize();

  // Vị trí tương đối trong container - responsive và cân đối
  const getMascotPosition = () => {
    if (mascotPosition) {
      return {
        left: mascotPosition.left,
        top: mascotPosition.top,
        right: mascotPosition.right,
        bottom: mascotPosition.bottom,
      };
    }
    
    // Vị trí mascot gần bubble hơn
    const left = isSmallScreen() ? -55 : isTablet() ? -80 : -50;
    const bottom = isSmallScreen() ? 180 : isTablet() ? 160 : 200;
    
    return { left, top: undefined, right: undefined, bottom };
  };
  
  const getBubblePosition = () => {
    if (bubblePosition) {
      return {
        left: bubblePosition.left,
        top: bubblePosition.top,
        right: bubblePosition.right,
        bottom: bubblePosition.bottom,
      };
    }
    
    // Vị trí bubble gần mascot hơn
    const left = isSmallScreen() ? screenWidth * 0.19 : isTablet() ? screenWidth * 0.05 : screenWidth * 0.28;
    const top = isSmallScreen() ? 90 : isTablet() ? 120 : 100;
    
    return { left, top, right: undefined, bottom: undefined };
  };
  
  const mascotPos = getMascotPosition();
  const bubblePos = getBubblePosition();

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Speech Bubble */}
      <View
        style={[
          styles.bubble,
          {
            left: bubblePos.left,
            top: bubblePos.top,
            right: bubblePos.right,
            bottom: bubblePos.bottom,
            width: bubbleSize.width,
            height: bubbleSize.height,
            backgroundColor: bgColor,
            borderColor: borderColor,
            borderRadius: radius,
          },
          bubbleStyle,
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            textStyle,
          ]}
          numberOfLines={0}
          ellipsizeMode="tail"
        >
          {message}
        </Text>
        
        {/* Bubble Tail */}
        {tail && (
          <>
            <View
              style={[
                styles.tailBig,
                {
                  backgroundColor: bgColor,
                  borderColor: borderColor,
                  left: bubbleSize.width * 0.1,
                  bottom: -10,
                },
              ]}
            />
            <View
              style={[
                styles.tailSmall,
                {
                  backgroundColor: bgColor,
                  borderColor: borderColor,
                  left: bubbleSize.width * 0.05,
                  bottom: -20,
                },
              ]}
            />
          </>
        )}
      </View>

      {/* Mascot */}
      <Image
        source={mascotSource}
        style={[
          styles.mascot,
          {
            left: mascotPos.left,
            top: mascotPos.top,
            right: mascotPos.right,
            bottom: mascotPos.bottom,
            width: mascotSize.width,
            height: mascotSize.height,
          },
          mascotStyle,
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    height: "100%",
    zIndex: 1,
    // Đảm bảo container có đủ không gian
    minHeight: responsiveSize(300),
  },
  bubble: {
    position: "absolute",
    borderWidth: responsiveSize(2),
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(14),
    // Đảm bảo bubble không bị cắt
    maxWidth: "90%",
    ...getResponsiveShadow({
      shadowColor: "#64B5F6",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    }),
    zIndex: 3,
  },
  bubbleText: {
    color: "#1565C0",
    fontSize: responsiveFontSize(15),
    lineHeight: responsiveFontSize(21),
    textAlign: "left",
    flexWrap: "wrap",
    fontWeight: "600",
    textShadowColor: "rgba(255, 255, 255, 0.8)",
    textShadowOffset: { width: 0, height: responsiveSize(1) },
    textShadowRadius: responsiveSize(2),
    flex: 1,
    // Đảm bảo text không bị cắt
    maxWidth: "100%",
  },
  tailBig: {
    position: "absolute",
    width: responsiveSize(16),
    height: responsiveSize(16),
    borderRadius: responsiveSize(8),
    borderWidth: responsiveSize(2),
    zIndex: 4,
    ...getResponsiveShadow({
      shadowColor: "#64B5F6",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    }),
  },
  tailSmall: {
    position: "absolute",
    width: responsiveSize(10),
    height: responsiveSize(10),
    borderRadius: responsiveSize(5),
    borderWidth: responsiveSize(1.5),
    zIndex: 5,
    ...getResponsiveShadow({
      shadowColor: "#64B5F6",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 2,
    }),
  },
  mascot: {
    position: "absolute",
    zIndex: 2,
    // Đảm bảo mascot luôn hiển thị đầy đủ
    minWidth: responsiveSize(150),
    minHeight: responsiveSize(150),
    ...getResponsiveShadow({
      shadowColor: "#64B5F6",
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 10,
    }),
  },
});

export default MascotWithBubble;
