import { apiRequest } from "./queryClient";

export interface CouponResponse {
  success: boolean;
  data?: {
    mobileNumber: string;
    couponCode: string;
    distributedAt: string;
    message: string;
  };
  error?: string;
  message?: string;
  details?: any[];
  retryAfter?: string;
}

export interface AdminStats {
  success: boolean;
  data?: {
    totalCoupons: number;
    distributedCoupons: number;
    availableCoupons: number;
    distributionRate: string;
  };
}

export interface Distribution {
  id: number;
  mobileNumber: string;
  couponCode: string;
  distributedAt: string;
}

export interface AdminDistributions {
  success: boolean;
  data?: Distribution[];
}

export interface CouponItem {
  id: number;
  code: string;
  isUsed: boolean;
  createdAt: string;
}

export interface AdminCoupons {
  success: boolean;
  data?: CouponItem[];
}

export const testCouponAPI = async (mobileNumber: string): Promise<Response> => {
  const url = `/api/coupon?mobileNumber=${encodeURIComponent(mobileNumber)}`;
  return apiRequest("GET", url);
};

export interface UploadResponse {
  success: boolean;
  data?: {
    totalProcessed: number;
    successfullyAdded: number;
    errors: number;
    errorDetails: string[];
  };
  message?: string;
  error?: string;
}

export const uploadCouponsCSV = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('csvFile', file);
  
  const response = await fetch('/api/admin/upload-coupons', {
    method: 'POST',
    body: formData,
  });
  
  return response.json();
};
