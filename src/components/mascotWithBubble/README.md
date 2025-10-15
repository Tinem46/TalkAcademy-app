# Mascot Customization System

Hệ thống tùy chỉnh mascot cho phép bạn sử dụng các mascot có sẵn từ thư mục `assets/Mascot` một cách dễ dàng và linh hoạt.

## Các Mascot Có Sẵn

### 1. Default (`default`)
- **File**: `mascot Talkademy-01.png`
- **Mô tả**: Mascot chính của ứng dụng
- **Kích thước**: 300x300
- **Màu bubble**: Xanh dương nhạt (#E8F4FD / #64B5F6)

### 2. Logo Facebook (`logoFB`)
- **File**: `Asset 1logoFB.png`
- **Mô tả**: Mascot với logo Facebook
- **Kích thước**: 250x250
- **Màu bubble**: Xanh dương đậm (#E3F2FD / #1976D2)

### 3. Long Lanh (`longlanh`)
- **File**: `Asset 1longlanh.png`
- **Mô tả**: Mascot với ánh mắt long lanh
- **Kích thước**: 280x280
- **Màu bubble**: Cam (#FFF3E0 / #FF9800)

### 4. OMG (`omg`)
- **File**: `Asset 2omg.png`
- **Mô tả**: Mascot biểu cảm ngạc nhiên
- **Kích thước**: 260x260
- **Màu bubble**: Xanh lá (#E8F5E8 / #4CAF50)

### 5. Talking (`talking`)
- **File**: `Asset 3talking.png`
- **Mô tả**: Mascot trong trạng thái đang nói
- **Kích thước**: 270x270
- **Màu bubble**: Tím (#F3E5F5 / #9C27B0)

### 6. Logo Dọc (`logoDoc`)
- **File**: `logo.png`
- **Mô tả**: Logo ứng dụng định dạng dọc
- **Kích thước**: 200x300
- **Màu bubble**: Xanh cyan (#E1F5FE / #03A9F4)

### 7. Logo Ngang (`logoNgang`)
- **File**: `exe logo ngang-01.png`
- **Mô tả**: Logo ứng dụng định dạng ngang
- **Kích thước**: 300x150
- **Màu bubble**: Xanh dương (#E8F4FD / #2196F3)

### 8. Talkademy (`talkademy`)
- **File**: `mascot Talkademy-01.png`
- **Mô tả**: Mascot chính thức của Talkademy
- **Kích thước**: 300x300
- **Màu bubble**: Xanh dương nhạt (#E8F4FD / #64B5F6)

## Cách Sử Dụng

### 1. Sử dụng với IntroLayout

```tsx
import IntroLayout from "@/components/onboarding/introLayout";

const MyScreen = () => {
  return (
    <IntroLayout
      message="Tin nhắn của bạn"
      mascotType="omg" // Chọn mascot theo type
      onNext={() => {}}
      onBack={() => {}}
    />
  );
};
```

### 2. Sử dụng với MascotWithBubble

```tsx
import MascotWithBubble from "@/components/mascotWithBubble/mascotWithBubble";
import { useMascotManager } from "@/components/mascotWithBubble/MascotManager";

const MyComponent = () => {
  const { getMascotByType } = useMascotManager();
  const mascot = getMascotByType('talking');

  return (
    <MascotWithBubble
      message="Xin chào!"
      mascotSource={mascot.source}
      mascotWidth={mascot.defaultSize?.width}
      mascotHeight={mascot.defaultSize?.height}
      mascotPosition={mascot.defaultPosition}
      bgColor={mascot.recommendedBubbleColor?.bgColor}
      borderColor={mascot.recommendedBubbleColor?.borderColor}
    />
  );
};
```

### 3. Sử dụng Hook useMascotManager

```tsx
import { useMascotManager } from "@/components/mascotWithBubble/MascotManager";

const MyComponent = () => {
  const { 
    getAllMascots, 
    getMascotByType, 
    getRandomMascot, 
    getMascotByName 
  } = useMascotManager();

  // Lấy tất cả mascot
  const allMascots = getAllMascots();

  // Lấy mascot theo type
  const defaultMascot = getMascotByType('default');

  // Lấy mascot ngẫu nhiên
  const randomMascot = getRandomMascot();

  // Tìm mascot theo tên
  const facebookMascot = getMascotByName('facebook');

  return (
    // JSX của bạn
  );
};
```

## Thêm Mascot Mới

Để thêm mascot mới, bạn cần:

1. **Thêm file ảnh** vào thư mục `src/assets/Mascot/`

2. **Cập nhật MascotType** trong `MascotManager.tsx`:
```tsx
export type MascotType = 
  | 'default' 
  | 'logoFB' 
  | 'longlanh' 
  | 'omg' 
  | 'talking' 
  | 'logoDoc' 
  | 'logoNgang' 
  | 'talkademy'
  | 'newMascot'; // Thêm type mới
```

3. **Thêm config** vào `MASCOT_ASSETS`:
```tsx
export const MASCOT_ASSETS: Record<MascotType, MascotConfig> = {
  // ... các mascot khác
  newMascot: {
    source: require('@/assets/Mascot/new-mascot.png'),
    name: 'Mascot Mới',
    description: 'Mô tả mascot mới',
    defaultSize: { width: 300, height: 300 },
    defaultPosition: { left: 8, bottom: 200 },
    recommendedBubbleColor: {
      bgColor: '#E8F4FD',
      borderColor: '#64B5F6'
    }
  }
};
```

## Demo Component

Sử dụng `MascotCustomizationDemo` để xem preview tất cả mascot:

```tsx
import MascotCustomizationDemo from '@/components/test/MascotCustomizationDemo';

// Trong component của bạn
<MascotCustomizationDemo />
```

## Lưu Ý

- Tất cả mascot đều hỗ trợ responsive design
- Màu sắc bubble sẽ tự động điều chỉnh theo mascot được chọn
- Kích thước và vị trí có thể được tùy chỉnh thông qua props
- Hệ thống tự động fallback về mascot default nếu có lỗi

## Ví Dụ Thực Tế

Xem các file sau để hiểu cách sử dụng:
- `src/app/(onboarding)/intro.tsx` - Sử dụng mascot default
- `src/app/(onboarding)/discover.tsx` - Sử dụng mascot OMG
- `src/components/test/MascotCustomizationDemo.tsx` - Demo component
