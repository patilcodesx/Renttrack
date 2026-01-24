// src/lib/mockApi.ts

export const mockApi = {
  async login(email: string, password: string) {
    if (email !== "demo@renttrack.local" || password !== "demo123") {
      throw new Error("Invalid email or password");
    }

    return {
      token: "mock-jwt-token",
      user: {
        id: "1",
        name: "Demo User",
        email,
        role: "OWNER",
      },
    };
  },

  async uploadFile(file: File) {
    return {
      uploadId: "mock-upload-id",
      fileName: file.name,
      status: "PROCESSED",
    };
  },

  async getUploadParsed(id: string) {
    return {
      id,
      tenantName: "John Doe",
      rent: 12000,
      startDate: "2025-06-01",
    };
  },

  async getTenants() {
    return [
      { id: "1", name: "John Doe", rent: 12000 },
      { id: "2", name: "Jane Smith", rent: 15000 },
    ];
  },

  async getTenant(id: string) {
    return { id, name: "John Doe", rent: 12000 };
  },

  async createTenant(data: any) {
    return { id: "new-tenant-id", ...data };
  },

  async getDashboardStats() {
    return {
      totalProperties: 12,
      occupiedUnits: 9,
      totalTenants: 14,
      monthlyRevenue: 185000,
      pendingPayments: 2,
      upcomingRenewals: 1,
    };
  },

  async getRecentActivity() {
    return [
      { id: 1, message: "Rent received from John Doe" },
      { id: 2, message: "New tenant onboarded" },
    ];
  },
};
