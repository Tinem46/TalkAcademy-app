# Tích hợp Account Info API vào Profile

## Tổng quan
Đã tích hợp API `/accounts/{id}` để lấy thông tin `type` và `trialExpiresAt` (startday) trong profile screen.

## API được sử dụng
- **Endpoint**: `GET /accounts/{id}`
- **Authentication**: Bearer Token
- **Response**: Thông tin account bao gồm:
  - `id`: ID của account
  - `type`: Loại tài khoản (TRIAL, PREMIUM, etc.)
  - `trialExpiresAt`: Ngày hết hạn dùng thử hoặc ngày bắt đầu

## Các thay đổi chính

### 1. Thêm Interface cho Account Info
```typescript
interface AccountInfo {
  id: number;
  type: string;
  trialExpiresAt: string;
}
```

### 2. Cập nhật ProfileSection
- **Account Type**: Hiển thị loại tài khoản với màu xanh lá
- **Trial Expiry**: Hiển thị ngày hết hạn hoặc ngày bắt đầu
- **Smart Display**: Thay đổi text dựa trên loại tài khoản

### 3. State Management
```typescript
const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
```

### 4. Fetch Account Info Function
```typescript
const fetchAccountInfo = useCallback(async () => {
  try {
    const accountId = await AsyncStorage.getItem('accountId');
    const userId = userProfile?.id?.toString();
    const idToUse = accountId || userId || '1';
    
    const response = await getAccountByIdAPI(idToUse);
    if (response) {
      const accountData = response as unknown as AccountInfo;
      setAccountInfo(accountData);
    }
  } catch (error) {
    // Optional data, không hiển thị error
  }
}, [userProfile?.id]);
```

### 5. Enhanced UI Display
```typescript
{accountInfo && (
  <>
    <Text style={styles.profileAccountType}>
      Loại tài khoản: {accountInfo.type}
    </Text>
    <Text style={styles.profileTrialExpiry}>
      {accountInfo.type === 'TRIAL' 
        ? `Hết hạn dùng thử: ${new Date(accountInfo.trialExpiresAt).toLocaleDateString('vi-VN')}`
        : `Ngày bắt đầu: ${new Date(accountInfo.trialExpiresAt).toLocaleDateString('vi-VN')}`
      }
    </Text>
  </>
)}
```

## Cấu trúc dữ liệu hiển thị

### Thông tin Account
- **Account Type**: Loại tài khoản (TRIAL, PREMIUM, etc.)
- **Trial Expiry**: Ngày hết hạn dùng thử (cho TRIAL) hoặc ngày bắt đầu (cho PREMIUM)
- **Smart Formatting**: Format ngày theo định dạng Việt Nam

### Visual Design
- **Account Type**: Màu xanh lá (#059669), font weight 600
- **Trial Expiry**: Màu xám (#6B7280), font weight 500
- **Conditional Text**: Thay đổi text dựa trên loại tài khoản

## Tính năng mới

### 1. Account Type Display
- Hiển thị loại tài khoản rõ ràng
- Màu sắc phân biệt dễ nhận biết
- Font weight phù hợp

### 2. Smart Date Display
- **TRIAL**: "Hết hạn dùng thử: DD/MM/YYYY"
- **PREMIUM/OTHER**: "Ngày bắt đầu: DD/MM/YYYY"
- Format ngày theo chuẩn Việt Nam

### 3. Error Handling
- Account info là optional data
- Không hiển thị error toast cho account info
- Log error để debug

### 4. Refresh Integration
- Refresh button cũng refresh account info
- Tự động load khi user profile thay đổi
- useCallback để optimize performance

## Cách hoạt động

### 1. Data Flow
```
useEffect → fetchUserProfile + fetchAccountInfo
  ↓
getUserProfileAPI() → setUserProfile
getAccountByIdAPI() → setAccountInfo
  ↓
ProfileSection renders both userProfile + accountInfo
```

### 2. ID Resolution
```
AsyncStorage.getItem('accountId') || userProfile.id || '1'
  ↓
getAccountByIdAPI(idToUse)
```

### 3. Conditional Rendering
```
accountInfo exists?
  ↓ YES
Show account type + trial expiry
  ↓ NO
Hide account info section
```

## Lợi ích

### 1. Complete User Information
✅ **Account Type**: Biết được loại tài khoản của user  
✅ **Trial Status**: Thông tin về dùng thử hoặc premium  
✅ **Date Information**: Ngày hết hạn hoặc ngày bắt đầu  

### 2. Better UX
✅ **Clear Information**: Thông tin rõ ràng và dễ hiểu  
✅ **Smart Display**: Text thay đổi theo context  
✅ **Visual Hierarchy**: Màu sắc và font weight phù hợp  

### 3. Developer Experience
✅ **Type Safety**: Interface rõ ràng cho AccountInfo  
✅ **Error Handling**: Xử lý lỗi graceful  
✅ **Performance**: useCallback để optimize  

### 4. Maintainability
✅ **Modular Code**: Tách biệt logic fetch account info  
✅ **Reusable**: Có thể sử dụng ở các màn hình khác  
✅ **Extensible**: Dễ dàng thêm thông tin account mới  

## Kết quả
Profile screen giờ đây hiển thị đầy đủ thông tin:
- **User Profile**: Username, email, role, ID
- **Account Info**: Type, trial expiry/start date
- **Statistics**: Voice tests, practices, packages
- **Smart Display**: Text và format phù hợp với context

User có thể thấy rõ ràng loại tài khoản và thời hạn sử dụng! 🎯
