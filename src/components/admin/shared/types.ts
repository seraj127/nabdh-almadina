export type ViewType = 'dashboard' | 'products' | 'orders' | 'financial' | 'customers' | 'logistics' | 'walletLoyalty' | 'analytics' | 'settings' | 'coupons' | 'reviews' | 'auditLog' | 'notifications' | 'inventory' | 'subcategories';

export interface ShippingCarrier {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
  type: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo: string | null;
  apiEndpoint: string | null;
  apiKey: string | null;
  apiSecret: string | null;
  webhookUrl: string | null;
  trackingUrl: string | null;
  coverageAreas: string | null;
  maxWeight: number;
  pricePerKg: number;
  basePrice: number;
  codFee: number;
  codFixedFee: number;
  estimatedDays: number;
  isActive: boolean;
  isIntegrated: boolean;
  integrationType: string;
  rating: number;
  totalShipments: number;
  successRate: number;
  avgDeliveryDays: number;
  notes: string | null;
  createdAt: string;
  _count?: { shipments: number };
}

export interface Shipment {
  id: string;
  orderId: string;
  carrierId: string;
  trackingNumber: string | null;
  waybillNumber: string | null;
  status: string;
  weight: number | null;
  shippingCost: number;
  codAmount: number;
  codCollected: boolean;
  estimatedPickup: string | null;
  actualPickup: string | null;
  estimatedDelivery: string | null;
  actualDelivery: string | null;
  failedAttempts: number;
  failureReason: string | null;
  notes: string | null;
  carrierData: string | null;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
  carrier?: {
    id: string;
    nameAr: string;
    nameEn: string;
    code: string;
    type: string;
    trackingUrl: string | null;
  };
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    paymentMethod: string;
    user: { id: string; name: string | null; phone: string };
    address?: { address: string; city: string; area: string | null } | null;
  };
  logs?: {
    id: string;
    status: string;
    location: string | null;
    descriptionAr: string | null;
    descriptionEn: string | null;
    occurredAt: string;
  }[];
}

export interface CarriersResponse {
  carriers: ShippingCarrier[];
  summary: {
    totalCarriers: number;
    activeCarriers: number;
    integratedCarriers: number;
    totalShipments: number;
  };
}

export interface ShipmentsResponse {
  shipments: Shipment[];
  total: number;
}

export interface StatsData {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  ordersByStatus: Record<string, number>;
  revenueByDay: { date: string; revenue: number }[];
  topSellingProducts: {
    productId: string;
    nameAr: string;
    nameEn: string;
    mainImage: string | null;
    price: number;
    totalQuantity: number;
    totalRevenue: number;
  }[];
  lowStockProducts: {
    id: string;
    nameAr: string;
    nameEn: string;
    sku: string;
    stock: number;
    mainImage: string | null;
  }[];
  categoryBreakdown: {
    id: string;
    nameAr: string;
    nameEn: string;
    slug: string;
    productCount: number;
    revenue: number;
  }[];
}

export interface ProductsResponse {
  products: {
    id: string;
    nameAr: string;
    nameEn: string;
    descriptionAr: string | null;
    descriptionEn: string | null;
    sku: string;
    price: number;
    comparePrice: number | null;
    mainImage: string | null;
    images: string;
    video: string | null;
    stock: number;
    isActive: boolean;
    isFeatured: boolean;
    category: { nameAr: string; nameEn: string; slug: string };
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AdminOrdersResponse {
  orders: {
    id: string;
    orderNumber: string;
    status: string;
    paymentMethod: string;
    total: number;
    fraudScore: number;
    fraudFlagged: boolean;
    createdAt: string;
    user: { id: string; name: string | null; phone: string };
    items: {
      id: string;
      nameAr: string;
      nameEn: string;
      price: number;
      quantity: number;
      total: number;
      image: string | null;
    }[];
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FeatureFlagsResponse {
  flags: {
    id: string;
    key: string;
    value: boolean;
    description: string | null;
    updatedAt: string;
  }[];
}

export interface UsersResponse {
  users: {
    id: string;
    name: string | null;
    phone: string;
    email: string | null;
    role: string;
    loyaltyTier: string;
    loyaltyPoints: number;
    walletBalance: number;
    isActive: boolean;
    createdAt: string;
    _count: { orders: number };
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary: {
    totalCustomers: number;
    totalAdmins: number;
    totalVendors: number;
    totalDrivers: number;
  };
}

export interface VendorsResponse {
  vendors: {
    id: string;
    nameAr: string;
    nameEn: string;
    type: string;
    commission: number;
    phone: string | null;
    isActive: boolean;
    isVerified: boolean;
    rating: number;
    totalSales: number;
    _count: { products: number };
  }[];
  typeBreakdown: Record<string, number>;
}

export interface InventoryResponse {
  movements: {
    id: string;
    type: string;
    quantity: number;
    reference: string | null;
    note: string | null;
    createdAt: string;
    product: {
      id: string;
      nameAr: string;
      nameEn: string;
      sku: string;
      stock: number;
      price: number;
    };
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary: {
    totalStockValue: number;
    lowStockCount: number;
    movementsToday: number;
  };
}

export interface LoyaltyResponse {
  loyalty: {
    totalPointsIssued: number;
    totalPointsRedeemed: number;
    tierDistribution: { tier: string; count: number }[];
    breakdown: { type: string; count: number; points: number }[];
  };
  wallet: {
    totalBalance: number;
    totalTransactions: number;
    recentTransactions: {
      id: string;
      type: string;
      amount: number;
      currency: string;
      description: string | null;
      createdAt: string;
    }[];
    breakdown: { type: string; count: number; amount: number }[];
  };
  topMembers: {
    id: string;
    name: string | null;
    phone: string;
    loyaltyTier: string;
    loyaltyPoints: number;
    walletBalance: number;
    _count: { orders: number };
  }[];
}

export interface CouponsResponse {
  coupons: {
    id: string;
    code: string;
    descriptionAr: string | null;
    descriptionEn: string | null;
    type: string;
    value: number;
    minOrder: number;
    maxDiscount: number | null;
    usageLimit: number | null;
    usageCount: number;
    perUserLimit: number;
    startsAt: string;
    expiresAt: string;
    isActive: boolean;
    createdAt: string;
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ReviewsResponse {
  reviews: {
    id: string;
    rating: number;
    title: string | null;
    comment: string | null;
    isVerified: boolean;
    isActive: boolean;
    createdAt: string;
    product: {
      id: string;
      nameAr: string;
      nameEn: string;
      mainImage: string | null;
    };
    user: {
      id: string;
      name: string | null;
      phone: string;
    };
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary: {
    totalReviews: number;
    averageRating: number;
    pendingReviews: number;
    verifiedReviews: number;
  };
}

export interface AuditLogResponse {
  logs: {
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    details: string | null;
    ip: string | null;
    createdAt: string;
    user: {
      id: string;
      name: string | null;
      phone: string;
    } | null;
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
