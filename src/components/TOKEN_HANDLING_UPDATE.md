# Cải thiện Token Handling cho Profile API

## Tổng quan
Đã cải thiện việc xử lý token và gọi API profile để đảm bảo hoạt động ổn định và xử lý lỗi tốt hơn.

## Các cải tiến chính

### 1. Token Validation
```typescript
// Kiểm tra token trước khi gọi API
const token = await AsyncStorage.getItem("access_token");
console.log('🔑 Token exists:', !!token);

if (!token) {
  Toast.show("Vui lòng đăng nhập lại!", {
    position: Toast.positions.TOP,
  });
  router.replace("/(auth)/welcome");
  return;
}
```

### 2. Enhanced Error Handling
```typescript
// Xử lý lỗi cụ thể theo status code
if (error?.response?.status === 401) {
  // Token hết hạn
  Toast.show("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
  await AsyncStorage.removeItem("access_token");
  router.replace("/(auth)/welcome");
} else if (error?.response?.status === 403) {
  // Không có quyền
  Toast.show("Bạn không có quyền truy cập thông tin này!");
} else {
  // Lỗi khác
  Toast.show("Không thể tải thông tin profile. Vui lòng thử lại!");
}
```

### 3. Refresh Functionality
- **Refresh Button**: Nút refresh để tải lại dữ liệu
- **Loading State**: Disable button khi đang loading
- **Visual Feedback**: Icon thay đổi màu khi loading

### 4. Debug Information
- **Development Only**: Chỉ hiển thị trong development mode
- **Toggle Debug**: Có thể bật/tắt debug info
- **Full Data Display**: Hiển thị toàn bộ response data

### 5. Comprehensive Logging
```typescript
console.log('🔑 Token exists:', !!token);
console.log('📊 Profile API Response:', response);
console.log('✅ Profile loaded successfully:', response.data);
console.error('💥 Error fetching profile:', error);
console.error('💥 Error details:', error?.response?.data);
```

## Cấu trúc API

### Token Handling
- **Automatic**: Token được tự động thêm vào header bởi axios interceptor
- **Storage**: Token được lưu trong AsyncStorage với key "access_token"
- **Validation**: Kiểm tra token trước khi gọi API

### API Configuration
```typescript
// Trong config/api.ts
api.interceptors.request.use(async function (config) {
  const token = await AsyncStorage.getItem("access_token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});
```

### Error Response Handling
- **401 Unauthorized**: Token hết hạn → Redirect to login
- **403 Forbidden**: Không có quyền → Show error message
- **Other Errors**: Generic error message

## UI Improvements

### 1. Header với Refresh Button
```typescript
<View style={styles.headerContainer}>
  <Text style={styles.h1}>Profile</Text>
  <TouchableOpacity 
    style={styles.refreshButton} 
    onPress={fetchUserProfile}
    disabled={loading}
  >
    <Ionicons 
      name="refresh" 
      size={24} 
      color={loading ? "#9CA3AF" : "#2FA6F3"} 
    />
  </TouchableOpacity>
</View>
```

### 2. Debug Section (Development Only)
- Toggle để hiển thị/ẩn debug info
- Hiển thị toàn bộ response data
- Chỉ hoạt động trong development mode

### 3. Enhanced Loading States
- Loading indicator trong ProfileSection
- Disabled state cho refresh button
- Visual feedback cho user

## Lợi ích

### 1. Reliability
✅ **Token Validation**: Đảm bảo có token trước khi gọi API  
✅ **Error Handling**: Xử lý lỗi cụ thể và thân thiện  
✅ **Auto Redirect**: Tự động redirect khi token hết hạn  

### 2. User Experience
✅ **Refresh Button**: User có thể tải lại dữ liệu khi cần  
✅ **Loading States**: Feedback rõ ràng về trạng thái loading  
✅ **Error Messages**: Thông báo lỗi dễ hiểu và hữu ích  

### 3. Development
✅ **Debug Info**: Dễ dàng debug trong development  
✅ **Comprehensive Logging**: Log chi tiết để troubleshoot  
✅ **Error Details**: Hiển thị chi tiết lỗi từ API  

### 4. Security
✅ **Token Management**: Quản lý token an toàn  
✅ **Auto Cleanup**: Tự động xóa token khi hết hạn  
✅ **Secure Redirect**: Redirect an toàn khi cần đăng nhập lại  

## Cách sử dụng

### 1. Automatic Loading
- Profile tự động load khi vào màn hình
- Token được validate trước khi gọi API

### 2. Manual Refresh
- Nhấn nút refresh để tải lại dữ liệu
- Button bị disable khi đang loading

### 3. Debug Mode
- Chỉ hiển thị trong development
- Toggle để xem debug information
- Hiển thị toàn bộ response data

## Kết quả
Profile screen giờ đây có khả năng xử lý token mạnh mẽ, xử lý lỗi tốt hơn, và cung cấp trải nghiệm người dùng tốt hơn với các tính năng refresh và debug.
