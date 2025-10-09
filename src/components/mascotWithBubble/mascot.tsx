import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import { SpeechBubbleProps } from "./bubble";

export interface MascotWithBubbleProps {
  message: string; // (không dùng ở file này, giữ để tương thích)
  mascotSource: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
  bubbleProps?: Omit<SpeechBubbleProps, "text">; // (không dùng ở đây)
  mascotWidth?: number;
  mascotHeight?: number;
  mascotPosition?: Partial<Record<"left" | "right" | "top" | "bottom", number>>;
  responsive?: boolean; // Thêm prop để bật/tắt responsive
}

const Mascot: React.FC<MascotWithBubbleProps> = ({
  mascotSource,
  style,
  mascotWidth = 180,
  mascotHeight = 180,
  mascotPosition = { left: 8, bottom: 200 },
  responsive = true,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Tính toán kích thước responsive
  const getResponsiveSize = () => {
    if (!responsive) {
      return { width: mascotWidth, height: mascotHeight };
    }

    // Kích thước cơ sở dựa trên chiều rộng màn hình - tăng kích thước to hơn
    const baseSize = Math.min(screenWidth * 0.55, screenHeight * 0.45);
    
    // Giới hạn kích thước tối thiểu và tối đa - tăng kích thước tối đa
    const minSize = 200;
    const maxSize = 400;
    
    const responsiveSize = Math.max(minSize, Math.min(maxSize, baseSize));
    
    return {
      width: mascotWidth || responsiveSize,
      height: mascotHeight || responsiveSize,
    };
  };

  // Tính toán vị trí responsive
  const getResponsivePosition = () => {
    if (!responsive) {
      return mascotPosition;
    }
    
    // Nếu có left được truyền vào, sử dụng nó (để hỗ trợ căn giữa)
    if (mascotPosition?.left !== undefined) {
      return mascotPosition;
    }
    
    const responsivePosition: Partial<Record<"left" | "right" | "top" | "bottom", number>> = {
      left: Math.max(8, screenWidth * 0.02),
      bottom: mascotPosition?.bottom ?? Math.max(80, screenHeight * 0.25),
    };
    
    if (mascotPosition?.right !== undefined) {
      responsivePosition.right = mascotPosition.right;
    }
    if (mascotPosition?.top !== undefined) {
      responsivePosition.top = mascotPosition.top;
    }
    
    return responsivePosition;
  };

  const size = getResponsiveSize();
  const position = getResponsivePosition();

  return (
    <View style={[styles.container, style]}>
      <Image
        source={mascotSource}
        style={[
          styles.mascot,
          size,
          position,
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    position: "relative",
    zIndex: 1, // Đảm bảo mascot hiển thị trên các element khác
  },
  mascot: { 
    position: "absolute",
    zIndex: 2,
    shadowColor: "#64B5F6",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
});

export default Mascot;
