import { create } from "zustand";

export const useAppStore = create((set) => ({
  tenants: [],
  properties: [],
  payments: [],

  addTenant: (data) =>
    set((state) => ({
      tenants: [...state.tenants, data],
      payments: [
        ...state.payments,
        {
          id: Date.now(),
          tenant: `${data.firstName} ${data.lastName}`,
          amount: Number(data.monthlyRent),
          property: data.propertyName || "Assigned Property",
          status: "due",
          dueDate: data.leaseStart,
          paidDate: null,
        },
      ],
    })),

  addProperty: (data) =>
    set((state) => ({
      properties: [...state.properties, data],
    })),
}));
