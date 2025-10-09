# Enhanced UI Components & Theme System

## Tổng quan

Hệ thống UI đã được nâng cấp với:
- **Theme System**: Bảng màu và typography nhất quán
- **Animation System**: Các hiệu ứng animation mượt mà
- **Enhanced Components**: Các component với styling và animation nâng cao
- **Responsive Design**: Hệ thống responsive hoàn chỉnh

## Theme System

### Colors
```typescript
import { ENHANCED_COLORS } from '@/app/utils/constant';

// Primary colors
ENHANCED_COLORS.primary[500] // Main primary color
ENHANCED_COLORS.secondary[500] // Main secondary color

// Semantic colors
ENHANCED_COLORS.semantic.success
ENHANCED_COLORS.semantic.warning
ENHANCED_COLORS.semantic.error
ENHANCED_COLORS.semantic.info

// Background colors
ENHANCED_COLORS.background.primary
ENHANCED_COLORS.background.secondary
ENHANCED_COLORS.background.tertiary

// Text colors
ENHANCED_COLORS.text.primary
ENHANCED_COLORS.text.secondary
ENHANCED_COLORS.text.tertiary
```

### Typography
```typescript
import { TYPOGRAPHY } from '@/utils/theme';

// Font sizes
TYPOGRAPHY.fontSize.xs    // 12
TYPOGRAPHY.fontSize.sm    // 14
TYPOGRAPHY.fontSize.base  // 16
TYPOGRAPHY.fontSize.lg    // 18
TYPOGRAPHY.fontSize.xl    // 20
TYPOGRAPHY.fontSize['2xl'] // 24
TYPOGRAPHY.fontSize['3xl'] // 30

// Font weights
TYPOGRAPHY.fontWeight.light     // '300'
TYPOGRAPHY.fontWeight.normal    // '400'
TYPOGRAPHY.fontWeight.medium    // '500'
TYPOGRAPHY.fontWeight.semiBold  // '600'
TYPOGRAPHY.fontWeight.bold      // '700'
TYPOGRAPHY.fontWeight.extraBold // '800'
```

## Animation System

### AnimationUtils
```typescript
import { AnimationUtils } from '@/utils/animations';

// Fade animations
AnimationUtils.fadeIn(value, duration)
AnimationUtils.fadeOut(value, duration)

// Scale animations
AnimationUtils.scaleIn(value, duration)
AnimationUtils.scaleOut(value, duration)

// Slide animations
AnimationUtils.slideInFromBottom(value, duration)
AnimationUtils.slideInFromTop(value, duration)
AnimationUtils.slideInFromLeft(value, duration)
AnimationUtils.slideInFromRight(value, duration)

// Special animations
AnimationUtils.bounce(value, duration)
AnimationUtils.pulse(value, duration)
AnimationUtils.shake(value, duration)
AnimationUtils.wiggle(value, duration)

// Spring animations
AnimationUtils.spring(value, toValue, config)
```

### Animation Presets
```typescript
import { ANIMATION_PRESETS } from '@/utils/animations';

// Quick animations
ANIMATION_PRESETS.buttonPress
ANIMATION_PRESETS.cardHover
ANIMATION_PRESETS.modalEntrance
ANIMATION_PRESETS.listItemEntrance
```

## Enhanced Components

### EnhancedCard
```typescript
import EnhancedCard from '@/components/card/EnhancedCard';

<EnhancedCard
  elevation="md"           // 'sm' | 'md' | 'lg' | 'xl'
  variant="default"        // 'default' | 'elevated' | 'outlined'
  animated={true}
  onPress={() => {}}
  style={{}}
>
  <Text>Card content</Text>
</EnhancedCard>
```

### FloatingActionButton
```typescript
import FloatingActionButton from '@/components/button/FloatingActionButton';

<FloatingActionButton
  icon="add"
  onPress={() => {}}
  size={24}
  color="#FFFFFF"
  backgroundColor="#2196F3"
  animated={true}
/>
```

### LoadingSpinner
```typescript
import LoadingSpinner from '@/components/loading/LoadingSpinner';

<LoadingSpinner
  size={40}
  color="#2196F3"
  animated={true}
/>
```

