import { apiFetch } from "./client";

export interface PaymentReturnResult {
  success: boolean;
  orderId?: string;
  transactionId?: string;
  amount?: number;
  responseCode?: string;
  message?: string;
  payDate?: string;
}

export async function createPaymentUrl(subscriptionId: number): Promise<{ paymentUrl: string }> {
  return apiFetch<{ paymentUrl: string }>(`/api/payment/create/${subscriptionId}`, {
    method: "POST",
  });
}

export async function verifyVnPayReturn(params: Record<string, string>): Promise<PaymentReturnResult> {
  return apiFetch<PaymentReturnResult>("/api/payment/verify-vnpay-return", {
    method: "POST",
    body: params,
  });
}
