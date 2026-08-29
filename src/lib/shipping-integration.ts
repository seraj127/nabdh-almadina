/**
 * Shipping API Integration Framework for نبض المدينة
 * Adapter pattern for connecting with external carrier APIs
 */

import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';

// ─── Types ─────────────────────────────────────────────────
export interface CreateShipmentParams {
  orderId: string;
  orderNumber: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderCity: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverCity: string;
  receiverArea?: string;
  weight?: number;
  codAmount?: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  notes?: string;
}

export interface CreateShipmentResult {
  success: boolean;
  trackingNumber?: string;
  waybillNumber?: string;
  labelUrl?: string;
  shippingCost?: number;
  estimatedDelivery?: Date;
  error?: string;
  carrierData?: Record<string, any>;
}

export interface TrackingResult {
  status: string;
  location?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  latitude?: number;
  longitude?: number;
  timestamp: Date;
  history: Array<{
    status: string;
    location?: string;
    descriptionAr?: string;
    descriptionEn?: string;
    timestamp: Date;
  }>;
}

export interface RateCalcParams {
  originCity: string;
  destinationCity: string;
  destinationArea?: string;
  weight: number;
  codAmount?: number;
}

export interface RateCalcResult {
  fee: number;
  estimatedDays: number;
  currency: string;
  available: boolean;
}

// ─── Carrier Adapter Interface ─────────────────────────────
interface CarrierAdapter {
  carrierCode: string;
  createShipment(params: CreateShipmentParams): Promise<CreateShipmentResult>;
  cancelShipment(trackingNumber: string): Promise<boolean>;
  trackShipment(trackingNumber: string): Promise<TrackingResult>;
  calculateRate(params: RateCalcParams): Promise<RateCalcResult>;
}

// ─── Libya Post Adapter ────────────────────────────────────
class LibyaPostAdapter implements CarrierAdapter {
  carrierCode = 'libya_post';

  async createShipment(params: CreateShipmentParams): Promise<CreateShipmentResult> {
    const trackingNumber = `LP${Date.now().toString().slice(-10)}`;
    
    return {
      success: true,
      trackingNumber,
      waybillNumber: `WB-${trackingNumber}`,
      shippingCost: 5 + (params.weight || 1) * 1.5,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      carrierData: { provider: 'libya_post', simulated: true },
    };
  }

  async cancelShipment(trackingNumber: string): Promise<boolean> {
    return true;
  }

