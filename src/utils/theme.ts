import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Enhanced Color Palette
export const COLORS = {
    // Primary Colors
    primary: {
        50: '#E3F2FD',
        100: '#BBDEFB',
        200: '#90CAF9',
        300: '#64B5F6',
        400: '#42A5F5',
        500: '#2196F3', // Main primary
        600: '#1E88E5',
        700: '#1976D2',
        800: '#1565C0',
        900: '#0D47A1',
    },

    // Secondary Colors (Blue theme)
    secondary: {
        50: '#E8F4FD',
        100: '#C5E2FA',
        200: '#9FCEF7',
        300: '#79BAF4',
        400: '#5CABF2',
        500: '#3F9CF0', // Main secondary
        600: '#3994EE',
        700: '#3189EC',
        800: '#297FE9',
        900: '#1B6CE5',
    },

    // Accent Colors
    accent: {
        orange: '#FF6B35',
        green: '#4CAF50',
        purple: '#9C27B0',
        pink: '#E91E63',
        teal: '#009688',
    },

    // Neutral Colors
    neutral: {
        50: '#FAFAFA',
        100: '#F5F5F5',
        200: '#EEEEEE',
        300: '#E0E0E0',
        400: '#BDBDBD',
        500: '#9E9E9E',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121',
    },

    // Semantic Colors
    semantic: {
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        info: '#2196F3',
    },

    // Background Colors
    background: {
        primary: '#FFFFFF',
        secondary: '#F8F9FA',
        tertiary: '#F1F3F4',
        dark: '#121212',
    },

    // Text Colors
    text: {
        primary: '#1A1A1A',
        secondary: '#6B7280',
        tertiary: '#9CA3AF',
        inverse: '#FFFFFF',
        disabled: '#D1D5DB',
    },

    // Border Colors
    border: {
        light: '#E5E7EB',
        medium: '#D1D5DB',
        dark: '#9CA3AF',
    },
};

// Enhanced Typography
export const TYPOGRAPHY = {
    fontFamily: {
        regular: 'OpenSans-Regular',
        medium: 'OpenSans-Medium',
        semiBold: 'OpenSans-SemiBold',
        bold: 'OpenSans-Bold',
    },

    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
        '5xl': 48,
        '6xl': 60,
    },

    lineHeight: {
        tight: 1.25,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2,
    },

    fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semiBold: '600',
        bold: '700',
        extraBold: '800',
        black: '900',
    },
};

// Enhanced Spacing
export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
    '6xl': 64,
    '7xl': 80,
    '8xl': 96,
};

// Enhanced Border Radius
export const BORDER_RADIUS = {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 9999,
};

// Enhanced Shadows
export const SHADOWS = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    '2xl': {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 12,
    },
    // Colored shadows
    primary: {
        shadowColor: COLORS.primary[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    secondary: {
        shadowColor: COLORS.secondary[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
};

// Animation Durations
export const ANIMATION = {
    duration: {
        fast: 150,
        normal: 300,
        slow: 500,
        slower: 800,
    },

    easing: {
        linear: 'linear',
        ease: 'ease',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out',
    },
};

// Responsive Breakpoints
export const BREAKPOINTS = {
    xs: 320,
    sm: 375,
    md: 414,
    lg: 768,
    xl: 1024,
    xxl: 1200,
};

// Gradient Definitions
export const GRADIENTS = {
    primary: ['#2196F3', '#1976D2'],
    secondary: ['#3F9CF0', '#297FE9'],
    accent: ['#FF6B35', '#E65100'],
    success: ['#4CAF50', '#2E7D32'],
    sunset: ['#FF6B35', '#F57C00', '#FFA726'],
    ocean: ['#2196F3', '#00BCD4', '#4DD0E1'],
    forest: ['#4CAF50', '#8BC34A', '#CDDC39'],
    purple: ['#9C27B0', '#673AB7', '#3F51B5'],
};

// Component-specific themes
export const COMPONENT_THEMES = {
    button: {
        primary: {
            backgroundColor: COLORS.primary[500],
            textColor: COLORS.text.inverse,
            shadow: SHADOWS.md,
        },
        secondary: {
            backgroundColor: COLORS.secondary[500],
            textColor: COLORS.text.inverse,
            shadow: SHADOWS.md,
        },
        outline: {
            backgroundColor: 'transparent',
            borderColor: COLORS.primary[500],
            textColor: COLORS.primary[500],
            shadow: SHADOWS.sm,
        },
    },

    card: {
        default: {
            backgroundColor: COLORS.background.primary,
            borderRadius: BORDER_RADIUS.xl,
            shadow: SHADOWS.md,
            borderColor: COLORS.border.light,
        },
        elevated: {
            backgroundColor: COLORS.background.primary,
            borderRadius: BORDER_RADIUS.xl,
            shadow: SHADOWS.lg,
            borderColor: COLORS.border.light,
        },
    },

    input: {
        default: {
            backgroundColor: COLORS.background.secondary,
            borderColor: COLORS.border.medium,
            borderRadius: BORDER_RADIUS.lg,
            shadow: SHADOWS.sm,
        },
        focused: {
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.primary[500],
            borderRadius: BORDER_RADIUS.lg,
            shadow: SHADOWS.md,
        },
    },
};

// Responsive scaling function
export const scale = (size: number): number => {
    return (SCREEN_WIDTH / 375) * size;
};

// Theme object for easy access
export const THEME = {
    colors: COLORS,
    typography: TYPOGRAPHY,
    spacing: SPACING,
    borderRadius: BORDER_RADIUS,
    shadows: SHADOWS,
    animation: ANIMATION,
    gradients: GRADIENTS,
    components: COMPONENT_THEMES,
    scale,
};

export default THEME;
