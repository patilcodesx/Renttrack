// src/lib/apiClient.ts

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

/* =====================================================
   TOKEN STORAGE (SYNCED)
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
async function fetchJson(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
  });

  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      errorMessage = data.error || data.message || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  if (res.status === 204) return null;
  return res.json();
}

/* =====================================================
   API CLIENT
===================================================== */
const apiClient = {
  /* -------- TOKEN HELPERS -------- */
  setToken,
  clearToken,

  /* ======================
     AUTH
  ====================== */
  async login(email: string, password: string) {
    return fetchJson("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) {
    return fetchJson("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async getMe() {
    return fetchJson("/auth/me");
  },

  async getMyLease() {
    return fetchJson("/lease/me");
  },

  /* ======================
     DASHBOARD
  ====================== */
  async getDashboardStats() {
    return fetchJson("/dashboard/stats");
  },

  async getRecentActivity() {
    return fetchJson("/dashboard/activity");
  },

  /* ======================
     TENANTS
  ====================== */
  async getTenants() {
    return fetchJson("/tenants");
  },

  async getTenant(id: string) {
    return fetchJson(`/tenants/${id}`);
  },

  async createTenant(data: {
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async deleteTenant(id: string) {
    return fetchJson(`/tenants/${id}`, { method: "DELETE" });
  },

  /* ======================
     PROPERTIES
  ====================== */
  async getProperties() {
    return fetchJson("/properties");
  },

  async getPropertyById(id: string) {
    return fetchJson(`/properties/${id}`);
  },

  async createProperty(data: {
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async updateProperty(
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async deleteProperty(id: string) {
    return fetchJson(`/properties/${id}`, { method: "DELETE" });
  },

  /* ======================
     PAYMENTS (EXISTING)
  ====================== */
  async getPayments() {
    return fetchJson("/payments"); // LANDLORD
  },

  async getMyPayments() {
    return fetchJson("/payments/me"); // TENANT
  },

  async getTenantPayments(tenantId: string) {
    return fetchJson(`/payments/tenant/${tenantId}`);
  },

  async markPaymentPaid(
    id: string,
    data: {
      paidDate: string;
      method?: string;
      receiptUrl?: string;
    }
  ) {
    return fetchJson(`/payments/${id}/mark-paid`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async recordManualPayment(data: {
    tenantId: string;
    month: string;
    dueDate: string;
    amount: number;
    paidDate: string;
    method?: string;
  }) {
    return fetchJson("/payments/record-manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

 /* ======================
   DOCUMENT UPLOAD
====================== */
async uploadDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/uploads`, {
    method: "POST",
    headers: {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      // ❗ DO NOT set Content-Type for FormData
    },
    body: formData,
  });

  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      errorMessage = data.message || data.error || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  // ✅ Must return UploadDTO
  return res.json(); // { id, filename, status, ... }
},
/* ======================
   OCR / UPLOADS
====================== */
async getUploadParsed(uploadId: string) {
  return fetchJson(`/uploads/${uploadId}/parsed`);
},


  /* =====================================================
     🔥 REAL PAYMENTS (RAZORPAY)
  ===================================================== */

  // 1️⃣ Create Razorpay Order
  async createRazorpayOrder(paymentId: string) {
    return fetchJson("/payments/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId }),
    });
  },

  // 2️⃣ Verify Razorpay Payment
  async verifyRazorpayPayment(data: {
    paymentId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    return fetchJson("/payments/razorpay/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  /* =====================================================
     🌍 STRIPE (OPTIONAL – INTERNATIONAL)
  ===================================================== */
  async createStripeIntent(paymentId: string) {
    return fetchJson("/payments/stripe/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId }),
    });
  },
};

export default apiClient;

