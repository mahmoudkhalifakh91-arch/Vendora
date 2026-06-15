import { db } from '../../وصلها---خدمة-التوصيل-الذكية/services/firebase';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Creates an automated delivery job in Waslha Firestore for a Vendora order
 */
export async function syncVendoraOrderWithWaslha(vendoraOrder: any, customerInfo: any) {
  try {
    const trackingCode = vendoraOrder.id;
    const itemsDescription = vendoraOrder.items
      .map((i: any) => `${i.quantity}x ${i.product.nameAr || i.product.nameEn}`)
      .join(', ');

    // Realistic default coordinates for Menofia Governorate (Ashmoun region)
    // to match the driver's regional dashboard for real-time order acceptance
    const dist = parseFloat((2 + Math.random() * 4).toFixed(2)); // distance in km
    const deliveryPrice = Math.round(25 + dist * 5); // delivery fee in EGP
    const finalBillAmount = vendoraOrder.total + deliveryPrice;

    const orderData = {
      customerId: 'vendora-customer',
      customerPhone: customerInfo.phone || '01012345678',
      category: 'PARCEL',
      pickup: {
        address: 'مستودع فيندورا الرئيسي - أشمون 🏢',
        lat: 30.4721,
        lng: 31.0022,
        villageName: 'أشمون'
      },
      dropoff: {
        address: customerInfo.address || 'العنوان المحدد من العميل',
        lat: 30.4785,
        lng: 31.0089,
        villageName: customerInfo.city || 'أشمون'
      },
      status: 'WAITING_FOR_OFFERS', // Active status for drivers to see and bid on
      createdAt: Date.now(),
      updatedAt: Date.now(),
      requestedVehicleType: 'MOTORCYCLE',
      price: finalBillAmount,
      distance: dist,
      commission: parseFloat((deliveryPrice * 0.15).toFixed(2)),
      operatorCut: parseFloat((deliveryPrice * 0.05).toFixed(2)),
      driverCut: parseFloat((deliveryPrice * 0.80).toFixed(2)),
      operatorId: 'op_monofia_main',
      zoneId: 'zone_monofia_main',
      paymentMethod: vendoraOrder.paymentMethod === 'cod' ? 'CASH' : 'WALLET',
      pickupNotes: `استلام طرد فيندورا: ${trackingCode}`,
      notes: `المحتويات: ${itemsDescription}`,
      vendoraOrderId: trackingCode // Linking foreign key back to Vendora
    };

    const docRef = await addDoc(collection(db, "orders"), orderData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating synced Waslha order:", error);
    return null;
  }
}
