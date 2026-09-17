export type CategorySlug =
  | 'gaming-consoles'
  | 'graphics-cards'
  | 'printers'
  | 'motherboards'
  | 'vr-headsets'
  | 'processors'
  | 'ram'
  | 'storage'
  | 'monitors'
  | 'laptops'
  | 'keyboards'
  | 'mice'
  | 'headphones'
  | 'power-supplies'
  | 'pc-cases'
  | 'controllers'
  | 'webcams-mics'
  | 'capture-cards'
  | 'cooling-pads'
  | 'monitor-arms'
  | 'gaming-chairs'
  | 'mouse-bungees'
  | 'rgb-lighting'
  | 'thermal-paste'
  | 'networking'
  | 'cables-adapters'
  | 'power-banks'
  | 'usb-storage';

export interface Category {
  id: string;
  name: string;
  slug: CategorySlug;
  iconName: string;
  image: string;
  count: number;
  isPromoted: boolean; // 5 curated categories for homepage
  description: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  brand: string;
  pricePKR: number;
  originalPricePKR?: number;
  inStock: boolean;
  stockCount: number;
  isNew?: boolean;
  isRestocked?: boolean;
  restockDate?: string;
  isDeal?: boolean;
  discountPercent?: number;
  tier: 'Entry' | 'Mid' | 'High' | 'Ultra';
  image: string;
  rating: number;
  reviewsCount: number;
  specs: Record<string, string>;
  warranty: string;
  description: string;
  componentType?: 'cpu' | 'gpu' | 'motherboard' | 'ram' | 'storage' | 'psu' | 'case' | 'cooler';
}

export type ComponentType =
  | 'motherboard'
  | 'cpu'
  | 'ram'
  | 'gpu'
  | 'storage'
  | 'psu'
  | 'case'
  | 'cooler';

export interface ComponentSpecs {
  socket?: string; // AM5, AM4, LGA1700, LGA1200, LGA1851, AM3+
  chipset?: string;
  formFactor?: 'ATX' | 'Micro-ATX' | 'Mini-ITX' | 'E-ATX';
  ramType?: 'DDR5' | 'DDR4' | 'DDR3';
  maxRamSpeed?: string;
  tdp?: number; // Watts
  vram?: string; // 8GB, 12GB, 16GB, 24GB etc.
  lengthMm?: number; // GPU length
  wattage?: number; // PSU wattage
  rating?: string; // 80+ Gold, Bronze, etc.
  coolerType?: 'Air' | '240mm AIO' | '360mm AIO';
  cores?: string;
  threads?: string;
  boostClock?: string;
}

export interface Component {
  id: string;
  name: string;
  type: ComponentType;
  brand: string;
  pricePKR: number;
  perfScore: number; // 0-100 relative index
  tier: 'Entry' | 'Mid' | 'High' | 'Ultra';
  specs: ComponentSpecs;
  inStock: boolean;
  image: string;
  productId?: string;
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  cover: string;
  genre: string;
  releaseYear: number;
  demandLevel: 'low' | 'medium' | 'high' | 'ultra';
  cpuMultiplier: number; // Sensitivity factor
  gpuMultiplier: number;
  isUpcoming?: boolean;
  bannerNote?: string;
}

export interface BenchmarkEstimate {
  cpu: Component;
  gpu: Component;
  game: Game;
  resolution: '1080p' | '1440p' | '4K';
  avgFps: number;
  onePercentLow: number;
  preset: 'Low' | 'Medium' | 'High' | 'Ultra';
  verdict: 'Struggles' | 'Playable' | 'Great' | 'Excellent';
  verdictColor: string;
  bottleneck: 'CPU' | 'GPU' | 'Balanced';
  res1080: number;
  res1440: number;
  res4k: number;
  upgradeSuggestion?: {
    type: 'CPU' | 'GPU';
    name: string;
    pricePKR: number;
    gainFps: number;
    productId?: string;
  };
}

