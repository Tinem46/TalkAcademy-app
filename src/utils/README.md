# Responsive Design System

Hệ thống responsive design được thiết kế để đảm bảo app hoạt động tốt trên tất cả các kích thước màn hình từ điện thoại nhỏ đến tablet lớn.

## Các Breakpoints

```typescript
const BREAKPOINTS = {
  xs: 320,   // iPhone SE, Galaxy S8
  sm: 375,   // iPhone 12/13/14
  md: 414,   // iPhone 12/13/14 Plus
  lg: 768,   // iPad Mini
  xl: 1024,  // iPad
  xxl: 1200, // iPad Pro
}
```

## Các Hàm Chính

### 1. Kích thước Responsive
```typescript
// Kích thước tổng quát
responsiveSize(100) // Tự động scale theo màn hình

// Font size
responsiveFontSize(16) // Font size responsive

// Spacing (padding, margin)
responsiveSpacing(20) // Khoảng cách responsive

// Width/Height theo %
responsiveWidth(50) // 50% width màn hình
responsiveHeight(20) // 20% height màn hình

// Icon size
responsiveIconSize(24) // Kích thước icon responsive

// Border radius
responsiveBorderRadius(8) // Border radius responsive
```

### 2. Kiểm tra Kích thước Màn hình
```typescript
// Kiểm tra loại màn hình
isSmallScreen() // < 375px
isLargeScreen() // >= 768px
isTablet() // >= 768px

// Lấy kích thước hiện tại
getScreenSize() // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

// Kiểm tra breakpoint cụ thể
isScreenSize('sm') // true nếu >= 375px
```

### 3. Padding/Margin Responsive
```typescript
// Lấy padding responsive theo màn hình
const padding = getResponsivePadding();
// { horizontal: 16, vertical: 20 } (ví dụ)

// Lấy margin responsive theo màn hình
const margin = getResponsiveMargin();
// { horizontal: 12, vertical: 16 } (ví dụ)
```

### 4. Shadow Responsive
```typescript
// Shadow tự động scale theo màn hình
const shadowStyle = getResponsiveShadow({
  shadowColor: "#000",
  shadowOpacity: 0.12,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 8,
});
```

## Cách Sử Dụng

### 1. Import
```typescript
import { 
  responsiveSize, 
  responsiveFontSize, 
  responsiveSpacing,
  responsiveWidth,
  responsiveHeight,
  isSmallScreen,
  isLargeScreen,
  getResponsivePadding
} from '@/utils/responsive';
```

### 2. Trong StyleSheet
```typescript
const styles = StyleSheet.create({
  container: {
    padding: responsiveSpacing(16),
    borderRadius: responsiveSize(8),
  },
  title: {
    fontSize: responsiveFontSize(24),
    marginBottom: responsiveSpacing(12),
  },
  button: {
    width: responsiveWidth(80),
    height: responsiveSize(48),
  },
});
```

### 3. Trong Component
```typescript
const MyComponent = () => {
  const padding = getResponsivePadding();
  
  return (
    <View style={{ paddingHorizontal: padding.horizontal }}>
      <Text style={{ fontSize: responsiveFontSize(18) }}>
        Responsive Text
      </Text>
    </View>
  );
};
```

### 4. Conditional Styling
```typescript
const styles = StyleSheet.create({
  container: {
    padding: isSmallScreen() ? responsiveSpacing(12) : responsiveSpacing(20),
    fontSize: isLargeScreen() ? responsiveFontSize(20) : responsiveFontSize(16),
  },
});
```

## Best Practices

1. **Luôn sử dụng responsive functions** thay vì giá trị cố định
2. **Kiểm tra kích thước màn hình** khi cần logic khác nhau
3. **Sử dụng getResponsivePadding/Margin** cho layout chính
4. **Test trên nhiều kích thước màn hình** khác nhau
5. **Sử dụng responsiveWidth/Height** cho layout linh hoạt

## Ví dụ Hoàn Chỉnh

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { 
  responsiveSize, 
  responsiveFontSize, 
  responsiveSpacing,
  responsiveWidth,
  isSmallScreen,
  getResponsivePadding
} from '@/utils/responsive';

const MyScreen = () => {
  const padding = getResponsivePadding();
  
  return (
    <View style={[styles.container, { paddingHorizontal: padding.horizontal }]}>
      <Text style={styles.title}>Responsive Title</Text>
      <View style={styles.content}>
        <Text style={styles.text}>Responsive content</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: responsiveSpacing(20),
  },
  title: {
    fontSize: responsiveFontSize(isSmallScreen() ? 20 : 24),
    fontWeight: 'bold',
    marginBottom: responsiveSpacing(16),
    textAlign: 'center',
  },
  content: {
    width: responsiveWidth(90),
    alignSelf: 'center',
    padding: responsiveSpacing(16),
    borderRadius: responsiveSize(8),
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: responsiveFontSize(16),
    lineHeight: responsiveFontSize(22),
  },
});

export default MyScreen;
```

## Lưu Ý

- Hệ thống này tự động scale dựa trên iPhone 12 (375px) làm base
- Tất cả giá trị đều được làm tròn để tránh pixel lẻ
- Shadow và elevation cũng được scale để phù hợp với màn hình
- Hệ thống hỗ trợ cả iOS và Android
