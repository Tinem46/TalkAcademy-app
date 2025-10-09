# Cập nhật Profile Screen với API thực

## Tổng quan
Đã tích hợp API `/users/profile` để hiển thị thông tin profile thực tế từ backend thay vì dữ liệu mock.

## API được sử dụng
- **Endpoint**: `GET /users/profile`
- **Authentication**: Bearer Token
- **Response**: Thông tin đầy đủ của user bao gồm:
  - `id`: ID của user
  - `username`: Tên đăng nhập
  - `email`: Email
  - `role`: Vai trò (CUSTOMER)
  - `avatar`: Avatar (có thể null)
  - `voiceTests`: Mảng các bài kiểm tra
  - `practices`: Mảng các bài luyện tập
  - `userPackages`: Mảng các gói đã mua

## Các thay đổi chính

### 1. Thêm API mới
```typescript
// Trong apiall.ts
export const getUserProfileAPI = () => {
  return api.get<IBackendRes<any>>("users/profile");
}
```

### 2. Cập nhật ProfileSection
- **Loading State**: Hiển thị loading khi đang tải dữ liệu
- **Real Data**: Hiển thị thông tin thực từ API
- **Dynamic Stats**: Thống kê dựa trên dữ liệu thực
  - Số bài kiểm tra: `voiceTests.length`
  - Số bài luyện tập: `practices.length`
  - Số gói đã mua: `userPackages.length`

### 3. Cập nhật AnalysisSection
- **Dynamic Content**: Nội dung thay đổi theo dữ liệu thực
- **Smart Messages**: Thông báo khuyến khích dựa trên hoạt động
- **Real Statistics**: Hiển thị số liệu thực tế

### 4. State Management
```typescript
const [userProfile, setUserProfile] = useState<any>(null);
const [loading, setLoading] = useState(true);
```

### 5. Error Handling
- **Try-Catch**: Xử lý lỗi khi gọi API
- **Toast Messages**: Thông báo lỗi cho user
- **Fallback Values**: Giá trị mặc định khi không có dữ liệu

## Cấu trúc dữ liệu hiển thị

### Thông tin cá nhân
- **Username**: Tên đăng nhập từ API
- **Email**: Email từ API
- **Role**: Vai trò (CUSTOMER)
- **ID**: ID của user
- **Avatar**: Icon mặc định (có thể mở rộng)

### Thống kê hoạt động
- **Bài kiểm tra**: Số lượng `voiceTests`
- **Bài luyện tập**: Số lượng `practices`
- **Gói học**: Số lượng `userPackages`

### Phân tích thông minh
- **Bài kiểm tra**: Khuyến khích dựa trên số lượng
- **Bài luyện tập**: Gợi ý cải thiện
- **Gói học**: Tư vấn sử dụng

## Tính năng mới

### 1. Loading State
- Hiển thị spinner khi đang tải
- Thông báo "Đang tải thông tin..."
- UX mượt mà hơn

### 2. Dynamic Content
- Nội dung thay đổi theo dữ liệu thực
- Thông báo phù hợp với trạng thái user
- Khuyến khích tích cực

### 3. Error Handling
- Xử lý lỗi API gracefully
- Thông báo lỗi thân thiện
- Fallback values khi cần

## Cách sử dụng

### 1. Tự động load
- Profile tự động load khi vào màn hình
- Không cần thao tác thủ công

### 2. Refresh data
- Có thể thêm pull-to-refresh
- Hoặc nút refresh thủ công

### 3. Real-time updates
- Có thể tích hợp real-time updates
- Hoặc refresh định kỳ

## Lợi ích

✅ **Dữ liệu thực**: Hiển thị thông tin chính xác từ backend  
✅ **UX tốt hơn**: Loading state và error handling  
✅ **Thông tin hữu ích**: Thống kê và phân tích thực tế  
✅ **Khuyến khích**: Thông báo tích cực dựa trên hoạt động  
✅ **Mở rộng**: Dễ dàng thêm tính năng mới  

## Kết quả
Profile screen giờ đây hiển thị thông tin thực tế từ API, cung cấp trải nghiệm người dùng tốt hơn với dữ liệu chính xác và thông tin hữu ích về hoạt động học tập.
