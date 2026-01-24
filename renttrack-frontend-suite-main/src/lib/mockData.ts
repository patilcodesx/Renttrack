// Mock API data for RentTrack

export const mockProperties = [
  {
    id: "1",
    title: "Modern Downtown Apartment",
    address: "123 Main St, Downtown",
    price: 1800,
    bedrooms: 2,
    bathrooms: 1,
    sqft: 950,
    amenities: ["Parking", "Gym", "Pool"],
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
    available: true,
  },
  {
    id: "2",
    title: "Cozy Studio Near Park",
    address: "456 Oak Ave, Westside",
    price: 1200,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 550,
    amenities: ["Laundry", "Pet Friendly"],
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
    available: true,
  },
  {
    id: "3",
    title: "Luxury Penthouse Suite",
    address: "789 Sky Tower, Financial District",
    price: 4500,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1800,
    amenities: ["Parking", "Gym", "Pool", "Concierge", "Rooftop"],
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
    available: false,
  },
  {
    id: "4",
    title: "Family Home with Garden",
    address: "321 Maple Dr, Suburbs",
    price: 2800,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2200,
    amenities: ["Garage", "Garden", "Pet Friendly"],
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400",
    available: true,
  },
];

export const mockTenants = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "(555) 123-4567",
    govtId: "DL-123456789",
    property: "Modern Downtown Apartment",
    rentAmount: 1800,
    leaseStart: "2024-01-01",
    leaseEnd: "2024-12-31",
    status: "active",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "(555) 987-6543",
    govtId: "PP-987654321",
    property: "Cozy Studio Near Park",
    rentAmount: 1200,
    leaseStart: "2024-03-15",
    leaseEnd: "2025-03-14",
    status: "active",
  },
  {
    id: "3",
    name: "Michael Chen",
    email: "m.chen@email.com",
    phone: "(555) 456-7890",
    govtId: "DL-456789123",
    property: "Family Home with Garden",
    rentAmount: 2800,
    leaseStart: "2023-06-01",
    leaseEnd: "2024-05-31",
    status: "expiring",
  },
];

export const mockPayments = [
  { id: "1", tenant: "John Smith", property: "Modern Downtown Apartment", amount: 1800, dueDate: "2024-12-01", status: "paid", paidDate: "2024-11-28" },
  { id: "2", tenant: "Sarah Johnson", property: "Cozy Studio Near Park", amount: 1200, dueDate: "2024-12-01", status: "paid", paidDate: "2024-12-01" },
  { id: "3", tenant: "Michael Chen", property: "Family Home with Garden", amount: 2800, dueDate: "2024-12-01", status: "due", paidDate: null },
  { id: "4", tenant: "John Smith", property: "Modern Downtown Apartment", amount: 1800, dueDate: "2024-11-01", status: "paid", paidDate: "2024-10-30" },
  { id: "5", tenant: "Sarah Johnson", property: "Cozy Studio Near Park", amount: 1200, dueDate: "2024-11-01", status: "paid", paidDate: "2024-11-01" },
  { id: "6", tenant: "Michael Chen", property: "Family Home with Garden", amount: 2800, dueDate: "2024-11-01", status: "overdue", paidDate: null },
];

export const mockActivity = [
  { id: "1", type: "payment", message: "John Smith paid December rent", time: "2 hours ago" },
  { id: "2", type: "onboarding", message: "New tenant application received", time: "5 hours ago" },
  { id: "3", type: "lease", message: "Michael Chen's lease expiring soon", time: "1 day ago" },
  { id: "4", type: "property", message: "Studio apartment listed", time: "2 days ago" },
];

export const mockUsers = [
  { id: "1", name: "Admin User", email: "admin@renttrack.com", role: "admin", lastLogin: "2024-12-08" },
  { id: "2", name: "Property Manager", email: "manager@renttrack.com", role: "manager", lastLogin: "2024-12-07" },
  { id: "3", name: "Support Staff", email: "support@renttrack.com", role: "staff", lastLogin: "2024-12-06" },
];

export const mockDashboardStats = {
  totalProperties: 24,
  occupiedUnits: 21,
  totalTenants: 21,
  monthlyRevenue: 45600,
  pendingPayments: 3,
  upcomingRenewals: 5,
};

// Mock API functions
export const api = {
  getProperties: () => Promise.resolve(mockProperties),
  getTenants: () => Promise.resolve(mockTenants),
  getPayments: () => Promise.resolve(mockPayments),
  getActivity: () => Promise.resolve(mockActivity),
  getUsers: () => Promise.resolve(mockUsers),
  getDashboardStats: () => Promise.resolve(mockDashboardStats),
  
  uploadDocument: (file: File) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          extractedData: {
            name: "Jane Doe",
            phone: "(555) 234-5678",
            email: "jane.doe@email.com",
            govtId: "DL-234567890",
            rentAmount: 1500,
            address: "567 Elm Street, Apt 4B",
            leaseStart: "2025-01-01",
            leaseEnd: "2025-12-31",
          },
        });
      }, 2000);
    });
  },
};
