// src/api/paymentService.ts
import api from './api';
import { InitiatePaymentRequest, VerifyPaymentRequest, VerifyPaymentResponse, TransactionStatusResponse, InitiatePaymentResponse } from '../models/models';

export const initiatePayment = async (
  data: InitiatePaymentRequest
): Promise<InitiatePaymentResponse> => {
  // ✅ FIXED: Changed from /payment/ to /payments/
  const response = await api.post<InitiatePaymentResponse>('/payments/initiate', data);
  return response.data;
};

export const verifyPayment = async (
  data: VerifyPaymentRequest
): Promise<VerifyPaymentResponse> => {
  // ✅ FIXED: Changed from /payment/ to /payments/
  const response = await api.post<VerifyPaymentResponse>('/payments/verify', data);
  return response.data;
};

export const getTransactionStatus = async (
  transactionId: number
): Promise<TransactionStatusResponse> => {
  const response = await api.get<TransactionStatusResponse>(`/payments/status/${transactionId}`);
  return response.data;
};

export interface PaymentHistoryItem {
  id: number;
  amount: number;
  status: string;
  refundStatus?: string;
  refundAmount?: number;
  paymentMethod: string;
  createdAt: string;
  paidAt?: string;
  shopName?: string;
  services?: string;
}

export interface PaymentHistoryResponse {
  transactions: PaymentHistoryItem[];
  totalSpent: number;
  totalRefunded: number;
  transactionCount: number;
}

export const getPaymentHistory = async (): Promise<PaymentHistoryResponse> => {
  const response = await api.get<PaymentHistoryResponse>('/payments/history');
  return response.data;
};

// ─── URL Helpers ───

/**
 * For eSewa: construct full URL with query params from formData
 * eSewa V2 form endpoint accepts GET params
 */
export const buildEsewaUrl = (
  paymentUrl: string,
  formData?: Record<string, string>
): string => {
  if (!formData) return paymentUrl;

  const params = new URLSearchParams();
  Object.entries(formData).forEach(([key, value]) => {
    if (key !== 'payment_url' && value) {
      params.append(key, value);
    }
  });

  return `${paymentUrl}?${params.toString()}`;
};