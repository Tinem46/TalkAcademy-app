import { api } from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

//AI

// Đổi lại cho đồng bộ với backend mới:
export const registerApi = (
  username: string,
  email: string,
  password: string,
  role: string = "CUSTOMER"
) => {
  return api.post<IBackendRes<any>>("auth/register", {
    username,
    email,
    password,
    role,
  });
};
// Xác nhận email từ link, cần userId và token
export const confirmEmailAPI = (userId: string, token: string) => {
  return api.get<IBackendRes<any>>("Auth/confirm-email", {
    params: { userId, token },
  });
};

export const resendConfirmationAPI = (email: string) => {
  return api.post<IBackendRes<any>>("Auth/resend-confirmation", { email });
};



export const loginAPI = (username: string, password: string) => {
  console.log("🌐 API Call - URL:", "auth/login");
  console.log("🌐 API Call - Body:", { username, password: "***" });

  return api.post<IBackendRes<any>>("auth/login", { username, password });
};
// Google
export const googleLoginAPI = (tokenId: string) => {
  return api.post<IBackendRes<any>>("Auth/google-login-token", { tokenId });
};

export const getUserInfoAPI = () => {
  return api.get<IBackendRes<any>>("Auth/current-user");
}

// Lấy profile user hiện tại
export const getUserProfileAPI = () => {
  return api.get<IBackendRes<any>>("users/profile");
}

// User Survey APIs
export const createUserSurveyAPI = (surveyData: {
  userId: number;
  categoryId: number;
  discoverSource: string;
  selfAssessment: string;
  skillFocus: string;
  trainingGoal: string;
  allowReminder: boolean;
}) => {
  console.log('🌐 API Call - POST /user-surveys');
  console.log('🌐 Request data:', JSON.stringify(surveyData, null, 2));

  return api.post<IBackendRes<any>>("user-surveys", surveyData);
};

export const getUserSurveyAPI = () => {
  console.log('🔍 Getting all surveys from API');
  return api.get<IBackendRes<any>>(`user-surveys`);
};

export const checkUserSurveyExistsAPI = (userId: number) => {
  return api.get<IBackendRes<any>>(`user-surveys?userId=${userId}`);
};

// Lấy thông tin account theo ID
export const getAccountByIdAPI = (accountId: string) => {
  return api.get<IBackendRes<any>>(`accounts/${accountId}`);
}

export const updateUserAPI = (id: string, data: any) => {
  return api.put<IBackendRes<any>>(`Auth/profile`, data);
};

export const fetchProductsAPI = (params: any) => {
  // "Product" là route backend trả về danh sách sản phẩm
  return api.get<IBackendRes<any>>("Product", { params });
};
export const fetchCouponAPI = () => {
  // "Coupon" là route backend trả về danh sách mã giảm giá
  return api.get<IBackendRes<any>>("Coupons");
};

export const updatePasswordAPI = (oldPassword: string, newPassword: string, confirmPassword: string) => {
  return api.post<IBackendRes<any>>("Auth/change-password", {
    oldPassword,
    newPassword,
    confirmPassword,
  })
};

export const getProductDetailAPI = (id: string) => api.get<IBackendRes<any>>(`Product/${id}`);
export const getProductVariantsAPI = (id: string) => api.get<IBackendRes<any>>(`ProductVariant/product/${id}`);
export const addToCartAPI = (
  data: { productVariantId: string | null; quantity: number }[]
) => api.post<IBackendRes<any>>("Cart", data);
export const updateCartItemAPI = ({
  cartItemId,
  quantity,
}: {
  cartItemId: string;
  quantity: number;
}) => {
  return api.put<IBackendRes<any>>(`Cart/${cartItemId}`, { quantity });
};

// Xóa 1 item khỏi giỏ
export const removeCartItemAPI = (cartItemId: string[]) => {
  return api.delete<IBackendRes<any>>("Cart", {
    data: cartItemId,
  } as any);
};
export const getCartAPI = () => {
  return api.get<IBackendRes<any>>("Cart"); // URL tùy theo backend bạn
};
export const getProductVariantAPI = (variantId: string) =>
  api.get<IBackendRes<any>>(`ProductVariant/${variantId}`);
export const fetchCategoriesAPI = () =>
  api.get<IBackendRes<any>>(`Category`);
export const calculateCartTotalAPI = (cartItemIds: string[]) => {
  return api.post<IBackendRes<any>>("Cart/calculate-total", cartItemIds, {
    headers: { "Content-Type": "application/json" },
  });
};
export const getUserAddressesAPI = () => {
  return api.get<IBackendRes<any>>("UserAddress");
};
// Lấy danh sách phương thức giao hàng
export const getShippingMethodsAPI = () => {
  // Đường dẫn API giống web
  return api.get("/admin/shipping-methods");
};// Đặt hàng
export const placeOrderAPI = (payload: any) => {
  return api.post("Orders", payload);
};
export const getOrderDetailAPI = (orderId: string) => {
  return api.get(`Orders/${orderId}`);
};

// Lấy design mới nhất
export const fetchNewestDesignAPI = () =>
  api.get("CustomDesign/filter-user?PageSize=1&SortBy=CreatedAt&SortDescending=true");

// Lấy lịch sử
export const fetchDesignHistoryAPI = () =>
  api.get("CustomDesign/filter-user?PageSize=20");

// Tạo mới design
export const createDesignAPI = (payload: string) =>
  api.post("CustomDesign", payload);

// Thay đổi trạng thái
export const updateDesignStatusAPI = (id: string, status: any) =>
  api.patch(`CustomDesign/${id}/status`, { status });



export const printAsyncStorage = () => {
  AsyncStorage.getAllKeys((err, keys) => {
    AsyncStorage.multiGet(keys!, (error, stores) => {
      let asyncStorage: any = {}
      stores?.map((result, i, store) => {
        asyncStorage[store[i][0]] = store[i][1]
      });
      console.log(JSON.stringify(asyncStorage, null, 2));
    });
  });
};

export const backEndURL = () => {
  const URL_ANROID_BACKEND = process.env.EXPO_PUBLIC_ANDROID_API_URL;
  const URL_IOS_BACKEND = process.env.EXPO_PUBLIC_IOS_API_URL;
  const backend =
    Platform.OS === "android" ? URL_ANROID_BACKEND : URL_IOS_BACKEND;
  return backend;
}


export const currencyFormatter = (value: any) => {
  const options = {
    significantDigits: 2,
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbol: 'vnđ'
  }

  if (typeof value !== 'number') value = 0.0
  value = value.toFixed(options.significantDigits)

  const [currency] = value.split('.')
  return `${currency.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    options.thousandsSeparator
  )} ${options.symbol}`
}

// mockApi.ts
export const mockLikeProductAPI = async (productId: string, quantity: number) => {
  // Giả lập response delay và kết quả
  return new Promise((resolve) => {
    setTimeout(() => {
      // Giả lập thành công
      resolve({
        data: {
          productId,
          quantity,
          success: true,
        },
        message: "Success",
      });
    }, 500); // 500ms delay giả lập API
  });
};