export interface PCBuildSelection {
  motherboard?: Component;
  cpu?: Component;
  ram?: Component;
  gpu?: Component;
  storage?: Component;
  psu?: Component;
  case?: Component;
  cooler?: Component;
}

export interface CompatibilityCheck {
  isCompatible: boolean;
  totalTdp: number;
  recommendedPsuWattage: number;
  issues: string[];
  warnings: string[];
  passedChecks: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotalPKR: number;
  shippingPKR: number;
  totalPKR: number;
  customerName: string;
  customerPhone: string;
  city: string;
  address: string;
  paymentMethod: 'cod' | 'bank_transfer' | 'whatsapp';
  status: 'Placed' | 'Confirmed' | 'Assembled' | 'Shipped' | 'Delivered';
  trackingNumber?: string;
  courier?: string;
  notes?: string;
}

export interface Complaint {
  id: string;
  name: string;
  phone: string;
  email?: string;
  orderRef?: string;
  subject: string;
  message: string;
  date: string;
  status: 'Pending' | 'Reviewing' | 'Resolved';
}

export interface CommunityBuild {
  id: string;
  name: string;
  tagline: string;
  budgetTier: 'Under 100k' | '100k - 200k' | '200k - 350k' | '350k+ Ultra';
  totalPKR: number;
  fpsCyberpunk: number;
  fpsWarzone: number;
  description: string;
  components: PCBuildSelection;
  image: string;
  featuredBadge?: string;
}

export interface Review {
  id: string;
  productId: string;
  authorName: string;
  authorCity: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedBuyer: boolean;
  upvotes: number;
}

export interface WhatsAppInquiry {
  id: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  city?: string;
  type: 'pc_builder_quote' | 'direct_product' | 'general_question' | 'upgrade_consultation' | string;
  summary: string;
  details?: string;
  totalAmountPKR?: number;
  quotedTotalPKR?: number;
  status: 'new' | 'contacted' | 'quoted' | 'confirmed' | 'closed' | 'converted' | 'cancelled';
  date: string;
  itemsList?: string[];
  notes?: string;
}

export interface VideoInspectionRequest {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  productPricePKR?: number;
  customerName?: string;
  customerPhone: string;
  customerCity: string;
  requestDate: string;
  status: 'pending' | 'recorded' | 'video_recorded' | 'sent_via_whatsapp' | 'sent_to_customer' | 'approved' | 'approved_by_customer' | 'dispatched';
  serialNumber?: string;
  assignedStaff?: string;
  videoNotes?: string;
  notes?: string;
  videoUrl?: string;
  durationSec?: number;
}

export interface TradeInSubmission {
  id: string;
  oldComponentName: string;
  category: 'GPU' | 'CPU' | 'Console' | 'Motherboard' | string;
  condition: 'mint' | 'good' | 'fair' | string;
  estimatedValuePKR: number;
  offeredValuePKR?: number;
  targetProductName?: string;
  targetPricePKR?: number;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  submissionDate: string;
  status: 'pending_review' | 'counter_offered' | 'physical_inspection' | 'approved' | 'credit_approved' | 'completed' | 'deal_completed' | 'rejected' | 'declined';
  adminNotes?: string;
}

export interface StoreConfig {
  storeName: string;
  hotlinePhone: string;
  hotlineDisplay: string;
  primaryWhatsApp?: string;
  secondaryWhatsApp?: string;
  email: string;
  shopAddress: string;
  shopHours: string;
  timingsWeekdays?: string;
  timingsSunday?: string;
  directionsLandmark?: string;
  announcementBannerText: string;
  announcementBannerActive: boolean;
  freeDeliveryThresholdPKR: number;
  standardDeliveryFeePKR: number;
  assemblyFeePKR: number;
  isStoreOpen: boolean;
  tradeInMarginPercentage: number;
  adminPin?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  shippingCity?: string;
  shippingAddress?: string;
  role: 'customer' | 'admin';
  createdAt: string;
}
