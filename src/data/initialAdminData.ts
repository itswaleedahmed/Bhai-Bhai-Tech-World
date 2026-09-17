import { WhatsAppInquiry, VideoInspectionRequest, TradeInSubmission, StoreConfig } from '../types';

export const INITIAL_STORE_CONFIG: StoreConfig = {
  storeName: 'Bhai Bhai Tech World',
  hotlinePhone: '923216886475',
  hotlineDisplay: '+92 321 6886475',
  email: 'sales@bhaibhaitechworld.pk',
  shopAddress: 'Shop No. 83, Stadium Park Commercial Area, Sheikhupura, Punjab',
  shopHours: 'Mon - Sat: 11:00 AM – 10:30 PM | Sunday: 3:00 PM – 10:00 PM',
  announcementBannerText: '🔥 Sheikhupura & Lahore Same-Day Delivery available! 15-Sec Video Inspection before dispatch nationwide.',
  announcementBannerActive: true,
  freeDeliveryThresholdPKR: 50000,
  standardDeliveryFeePKR: 350,
  assemblyFeePKR: 0, // Complimentary
  isStoreOpen: true,
  tradeInMarginPercentage: 18,
  adminPin: 'bhaibhai83',
};

export const INITIAL_INQUIRIES: WhatsAppInquiry[] = [
  {
    id: 'INQ-2026-9041',
    customerName: 'Muhammad Hamza',
    customerPhone: '+92 300 4812390',
    customerCity: 'Sheikhupura (Housing Colony)',
    type: 'pc_builder_quote',
    summary: 'Custom RTX 4070 Super + Ryzen 7 7800X3D Competitive 240Hz Rig Quotation',
    totalAmountPKR: 385000,
    status: 'new',
    date: '2026-09-17 09:45 AM',
    itemsList: [
      'AMD Ryzen 7 7800X3D Processor',
      'ZOTAC Gaming GeForce RTX 4070 SUPER Trinity Black 12GB',
      'MSI MAG B650 TOMAHAWK WIFI AM5 Motherboard',
      'Corsair Vengeance RGB 32GB (2x16GB) DDR5-6000MHz CL30',
      'Kingston KC3000 2TB PCIe 4.0 NVMe M.2 SSD',
      'Corsair RM850e 850W 80+ Gold Fully Modular PSU',
      'DeepCool LT720 360mm Liquid CPU Cooler ARGB',
      'Lian Li LANCOOL 216 RGB Mid-Tower Case'
    ],
    notes: 'Customer wants to pick up from Sheikhupura shop or same-day Lahore delivery. Inquired about cash discount.'
  },
  {
    id: 'INQ-2026-9038',
    customerName: 'Bilal Tariq',
    customerPhone: '+92 321 7891204',
    customerCity: 'Lahore (DHA Phase 6)',
    type: 'upgrade_consultation',
    summary: 'Upgrading from GTX 1660 Super to RTX 4060 with 550W PSU check',
    totalAmountPKR: 98000,
    status: 'contacted',
    date: '2026-09-16 06:15 PM',
    itemsList: ['Gigabyte GeForce RTX 4060 WINDFORCE OC 8GB'],
    notes: 'Verified his PSU has 8-pin PCIe. Advised CPU Ryzen 5 3600 has minor 9% bottleneck, recommended future 5700X3D.'
  },
  {
    id: 'INQ-2026-9032',
    customerName: 'Usman Ali',
    customerPhone: '+92 333 5519821',
    customerCity: 'Faisalabad',
    type: 'direct_product',
    summary: 'Sony PlayStation 5 Pro 2TB Console official box seal inquiry',
    totalAmountPKR: 245000,
    status: 'quoted',
    date: '2026-09-16 02:30 PM',
    itemsList: ['Sony PlayStation 5 Pro 2TB Console'],
    notes: 'Requested video inspection before booking TCS express parcel.'
  },
  {
    id: 'INQ-2026-9019',
    customerName: 'Dr. Shahzad Farooq',
    customerPhone: '+92 345 8821045',
    customerCity: 'Gujranwala',
    type: 'pc_builder_quote',
    summary: 'Deep Learning & 4K Video Editing Workstation (Core i9-14900K + RTX 4080 Super)',
    totalAmountPKR: 620000,
    status: 'confirmed',
    date: '2026-09-15 11:20 AM',
    itemsList: [
      'Intel Core i9-14900K 24-Core Processor',
      'ASUS TUF Gaming GeForce RTX 4080 SUPER 16GB',
      'ASUS ROG STRIX Z790-F GAMING WIFI II Motherboard',
      'G.Skill Ripjaws S5 64GB (2x32GB) DDR5-6000MHz',
      'Samsung 990 PRO 2TB NVMe SSD with Heatsink',
      'Corsair RM1000x Shift 1000W 80+ Gold PSU'
    ],
    notes: 'Bank transfer received via Meezan Bank. Assembly scheduled for technician.'
  }
];

