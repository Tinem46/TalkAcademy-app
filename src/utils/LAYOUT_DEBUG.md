# Layout Debug Guide

Hướng dẫn debug các vấn đề layout bị che mất trong app.

## Các Vấn Đề Thường Gặp

### 1. **Elements bị che mất**
- **Nguyên nhân**: Margin âm, z-index không đúng, SafeAreaView không hoạt động
- **Giải pháp**: Kiểm tra margin/padding, sử dụng SafeAreaView đúng cách

### 2. **Layout không responsive**
- **Nguyên nhân**: Sử dụng kích thước cố định thay vì responsive
- **Giải pháp**: Sử dụng các hàm responsive từ `@/utils/responsive`

### 3. **Overflow content**
- **Nguyên nhân**: Container không đủ không gian
- **Giải pháp**: Sử dụng ScrollView, điều chỉnh flex properties

## Cách Debug

### 1. Sử dụng LayoutDebugger Component
```typescript
import LayoutDebugger from '@/components/debug/LayoutDebugger';

// Wrap component cần debug
<LayoutDebugger title="VoiceCheck Debug">
  <YourComponent />
</LayoutDebugger>
```

### 2. Kiểm tra SafeAreaView
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

// Đảm bảo SafeAreaView bao quanh toàn bộ screen
<SafeAreaView style={{ flex: 1 }}>
  <YourContent />
</SafeAreaView>
```

### 3. Kiểm tra Flex Layout
```typescript
// Container chính
<View style={{ flex: 1 }}>
  {/* Header */}
  <View style={{ height: 60 }}>
    <Header />
  </View>
  
  {/* Content - chiếm không gian còn lại */}
  <View style={{ flex: 1 }}>
    <Content />
  </View>
  
  {/* Footer - cố định ở dưới */}
  <View style={{ height: 80 }}>
    <Footer />
  </View>
</View>
```

### 4. Kiểm tra Responsive Values
```typescript
import { 
  responsiveSize, 
  responsiveFontSize, 
  responsiveSpacing,
  getResponsivePadding,
  isSmallScreen 
} from '@/utils/responsive';

// Sử dụng responsive values
const styles = StyleSheet.create({
  container: {
    padding: responsiveSpacing(16), // Thay vì padding: 16
    fontSize: responsiveFontSize(16), // Thay vì fontSize: 16
  },
});
```

## Checklist Debug Layout

- [ ] **SafeAreaView** bao quanh toàn bộ screen
- [ ] **Flex properties** được set đúng (flex: 1 cho container chính)
- [ ] **Responsive values** được sử dụng thay vì hard-coded values
- [ ] **Margin/Padding** không có giá trị âm
- [ ] **Z-index** được set đúng cho overlapping elements
- [ ] **MinHeight** được set cho containers cần thiết
- [ ] **ScrollView** được sử dụng khi content có thể overflow

## Common Fixes

### 1. Fix bị che mất do margin âm
```typescript
// ❌ Sai
style={{ marginBottom: -20 }}

// ✅ Đúng
style={{ marginBottom: responsiveSpacing(20) }}
```

### 2. Fix layout không đủ không gian
```typescript
// ❌ Sai
<View style={{ height: 200 }}>
  <LongContent />
</View>

// ✅ Đúng
<View style={{ flex: 1, minHeight: responsiveSize(200) }}>
  <LongContent />
</View>
```

### 3. Fix SafeAreaView issues
```typescript
// ❌ Sai
<View style={{ flex: 1 }}>
  <SafeAreaView>
    <Content />
  </SafeAreaView>
</View>

// ✅ Đúng
<SafeAreaView style={{ flex: 1 }}>
  <Content />
</SafeAreaView>
```

### 4. Fix responsive issues
```typescript
// ❌ Sai
const styles = StyleSheet.create({
  text: { fontSize: 16 },
  padding: { padding: 16 },
});

// ✅ Đúng
const styles = StyleSheet.create({
  text: { fontSize: responsiveFontSize(16) },
  padding: { padding: responsiveSpacing(16) },
});
```

## Testing trên các kích thước màn hình

1. **iPhone SE** (320px) - Màn hình nhỏ nhất
2. **iPhone 12** (375px) - Màn hình chuẩn
3. **iPhone Plus** (414px) - Màn hình lớn
4. **iPad Mini** (768px) - Tablet nhỏ
5. **iPad** (1024px) - Tablet chuẩn

Sử dụng ResponsiveTest component để kiểm tra values trên từng màn hình.
