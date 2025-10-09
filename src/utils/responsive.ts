import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Breakpoints cho các kích thước màn hình
export const BREAKPOINTS = {
    xs: 320,   // iPhone SE, Galaxy S8
    sm: 375,   // iPhone 12/13/14
    md: 414,   // iPhone 12/13/14 Plus
    lg: 768,   // iPad Mini
    xl: 1024,  // iPad
    xxl: 1200, // iPad Pro
} as const;

// Hàm kiểm tra kích thước màn hình
export const isScreenSize = (size: keyof typeof BREAKPOINTS): boolean => {
    return SCREEN_WIDTH >= BREAKPOINTS[size];
};

// Hàm tính toán kích thước responsive
export const responsiveSize = (size: number): number => {
    const scale = SCREEN_WIDTH / 375; // Base width (iPhone 12)
    const newSize = size * scale;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Hàm tính toán font size responsive
export const responsiveFontSize = (size: number): number => {
    const scale = Math.min(SCREEN_WIDTH / 375, SCREEN_HEIGHT / 812);
    const newSize = size * scale;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Hàm tính toán padding/margin responsive
export const responsiveSpacing = (size: number): number => {
    const scale = SCREEN_WIDTH / 375;
    const newSize = size * scale;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Hàm tính toán width responsive (theo %)
export const responsiveWidth = (percentage: number): number => {
    return (SCREEN_WIDTH * percentage) / 100;
};

// Hàm tính toán height responsive (theo %)
export const responsiveHeight = (percentage: number): number => {
    return (SCREEN_HEIGHT * percentage) / 100;
};

// Hàm tính toán kích thước icon responsive
export const responsiveIconSize = (size: number): number => {
    const scale = Math.min(SCREEN_WIDTH / 375, 1.2);
    const newSize = size * scale;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Hàm tính toán border radius responsive
export const responsiveBorderRadius = (size: number): number => {
    const scale = SCREEN_WIDTH / 375;
    const newSize = size * scale;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Hàm lấy kích thước màn hình hiện tại
export const getScreenSize = (): keyof typeof BREAKPOINTS => {
    if (SCREEN_WIDTH >= BREAKPOINTS.xxl) return 'xxl';
    if (SCREEN_WIDTH >= BREAKPOINTS.xl) return 'xl';
    if (SCREEN_WIDTH >= BREAKPOINTS.lg) return 'lg';
    if (SCREEN_WIDTH >= BREAKPOINTS.md) return 'md';
    if (SCREEN_WIDTH >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
};

// Hàm kiểm tra màn hình nhỏ
export const isSmallScreen = (): boolean => {
    return SCREEN_WIDTH < BREAKPOINTS.sm;
};

// Hàm kiểm tra màn hình lớn
export const isLargeScreen = (): boolean => {
    return SCREEN_WIDTH >= BREAKPOINTS.lg;
};

// Hàm kiểm tra màn hình tablet
export const isTablet = (): boolean => {
    return SCREEN_WIDTH >= BREAKPOINTS.lg;
};

// Hàm tính toán kích thước component dựa trên màn hình
export const getResponsiveComponentSize = (baseSize: number, scaleFactor: number = 1): number => {
    const screenSize = getScreenSize();
    const scale = {
        xs: 0.8,
        sm: 1,
        md: 1.1,
        lg: 1.2,
        xl: 1.3,
        xxl: 1.4,
    }[screenSize];

    return Math.round(baseSize * scale * scaleFactor);
};

// Hàm tính toán padding container responsive
export const getResponsivePadding = (): { horizontal: number; vertical: number } => {
    const screenSize = getScreenSize();
    const padding = {
        xs: { horizontal: 12, vertical: 16 },
        sm: { horizontal: 16, vertical: 20 },
        md: { horizontal: 20, vertical: 24 },
        lg: { horizontal: 24, vertical: 28 },
        xl: { horizontal: 32, vertical: 32 },
        xxl: { horizontal: 40, vertical: 36 },
    }[screenSize];

    return {
        horizontal: responsiveSpacing(padding.horizontal),
        vertical: responsiveSpacing(padding.vertical),
    };
};

// Hàm tính toán margin responsive
export const getResponsiveMargin = (): { horizontal: number; vertical: number } => {
    const screenSize = getScreenSize();
    const margin = {
        xs: { horizontal: 8, vertical: 12 },
        sm: { horizontal: 12, vertical: 16 },
        md: { horizontal: 16, vertical: 20 },
        lg: { horizontal: 20, vertical: 24 },
        xl: { horizontal: 24, vertical: 28 },
        xxl: { horizontal: 32, vertical: 32 },
    }[screenSize];

    return {
        horizontal: responsiveSpacing(margin.horizontal),
        vertical: responsiveSpacing(margin.vertical),
    };
};

// Hàm tính toán font size responsive cho text
export const getResponsiveFontSize = (baseSize: number): number => {
    const screenSize = getScreenSize();
    const scale = {
        xs: 0.9,
        sm: 1,
        md: 1.05,
        lg: 1.1,
        xl: 1.15,
        xxl: 1.2,
    }[screenSize];

    return responsiveFontSize(baseSize * scale);
};

// Hàm tính toán line height responsive
export const getResponsiveLineHeight = (fontSize: number): number => {
    return Math.round(fontSize * 1.4);
};

// Hàm tính toán shadow responsive
export const getResponsiveShadow = (baseShadow: any) => {
    const screenSize = getScreenSize();
    const scale = {
        xs: 0.8,
        sm: 1,
        md: 1.1,
        lg: 1.2,
        xl: 1.3,
        xxl: 1.4,
    }[screenSize];

    return {
        ...baseShadow,
        shadowRadius: Math.round(baseShadow.shadowRadius * scale),
        shadowOffset: {
            width: Math.round(baseShadow.shadowOffset.width * scale),
            height: Math.round(baseShadow.shadowOffset.height * scale),
        },
        elevation: Math.round(baseShadow.elevation * scale),
    };
};

export default {
    BREAKPOINTS,
    isScreenSize,
    responsiveSize,
    responsiveFontSize,
    responsiveSpacing,
    responsiveWidth,
    responsiveHeight,
    responsiveIconSize,
    responsiveBorderRadius,
    getScreenSize,
    isSmallScreen,
    isLargeScreen,
    isTablet,
    getResponsiveComponentSize,
    getResponsivePadding,
    getResponsiveMargin,
    getResponsiveFontSize,
    getResponsiveLineHeight,
    getResponsiveShadow,
};