### GradientView
```typescript
import GradientView from '@/components/gradient/GradientView';

<GradientView
  colors={['#E3F2FD', '#FFFFFF']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
>
  <Text>Gradient content</Text>
</GradientView>
```

## Responsive System

### Responsive Functions
```typescript
import {
  responsiveSize,
  responsiveFontSize,
  responsiveSpacing,
  responsiveBorderRadius,
  responsiveIconSize,
  getResponsivePadding,
  getResponsiveMargin,
  getResponsiveShadow,
} from '@/utils/responsive';

// Size scaling
const size = responsiveSize(20);
const fontSize = responsiveFontSize(16);
const spacing = responsiveSpacing(16);
const borderRadius = responsiveBorderRadius(8);
const iconSize = responsiveIconSize(24);

// Container padding/margin
const padding = getResponsivePadding();
const margin = getResponsiveMargin();

// Enhanced shadows
const shadow = getResponsiveShadow({
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 4,
});
```

## Usage Examples

### Basic Card with Animation
```typescript
import React, { useRef, useEffect } from 'react';
import { Animated, View, Text } from 'react-native';
import { AnimationUtils } from '@/utils/animations';
import { ENHANCED_COLORS } from '@/app/utils/constant';

const MyComponent = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      AnimationUtils.fadeIn(fadeAnim, 400),
      AnimationUtils.scaleIn(scaleAnim, 400),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
        backgroundColor: ENHANCED_COLORS.background.primary,
        padding: 16,
        borderRadius: 12,
        shadowColor: ENHANCED_COLORS.secondary[500],
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
      }}
    >
      <Text style={{ 
        color: ENHANCED_COLORS.text.primary,
        fontSize: 16,
        fontWeight: '600',
      }}>
        Animated Content
      </Text>
    </Animated.View>
  );
};
```

### Enhanced Button with Press Animation
```typescript
import React, { useRef } from 'react';
import { TouchableOpacity, Animated, Text } from 'react-native';
import { AnimationUtils } from '@/utils/animations';
import { ENHANCED_COLORS } from '@/app/utils/constant';

const EnhancedButton = ({ onPress, title }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    AnimationUtils.spring(scaleAnim, 0.95, {
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    AnimationUtils.spring(scaleAnim, 1, {
      tension: 300,
      friction: 10,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          backgroundColor: ENHANCED_COLORS.secondary[500],
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
          shadowColor: ENHANCED_COLORS.secondary[500],
          shadowOpacity: 0.2,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 4,
        }}
      >
        <Text style={{
          color: ENHANCED_COLORS.text.inverse,
          fontSize: 16,
          fontWeight: '600',
          textAlign: 'center',
        }}>
          {title}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};
```

## Best Practices

1. **Consistent Colors**: Luôn sử dụng `ENHANCED_COLORS` thay vì hardcode màu
2. **Responsive Design**: Sử dụng các hàm responsive cho sizing và spacing
3. **Animation Performance**: Sử dụng `useNativeDriver: true` khi có thể
4. **Shadow Consistency**: Sử dụng `getResponsiveShadow` cho shadows nhất quán
5. **Component Reusability**: Tạo các component có thể tái sử dụng với props linh hoạt

## Migration Guide

### Từ Old Components sang Enhanced Components

**Before:**
```typescript
<View style={{
  backgroundColor: '#FFFFFF',
  padding: 16,
  borderRadius: 8,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
}}>
  <Text style={{ color: '#000', fontSize: 16 }}>Content</Text>
</View>
```

**After:**
```typescript
<EnhancedCard elevation="sm" variant="default">
  <Text style={{
    color: ENHANCED_COLORS.text.primary,
    fontSize: responsiveFontSize(16),
  }}>
    Content
  </Text>
</EnhancedCard>
```

Hệ thống UI mới này sẽ giúp app có giao diện đẹp hơn, nhất quán hơn và có các hiệu ứng animation mượt mà, tạo trải nghiệm người dùng tốt hơn.