export const INITIAL_VIDEO_INSPECTIONS: VideoInspectionRequest[] = [
  {
    id: 'VIR-2026-401',
    productId: 'prod-gpu-rtx-4070-super',
    productName: 'ZOTAC Gaming GeForce RTX 4070 SUPER Trinity Black 12GB',
    productImage: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
    productPricePKR: 215000,
    customerName: 'Zain Ul Abideen',
    customerPhone: '+92 312 4589211',
    customerCity: 'Islamabad (Sector F-10)',
    requestDate: '2026-09-17 10:15 AM',
    status: 'pending',
    serialNumber: 'SN-ZT4070S-994821-PK',
    assignedStaff: 'Ali Raza (Warehouse Tech)',
    videoNotes: 'Check unbroken yellow hologram tape on both outer flaps. Show barcode label matching invoice.'
  },
  {
    id: 'VIR-2026-398',
    productId: 'prod-ps5-pro',
    productName: 'Sony PlayStation 5 Pro 2TB Console',
    productImage: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80',
    productPricePKR: 245000,
    customerName: 'Khurram Shehzad',
    customerPhone: '+92 322 9014522',
    customerCity: 'Sheikhupura',
    requestDate: '2026-09-16 04:45 PM',
    status: 'recorded',
    serialNumber: 'CFI-7000B-0849204',
    assignedStaff: 'Waleed Ahmed',
    videoNotes: '15-second clip recorded on iPhone in 4K 60fps showing serial bar and factory seal.'
  },
  {
    id: 'VIR-2026-395',
    productId: 'prod-gpu-rx-7800-xt',
    productName: 'Sapphire PULSE AMD Radeon RX 7800 XT 16GB GDDR6',
    productImage: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80',
    productPricePKR: 172000,
    customerName: 'Danyal Malik',
    customerPhone: '+92 301 6451299',
    customerCity: 'Multan',
    requestDate: '2026-09-15 01:10 PM',
    status: 'sent_via_whatsapp',
    serialNumber: 'SPH-7800XT-440192',
    assignedStaff: 'Ali Raza',
    videoNotes: 'WhatsApp video dispatched, customer replied OK and authorized parcel dispatch.'
  }
];

export const INITIAL_TRADE_INS: TradeInSubmission[] = [
  {
    id: 'TI-2026-102',
    oldComponentName: 'MSI GeForce GTX 1660 Super Ventus XS 6GB',
    category: 'GPU',
    condition: 'good',
    estimatedValuePKR: 35000,
    offeredValuePKR: 36000,
    targetProductName: 'ZOTAC Gaming GeForce RTX 4060 Twin Edge 8GB',
    targetPricePKR: 98000,
    customerName: 'Adeel Murtaza',
    customerPhone: '+92 324 7721890',
    customerCity: 'Sheikhupura',
    submissionDate: '2026-09-17 08:30 AM',
    status: 'physical_inspection',
    adminNotes: 'Customer brought card to Sheikhupura shop. FurMark stress test running (max 69C, clean fans, original seal intact).'
  },
  {
    id: 'TI-2026-099',
    oldComponentName: 'Sony PlayStation 4 Slim 1TB (with 2 controllers)',
    category: 'Console',
    condition: 'mint',
    estimatedValuePKR: 52000,
    offeredValuePKR: 52000,
    targetProductName: 'Sony PlayStation 5 Pro 2TB Console',
    targetPricePKR: 245000,
    customerName: 'Hassan Nabeel',
    customerPhone: '+92 300 9182341',
    customerCity: 'Lahore',
    submissionDate: '2026-09-16 11:15 AM',
    status: 'credit_approved',
    adminNotes: 'Software version 11.00, immaculate condition. Rs 52,000 credit coupon code issued towards PS5 Pro.'
  },
  {
    id: 'TI-2026-091',
    oldComponentName: 'Sapphire Nitro+ RX 580 8GB',
    category: 'GPU',
    condition: 'fair',
    estimatedValuePKR: 21000,
    offeredValuePKR: 20000,
    targetProductName: 'Sapphire PULSE AMD Radeon RX 7600 8GB',
    targetPricePKR: 85000,
    customerName: 'Rehan Asghar',
    customerPhone: '+92 332 4410982',
    customerCity: 'Faisalabad',
    submissionDate: '2026-09-14 03:20 PM',
    status: 'deal_completed',
    adminNotes: 'Trade-in completed via courier. Net remaining PKR 65,000 received via COD.'
  }
];