  async trackShipment(trackingNumber: string): Promise<TrackingResult> {
    return {
      status: 'in_transit',
      location: 'طرابلس - المركز الرئيسي',
      descriptionAr: 'الشحنة في طريقها إلى الوجهة',
      descriptionEn: 'Shipment is in transit to destination',
      timestamp: new Date(),
      history: [
        { status: 'created', location: 'طرابلس', descriptionAr: 'تم إنشاء الشحنة', descriptionEn: 'Shipment created', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { status: 'picked_up', location: 'طرابلس', descriptionAr: 'تم استلام الشحنة', descriptionEn: 'Shipment picked up', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        { status: 'in_transit', location: 'طرابلس - المركز الرئيسي', descriptionAr: 'الشحنة في طريقها', descriptionEn: 'Shipment in transit', timestamp: new Date() },
      ],
    };
  }

  async calculateRate(params: RateCalcParams): Promise<RateCalcResult> {
    const fee = 5 + params.weight * 1.5 + (params.codAmount ? params.codAmount * 0.01 : 0);
    return { fee: Math.ceil(fee * 100) / 100, estimatedDays: 5, currency: 'LYD', available: true };
  }
}

// ─── Libya Express Adapter ────────────────────────────────
class LibyaExpressAdapter implements CarrierAdapter {
  carrierCode = 'libya_express';

  async createShipment(params: CreateShipmentParams): Promise<CreateShipmentResult> {
    const trackingNumber = `LE${Date.now().toString().slice(-10)}`;
    
    return {
      success: true,
      trackingNumber,
      waybillNumber: `EXP-${trackingNumber}`,
      shippingCost: 8 + (params.weight || 1) * 2,
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      carrierData: { provider: 'libya_express', simulated: true },
    };
  }

  async cancelShipment(trackingNumber: string): Promise<boolean> {
    return true;
  }

  async trackShipment(trackingNumber: string): Promise<TrackingResult> {
    return {
      status: 'in_transit',
      location: 'طرابلس - فرع سوق الجمعة',
      descriptionAr: 'الشحنة في الطريق السريع',
      descriptionEn: 'Shipment on express route',
      timestamp: new Date(),
      history: [
        { status: 'created', location: 'طرابلس', descriptionAr: 'تم إنشاء شحنة سريعة', descriptionEn: 'Express shipment created', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        { status: 'in_transit', location: 'طرابلس - فرع سوق الجمعة', descriptionAr: 'الشحنة في الطريق', descriptionEn: 'Shipment on the way', timestamp: new Date() },
      ],
    };
  }

  async calculateRate(params: RateCalcParams): Promise<RateCalcResult> {
    const fee = 8 + params.weight * 2 + (params.codAmount ? params.codAmount * 0.005 : 0);
    return { fee: Math.ceil(fee * 100) / 100, estimatedDays: 2, currency: 'LYD', available: true };
  }
}

// ─── Local Delivery Adapter ────────────────────────────────
class LocalDeliveryAdapter implements CarrierAdapter {
  carrierCode = 'local_delivery';

  async createShipment(params: CreateShipmentParams): Promise<CreateShipmentResult> {
    const trackingNumber = `LD${Date.now().toString().slice(-10)}`;
    
    return {
      success: true,
      trackingNumber,
      shippingCost: 3 + (params.weight || 1) * 1,
      estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      carrierData: { provider: 'local_delivery', simulated: true },
    };
  }

  async cancelShipment(): Promise<boolean> {
    return true;
  }

  async trackShipment(): Promise<TrackingResult> {
    return {
      status: 'out_for_delivery',
      location: 'في الطريق إليك',
      descriptionAr: 'السائق في الطريق',
      descriptionEn: 'Driver on the way',
      timestamp: new Date(),
      history: [
        { status: 'created', descriptionAr: 'تم تعيين سائق', descriptionEn: 'Driver assigned', timestamp: new Date(Date.now() - 60 * 60 * 1000) },
        { status: 'out_for_delivery', descriptionAr: 'في الطريق', descriptionEn: 'Out for delivery', timestamp: new Date() },
      ],
    };
  }

  async calculateRate(params: RateCalcParams): Promise<RateCalcResult> {
    return { fee: 3 + params.weight, estimatedDays: 1, currency: 'LYD', available: true };
  }
}

// ─── Manual Carrier Adapter (no API) ──────────────────────
class ManualCarrierAdapter implements CarrierAdapter {
  carrierCode = 'manual';

  async createShipment(): Promise<CreateShipmentResult> {
    return { success: false, error: 'Manual carrier - create shipment manually in admin' };
  }

  async cancelShipment(): Promise<boolean> {
    return false;
  }

  async trackShipment(): Promise<TrackingResult> {
    return {
      status: 'created',
      descriptionAr: 'لا تتوفر بيانات تتبع - شركة شحن يدوية',
      descriptionEn: 'No tracking data - manual carrier',
      timestamp: new Date(),
      history: [],
    };
  }

  async calculateRate(): Promise<RateCalcResult> {
    return { fee: 0, estimatedDays: 0, currency: 'LYD', available: false };
  }
}

// ─── Adapter Registry ──────────────────────────────────────
const adapters: Map<string, CarrierAdapter> = new Map([
  ['libya_post', new LibyaPostAdapter()],
  ['libya_express', new LibyaExpressAdapter()],
  ['local_delivery', new LocalDeliveryAdapter()],
  ['manual', new ManualCarrierAdapter()],
]);

export function getCarrierAdapter(carrierCode: string): CarrierAdapter {
  return adapters.get(carrierCode) || new ManualCarrierAdapter();
}

// ─── High-Level: Create Shipment for Order ─────────────────
export async function createShipmentForOrder(
  orderId: string,
  carrierId: string
): Promise<CreateShipmentResult> {
  // Fetch order with items and user
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: { select: { id: true, name: true, phone: true } },
      address: true,
    },
  });

  if (!order) {
    return { success: false, error: 'Order not found' };
  }

  // Fetch carrier
  const carrier = await db.shippingCarrier.findUnique({ where: { id: carrierId } });
  if (!carrier) {
    return { success: false, error: 'Carrier not found' };
  }

  const adapter = getCarrierAdapter(carrier.code);
  const serialized = serializeDecimal(carrier);

