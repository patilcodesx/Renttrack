// src/lib/apiClient.ts

/* =====================================================
   BASE URL
===================================================== */

export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://renttrack-backend-production.up.railway.app/api";

export const UPLOAD_BASE_URL =
  import.meta.env.VITE_UPLOAD_BASE_URL || "https://renttrack-backend-production.up.railway.app";

/* =====================================================
   TOKEN STORAGE
===================================================== */

let authToken: string | null = localStorage.getItem("renttrack_token");

function setToken(token: string) {
  authToken = token;
  localStorage.setItem("renttrack_token", token);
}

function clearToken() {
  authToken = null;
  localStorage.removeItem("renttrack_token");
}

/* =====================================================
   COMMON FETCH HELPER
===================================================== */
export async function fetchJson<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      message = data.message || data.error || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

/* =====================================================
   API CLIENT
===================================================== */

const apiClient = {
  /* ======================
     TOKEN
  ====================== */
  setToken,
  clearToken,

  /* ======================
     AUTH
  ====================== */

  login(email: string, password: string) {
    return fetchJson("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register(data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) {
    return fetchJson("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getMe() {
    return fetchJson("/auth/me");
  },

  getMyLease() {
    return fetchJson("/lease/me");
  },

  /* ======================
     DASHBOARD
  ====================== */

  getDashboardStats() {
    return fetchJson("/dashboard/stats");
  },

  getRecentActivity() {
    return fetchJson("/dashboard/activity");
  },

  /* ======================
     TENANTS
  ====================== */

  getTenants() {
    return fetchJson("/tenants");
  },

  getTenant(id: string) {
    return fetchJson(`/tenants/${id}`);
  },

  createTenant(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    govtId?: string;
    propertyId: string;
    leaseStart: string;
    leaseEnd: string;
    rentAmount: number;
    deposit?: number;
    profileImageUrl?: string;
  }) {
    return fetchJson("/tenants", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  deleteTenant(id: string) {
    return fetchJson(`/tenants/${id}`, {
      method: "DELETE",
    });
  },

  /* ======================
     PROPERTIES
  ====================== */

  getProperties() {
    return fetchJson("/properties");
  },

  getPropertyById(id: string) {
    return fetchJson(`/properties/${id}`);
  },

  createProperty(data: {
    title: string;
    address: string;
    bhk: number;
    price: number;
    images?: string[];
    tags?: string[];
    available?: boolean;
  }) {
    return fetchJson("/properties", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateProperty(
    id: string,
    data: {
      title: string;
      address: string;
      bhk: number;
      price: number;
      images?: string[];
      tags?: string[];
      available?: boolean;
    }
  ) {
    return fetchJson(`/properties/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteProperty(id: string) {
    return fetchJson(`/properties/${id}`, {
      method: "DELETE",
    });
  },

  /* ======================
     PAYMENTS
  ====================== */

  getPayments() {
    return fetchJson("/payments");
  },

  getMyPayments() {
    return fetchJson("/payments/me");
  },

  getTenantPayments(tenantId: string) {
    return fetchJson(`/payments/tenant/${tenantId}`);
  },

  markPaymentPaid(
    id: string,
    data: {
      paidDate: string;
      method?: string;
      receiptUrl?: string;
    }
  ) {
    return fetchJson(`/payments/${id}/mark-paid`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  recordManualPayment(data: {
    tenantId: string;
    month: string;
    dueDate: string;
    amount: number;
    paidDate: string;
    method?: string;
  }) {
    return fetchJson("/payments/record-manual", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /* ======================
     FILE UPLOADS
  ====================== */

  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${UPLOAD_BASE_URL}/uploads`, {
      method: "POST",
      headers: authToken
        ? { Authorization: `Bearer ${authToken}` }
        : undefined,
      body: formData,
    });

    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);

    return res.json();
  },

  async uploadPropertyImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${UPLOAD_BASE_URL}/uploads/property`, {
      method: "POST",
      headers: authToken
        ? { Authorization: `Bearer ${authToken}` }
        : undefined,
      body: formData,
    });

    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);

    const data = await res.json();
    return data.url;
  },

  getUploadParsed(uploadId: string) {
    return fetchJson(`/uploads/${uploadId}/parsed`);
  },

  /* ======================
     RAZORPAY
  ====================== */

  createRazorpayOrder(paymentId: string) {
    return fetchJson("/payments/razorpay/order", {
      method: "POST",
      body: JSON.stringify({ paymentId }),
    });
  },

  verifyRazorpayPayment(data: {
    paymentId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    return fetchJson("/payments/razorpay/verify", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /* ======================
     STRIPE
  ====================== */

  createStripeIntent(paymentId: string) {
    return fetchJson("/payments/stripe/intent", {
      method: "POST",
      body: JSON.stringify({ paymentId }),
    });
  },
};

export default apiClient;