  // Build shipment params
  const shipmentParams: CreateShipmentParams = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    senderName: 'نبض المدينة',
    senderPhone: '+218XXXXXXXXX',
    senderAddress: 'طرابلس - المركز الرئيسي',
    senderCity: 'طرابلس',
    receiverName: order.user.name || 'عميل',
    receiverPhone: order.user.phone,
    receiverAddress: order.address?.address || 'غير محدد',
    receiverCity: order.address?.city || 'طرابلس',
    receiverArea: order.address?.area || undefined,
    weight: order.items.reduce((sum, item) => sum + item.quantity * 0.5, 0),
    codAmount: order.paymentMethod === 'cod' ? Number(order.total) : undefined,
    items: order.items.map(i => ({
      name: i.nameAr,
      quantity: i.quantity,
      price: Number(i.price),
    })),
    notes: order.notes || undefined,
  };

  // Check if carrier has real API integration
  let result: CreateShipmentResult;

  if (carrier.isIntegrated && carrier.apiEndpoint && carrier.apiKey) {
    // Real API integration
    try {
      const response = await fetch(carrier.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${carrier.apiKey}`,
        },
        body: JSON.stringify(shipmentParams),
      });

      if (!response.ok) {
        // Fallback to adapter
        result = await adapter.createShipment(shipmentParams);
      } else {
        const apiData = await response.json();
        result = {
          success: true,
          trackingNumber: apiData.trackingNumber,
          waybillNumber: apiData.waybillNumber,
          shippingCost: apiData.shippingCost,
          estimatedDelivery: apiData.estimatedDelivery ? new Date(apiData.estimatedDelivery) : undefined,
          carrierData: apiData,
        };
      }
    } catch {
      // Fallback to adapter on API error
      result = await adapter.createShipment(shipmentParams);
    }
  } else {
    // Use adapter (simulated or manual)
    result = await adapter.createShipment(shipmentParams);
  }

  if (!result.success) {
    return result;
  }

  // Create shipment record in database
  try {
    const shipment = await db.shipment.create({
      data: {
        orderId: order.id,
        carrierId: carrier.id,
        trackingNumber: result.trackingNumber || null,
        waybillNumber: result.waybillNumber || null,
        status: 'created',
        weight: shipmentParams.weight,
        shippingCost: result.shippingCost || Number(serialized.basePrice),
        codAmount: shipmentParams.codAmount || 0,
        estimatedDelivery: result.estimatedDelivery,
        carrierData: result.carrierData ? (result.carrierData as any) : undefined,
        lastSyncedAt: new Date(),
        logs: {
          create: {
            status: 'created',
            descriptionAr: 'تم إنشاء الشحنة',
            descriptionEn: 'Shipment created',
            occurredAt: new Date(),
          },
        },
      },
    });

    // Update order status to 'shipped'
    await db.order.update({
      where: { id: orderId },
      data: { status: 'shipped' },
    });

    await db.orderStatusLog.create({
      data: {
        orderId,
        status: 'shipped',
        note: `Shipment created via ${carrier.nameAr}. Tracking: ${result.trackingNumber}`,
      },
    });

    // Create notification
    try {
      await db.notification.create({
        data: {
          userId: order.userId,
          titleAr: 'تم شحن طلبك',
          titleEn: 'Order Shipped',
          bodyAr: `طلبك رقم ${order.orderNumber} تم شحنه عبر ${carrier.nameAr}${result.trackingNumber ? ` - رقم التتبع: ${result.trackingNumber}` : ''}`,
          bodyEn: `Your order #${order.orderNumber} has been shipped via ${carrier.nameEn}${result.trackingNumber ? ` - Tracking: ${result.trackingNumber}` : ''}`,
          type: 'order',
        },
      });
    } catch {
      // Non-critical
    }

    return { ...result, carrierData: { ...result.carrierData, shipmentId: shipment.id } };
  } catch (error) {
    console.error('[Shipping] Failed to save shipment:', error);
    return { ...result, error: 'Shipment created with carrier but failed to save locally' };
  }
}

// ─── Sync Shipment Tracking ────────────────────────────────
export async function syncShipmentTracking(shipmentId: string): Promise<TrackingResult | null> {
  const shipment = await db.shipment.findUnique({
    where: { id: shipmentId },
    include: { carrier: true, logs: { orderBy: { occurredAt: 'desc' }, take: 1 } },
  });

  if (!shipment || !shipment.trackingNumber) {
    return null;
  }

  const adapter = getCarrierAdapter(shipment.carrier.code);

  let tracking: TrackingResult;
  if (shipment.carrier.isIntegrated && shipment.carrier.apiEndpoint) {
    try {
      // Try real API first
      const response = await fetch(
        `${shipment.carrier.apiEndpoint}/track/${shipment.trackingNumber}`,
        {
          headers: { 'Authorization': `Bearer ${shipment.carrier.apiKey}` },
        }
      );
      if (response.ok) {
        tracking = await response.json();
      } else {
        tracking = await adapter.trackShipment(shipment.trackingNumber);
      }
    } catch {
      tracking = await adapter.trackShipment(shipment.trackingNumber);
    }
  } else {
    tracking = await adapter.trackShipment(shipment.trackingNumber);
  }

  // Save new tracking data to DB
  const latestLocalLog = shipment.logs[0];
  const newHistoryItems = tracking.history.filter(h =>
    !latestLocalLog || new Date(h.timestamp) > latestLocalLog.occurredAt
  );

  for (const item of newHistoryItems) {
    await db.shipmentLog.create({
      data: {
        shipmentId: shipment.id,
        status: item.status,
        location: item.location || null,
        descriptionAr: item.descriptionAr || null,
        descriptionEn: item.descriptionEn || null,
        occurredAt: new Date(item.timestamp),
      },
    }).catch(() => {});
  }

  // Update shipment status
  const statusMap: Record<string, string> = {
    picked_up: 'picked_up',
    in_transit: 'in_transit',
    out_for_delivery: 'out_for_delivery',
    delivered: 'delivered',
    failed: 'failed',
    returned: 'returned',
  };

  const mappedStatus = statusMap[tracking.status] || shipment.status;

  await db.shipment.update({
    where: { id: shipmentId },
    data: {
      status: mappedStatus,
      lastSyncedAt: new Date(),
      actualDelivery: mappedStatus === 'delivered' ? new Date() : undefined,
    },
  });

  // If delivered, update order status
  if (mappedStatus === 'delivered') {
    await db.order.update({
      where: { id: shipment.orderId },
      data: { status: 'delivered', deliveredAt: new Date() },
    }).catch(() => {});
  }

  return tracking;
}

// ─── Cancel Shipment ───────────────────────────────────────
export async function cancelShipmentWithCarrier(shipmentId: string, reason?: string): Promise<boolean> {
  const shipment = await db.shipment.findUnique({
    where: { id: shipmentId },
    include: { carrier: true },
  });

  if (!shipment) return false;

  const adapter = getCarrierAdapter(shipment.carrier.code);
  const cancelled = shipment.trackingNumber
    ? await adapter.cancelShipment(shipment.trackingNumber)
    : true;

  if (cancelled) {
    await db.shipment.update({
      where: { id: shipmentId },
      data: { status: 'returned', notes: reason || 'Cancelled' },
    });

    await db.shipmentLog.create({
      data: {
        shipmentId,
        status: 'returned',
        descriptionAr: `تم إلغاء الشحنة: ${reason || 'بدون سبب'}`,
        descriptionEn: `Shipment cancelled: ${reason || 'No reason'}`,
        occurredAt: new Date(),
      },
    }).catch(() => {});
  }

  return cancelled;
}

// ─── Get Carrier Rates ─────────────────────────────────────
export async function getCarrierRates(params: RateCalcParams): Promise<Array<RateCalcResult & { carrierId: string; carrierNameAr: string; carrierNameEn: string }>> {
  const carriers = await db.shippingCarrier.findMany({
    where: { isActive: true },
  });

  const results: Array<RateCalcResult & { carrierId: string; carrierNameAr: string; carrierNameEn: string }> = [];

  for (const carrier of carriers) {
    const adapter = getCarrierAdapter(carrier.code);
    try {
      const rate = await adapter.calculateRate(params);
      if (rate.available) {
        results.push({
          ...rate,
          carrierId: carrier.id,
          carrierNameAr: carrier.nameAr,
          carrierNameEn: carrier.nameEn,
        });
      }
    } catch {
      // Skip carrier on error
    }
  }

  return results.sort((a, b) => a.fee - b.fee);
}

// ─── Bulk Sync All Pending Shipments ───────────────────────
export async function bulkSyncTracking(): Promise<{ synced: number; failed: number }> {
  const pendingShipments = await db.shipment.findMany({
    where: {
      status: { in: ['created', 'picked_up', 'in_transit', 'out_for_delivery'] },
      trackingNumber: { not: null },
    },
    select: { id: true },
    take: 100,
  });

  let synced = 0;
  let failed = 0;

  for (const shipment of pendingShipments) {
    try {
      const result = await syncShipmentTracking(shipment.id);
      if (result) synced++;
      else failed++;
    } catch {
      failed++;
    }

    // Small delay between syncs
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return { synced, failed };
}
