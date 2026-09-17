import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, SUPER_ADMIN_EMAIL, handleFirestoreError, OperationType } from '../lib/firebase';
import { InventoryService } from '../services/inventoryService';
import { authService } from '../services/authService';
import {
  Product,
  CartItem,
  PCBuildSelection,
  Component,
  ComponentType,
  Order,
  Complaint,
  WhatsAppInquiry,
  VideoInspectionRequest,
  TradeInSubmission,
  StoreConfig,
  UserProfile,
} from '../types';
import { PRODUCTS } from '../data/products';
import { COMPONENTS } from '../data/components';
import {
  INITIAL_STORE_CONFIG,
  INITIAL_INQUIRIES,
  INITIAL_VIDEO_INSPECTIONS,
  INITIAL_TRADE_INS,
} from '../data/initialAdminData';

export type NavigationPage =
  | 'home'
  | 'shop'
  | 'pc-builder'
  | 'fps-estimator'
  | 'compare'
  | 'community-builds'
  | 'services'
  | 'price-watch'
  | 'recently-restocked'
  | 'about'
  | 'faq'
  | 'terms'
  | 'warranty-policy'
  | 'return-policy'
  | 'privacy-policy'
  | 'complaints'
  | 'my-account'
  | 'store-locator'
  | 'admin';

export interface PriceAlert {
  productId: string;
  productName: string;
  email: string;
  currentPricePKR: number;
  targetPricePKR?: number;
  date: string;
}

interface AppContextType {
  // Navigation
  currentPage: NavigationPage;
  setCurrentPage: (page: NavigationPage) => void;
  selectedCategorySlug: string | null;
  setSelectedCategorySlug: (slug: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartItemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  // Compare
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  toggleCompare: (product: Product) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
  isCompareOpen: boolean;
  setIsCompareOpen: (open: boolean) => void;

  // Quick View Modal
  quickViewProduct: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;

  // Price Drop Alert Modal
  priceAlertProduct: Product | null;
  openPriceAlert: (product: Product) => void;
  closePriceAlert: () => void;
  priceAlerts: PriceAlert[];
  addPriceAlert: (product: Product, email: string, targetPricePKR?: number) => void;
  removePriceAlert: (productId: string) => void;
  hasPriceAlert: (productId: string) => boolean;

  // PC Builder
  activeBuild: PCBuildSelection;
  setBuildComponent: (type: ComponentType, component: Component) => void;
  removeBuildComponent: (type: ComponentType) => void;
  resetBuild: () => void;
  loadPresetBuild: (preset: PCBuildSelection) => void;
  buildTotalPKR: number;

  // Product detail modal
  activeProductModal: Product | null;
  openProductModal: (product: Product) => void;
  closeProductModal: () => void;

  // Orders
  orders: Order[];
  placeOrder: (orderInfo: {
    customerName: string;
    customerPhone: string;
    city: string;
    address: string;
    paymentMethod: 'cod' | 'bank_transfer' | 'whatsapp';
    notes?: string;
  }) => Order;
  trackOrder: (orderId: string) => Order | undefined;

  // Complaints
  complaints: Complaint[];
  submitComplaint: (data: {
    name: string;
    phone: string;
    email?: string;
    orderRef?: string;
    subject: string;
    message: string;
  }) => Complaint;

  // Toast notifications
  toast: string | null;
  showToast: (message: string) => void;

  // Sound effects toggle
  isSoundEnabled: boolean;
  toggleSound: () => void;

  // FPS Estimator preselects
  fpsPreselect: { cpuId?: string; gpuId?: string; gameSlug?: string };
  setFpsPreselect: React.Dispatch<React.SetStateAction<{ cpuId?: string; gpuId?: string; gameSlug?: string }>>;

  // Trade-In & Upgrade Estimator Modal
  isTradeInOpen: boolean;
  openTradeIn: (targetProduct?: Product | null) => void;
  closeTradeIn: () => void;
  tradeInTargetProduct: Product | null;

  // Instant WhatsApp Video Inspection Modal
  videoInspectionProduct: Product | null;
  openVideoInspection: (product: Product) => void;
  closeVideoInspection: () => void;

  // Admin: Inventory & Pricing Management
  products: Product[];
  updateProduct: (updated: Product) => void;
  updateProductPrice: (productId: string, pricePKR: number) => Promise<void>;
  updateProductStock: (productId: string, inStock: boolean, stockCount: number) => Promise<void>;
  addProduct: (newProd: Product) => void;
  deleteProduct: (id: string) => void;
  resetProductsToDefault: () => void;
  syncInventoryToFirestore: () => Promise<number>;
  isFirestoreSyncing: boolean;

  // Admin: WhatsApp Inquiries & Orders Log
  inquiries: WhatsAppInquiry[];
  updateInquiryStatus: (id: string, status: WhatsAppInquiry['status'], notes?: string) => void;
  deleteInquiry: (id: string) => void;
  addInquiry: (inquiry: Omit<WhatsAppInquiry, 'id' | 'date'>) => void;
  updateOrderStatus: (id: string, status: Order['status'], trackingNumber?: string, courier?: string) => void;

  // Admin: Video Inspection Queue
  videoInspections: VideoInspectionRequest[];
  updateVideoInspection: (id: string, updates: Partial<VideoInspectionRequest>) => void;
  addVideoInspectionRequest: (req: Omit<VideoInspectionRequest, 'id' | 'requestDate' | 'status'>) => void;

  // Admin: Trade-In Submissions
  tradeIns: TradeInSubmission[];
  updateTradeIn: (id: string, updates: Partial<TradeInSubmission>) => void;
  addTradeInSubmission: (sub: Omit<TradeInSubmission, 'id' | 'submissionDate' | 'status'>) => void;

  // Admin: Store Configuration
  storeConfig: StoreConfig;
  updateStoreConfig: (updates: Partial<StoreConfig>) => void;

  // Firebase User Authentication & Accounts
  user: User | null;
  userProfile: UserProfile | null;
  isAuthLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('home');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Firebase Auth State
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Cart state with localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('bhaibhai_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bhaibhai_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bhaibhai_wishlist');
      return saved ? JSON.parse(saved) : ['prod-gpu-rtx-4070-super', 'prod-ps5-pro'];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bhaibhai_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Compare list
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Active build
  const [activeBuild, setActiveBuild] = useState<PCBuildSelection>(() => ({
    cpu: COMPONENTS.find((c) => c.id === 'cpu-ryzen-5600'),
    motherboard: COMPONENTS.find((c) => c.id === 'mb-b550m'),
    ram: COMPONENTS.find((c) => c.id === 'ram-ddr4-16g'),
    gpu: COMPONENTS.find((c) => c.id === 'gpu-rtx-4060'),
    storage: COMPONENTS.find((c) => c.id === 'storage-nvme-500g'),
    psu: COMPONENTS.find((c) => c.id === 'psu-750w'),
    case: COMPONENTS.find((c) => c.id === 'case-thunder-mesh'),
    cooler: COMPONENTS.find((c) => c.id === 'cooler-peerless'),
  }));

  // Product modal
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);

  // Quick View modal
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Price Drop Alert modal & persistent storage
  const [priceAlertProduct, setPriceAlertProduct] = useState<Product | null>(null);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem('bhaibhai_price_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bhaibhai_price_alerts', JSON.stringify(priceAlerts));
    } catch (e) {
      console.error(e);
    }
  }, [priceAlerts]);

  // Orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('bhaibhai_orders');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'BBT-89241',
        date: '2026-09-12 15:40',
        items: [
          { product: PRODUCTS[1], quantity: 1 },
          { product: PRODUCTS[10], quantity: 1 },
        ],
        subtotalPKR: 212000,
        shippingPKR: 0,
        totalPKR: 212000,
        customerName: 'Ahmad Raza',
        customerPhone: '+92 300 8472911',
        city: 'Lahore',
        address: 'House 42, Sector B, Bahria Town',
        paymentMethod: 'cod',
        status: 'Shipped',
        trackingNumber: 'TCS-9028472199',
        courier: 'TCS Express Nationwide',
        notes: 'Handle with extreme care, fragile gaming components.',
      },
      {
        id: 'BBT-78104',
        date: '2026-08-28 12:15',
        items: [
          { product: PRODUCTS[4] || PRODUCTS[0], quantity: 1 },
          { product: PRODUCTS[7] || PRODUCTS[2], quantity: 2 },
        ],
        subtotalPKR: 54000,
        shippingPKR: 0,
        totalPKR: 54000,
        customerName: 'Ahmad Raza',
        customerPhone: '+92 300 8472911',
        city: 'Lahore',
        address: 'House 42, Sector B, Bahria Town',
        paymentMethod: 'bank_transfer',
        status: 'Delivered',
        trackingNumber: 'TCS-8840192341',
        courier: 'TCS Air Express',
        notes: 'Delivered safely and inspected on bench.',
      },
      {
        id: 'BBT-64219',
        date: '2026-07-15 17:30',
        items: [
          { product: PRODUCTS[3] || PRODUCTS[0], quantity: 1 },
        ],
        subtotalPKR: 28500,
        shippingPKR: 0,
        totalPKR: 28500,
        customerName: 'Ahmad Raza',
        customerPhone: '+92 300 8472911',
        city: 'Lahore',
        address: 'House 42, Sector B, Bahria Town',
        paymentMethod: 'cod',
        status: 'Delivered',
        trackingNumber: 'LEO-44910283',
        courier: 'Leopards Courier',
        notes: 'Verified packaging and warranty seal intact.',
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('bhaibhai_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  // Complaints
  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: 'CMP-102',
      name: 'Mohammad Farooq',
      phone: '+92 321 8847211',
      email: 'farooq.tech@gmail.com',
      orderRef: 'BBT-89241',
      subject: 'Courier verification check',
      message: 'Can you please confirm if the rider can deliver after 5 PM? Thank you.',
      date: '2026-09-14 11:20',
      status: 'Resolved',
    },
  ]);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast((prev) => (prev === message ? null : prev));
    }, 3500);
  };

  // Firebase Authentication & User State Synchronization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          const isTargetSuperAdmin = currentUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            if (isTargetSuperAdmin && data.role !== 'admin') {
              await updateDoc(userDocRef, { role: 'admin' });
              data.role = 'admin';
            }
            setUserProfile(data);
          } else {
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Customer'),
              photoURL: currentUser.photoURL || undefined,
              role: isTargetSuperAdmin ? 'admin' : 'customer',
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }

          // If designated super admin, also record in admins collection
          if (isTargetSuperAdmin) {
            const adminDocRef = doc(db, 'admins', currentUser.uid);
            await setDoc(
              adminDocRef,
              {
                email: currentUser.email,
                role: 'super_admin_owner',
                assignedAt: new Date().toISOString(),
              },
              { merge: true }
            );
          }
        } catch (error) {
          console.warn('Error fetching or updating user profile:', error);
          // Fallback local profile
          setUserProfile({
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Customer',
            photoURL: currentUser.photoURL || undefined,
            role: currentUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'customer',
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setUserProfile(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isSuperAdmin = authService.isAuthorized(user);
  const isAdmin = isSuperAdmin; // Strict restriction: only itswaleedahmed@gmail.com is admin

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const email = res.user.email?.toLowerCase();
      if (email === SUPER_ADMIN_EMAIL.toLowerCase()) {
        showToast(`Store Owner Verified (${email})! Full Admin Desk unlocked.`);
      } else {
        showToast(`Welcome back, ${res.user.displayName || 'Customer'}!`);
      }
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      showToast(`Login failed: ${err.message || 'Please try again'}`);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      showToast('You have been signed out.');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, updates);
      setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
      showToast('Profile updated.');
    } catch (err) {
      console.error('Update profile error:', err);
      showToast('Failed to update profile.');
    }
  };

  // FPS Preselects
  const [fpsPreselect, setFpsPreselect] = useState<{
    cpuId?: string;
    gpuId?: string;
    gameSlug?: string;
  }>({
    cpuId: 'cpu-ryzen-5600',
    gpuId: 'gpu-rtx-4060',
    gameSlug: 'gta-6',
  });

  // Trade-In & Upgrade Estimator Modal state
  const [isTradeInOpen, setIsTradeInOpen] = useState(false);
  const [tradeInTargetProduct, setTradeInTargetProduct] = useState<Product | null>(null);

  const openTradeIn = (targetProduct?: Product | null) => {
    setTradeInTargetProduct(targetProduct || null);
    setIsTradeInOpen(true);
  };

  const closeTradeIn = () => {
    setIsTradeInOpen(false);
    setTradeInTargetProduct(null);
  };

  // Instant WhatsApp Video Inspection Request Modal state
  const [videoInspectionProduct, setVideoInspectionProduct] = useState<Product | null>(null);

  const openVideoInspection = (product: Product) => {
    setVideoInspectionProduct(product);
  };

  const closeVideoInspection = () => {
    setVideoInspectionProduct(null);
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added "${product.name}" to cart!`);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart.');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.pricePKR * item.quantity,
    0
  );
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Wishlist operations
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from wishlist');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to wishlist ❤️');
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  // Compare operations (max 3 items for side-by-side technical specification table)
  const addToCompare = (product: Product) => {
    setCompareList((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      if (prev.length >= 3) {
        showToast('You can select up to 3 items to compare side-by-side');
        return prev;
      }
      showToast(`Added "${product.name}" to comparison (${prev.length + 1}/3)`);
      return [...prev, product];
    });
    setIsCompareOpen(true);
  };

  const removeFromCompare = (productId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
  };

  const toggleCompare = (product: Product) => {
    setCompareList((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        showToast(`Removed "${product.name}" from comparison`);
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 3) {
        showToast('Comparison limit reached (max 3 items). Remove an item to add another.');
        return prev;
      }
      showToast(`Added "${product.name}" to comparison (${prev.length + 1}/3)`);
      return [...prev, product];
    });
  };

  const isInCompare = (productId: string) => compareList.some((p) => p.id === productId);

  const clearCompare = () => {
    setCompareList([]);
    setIsCompareOpen(false);
  };

  // PC Builder operations
  const setBuildComponent = (type: ComponentType, component: Component) => {
    setActiveBuild((prev) => ({
      ...prev,
      [type]: component,
    }));
    showToast(`Selected ${component.name}`);
  };

  const removeBuildComponent = (type: ComponentType) => {
    setActiveBuild((prev) => {
      const next = { ...prev };
      delete next[type];
      return next;
    });
  };

  const resetBuild = () => {
    setActiveBuild({});
    showToast('PC Builder reset to blank workbench');
  };

  const loadPresetBuild = (preset: PCBuildSelection) => {
    setActiveBuild(preset);
    setCurrentPage('pc-builder');
    showToast('Loaded custom preset into PC Builder!');
  };

  const buildTotalPKR = (Object.values(activeBuild) as (Component | undefined)[]).reduce((sum, comp) => {
    return sum + (comp ? comp.pricePKR : 0);
  }, 0);

  // Product detail modal
  const openProductModal = (product: Product) => {
    setActiveProductModal(product);
  };
  const closeProductModal = () => {
    setActiveProductModal(null);
  };

  // Quick View modal
  const openQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };
  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  // Price Drop Alert modal
  const openPriceAlert = (product: Product) => {
    setPriceAlertProduct(product);
  };
  const closePriceAlert = () => {
    setPriceAlertProduct(null);
  };
  const addPriceAlert = (product: Product, email: string, targetPricePKR?: number) => {
    const newAlert: PriceAlert = {
      productId: product.id,
      productName: product.name,
      email,
      currentPricePKR: product.pricePKR,
      targetPricePKR,
      date: new Date().toLocaleDateString(),
    };
    setPriceAlerts((prev) => [...prev.filter((a) => a.productId !== product.id), newAlert]);
    showToast(`Price drop alert set for ${email}!`);
  };
  const removePriceAlert = (productId: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.productId !== productId));
    showToast('Price alert removed.');
  };
  const hasPriceAlert = (productId: string) => priceAlerts.some((a) => a.productId === productId);

  // Order placement
  const placeOrder = (info: {
    customerName: string;
    customerPhone: string;
    city: string;
    address: string;
    paymentMethod: 'cod' | 'bank_transfer' | 'whatsapp';
    notes?: string;
  }): Order => {
    const randomId = `BBT-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = {
      id: randomId,
      date: new Date().toLocaleString(),
      items: [...cart],
      subtotalPKR: cartSubtotal,
      shippingPKR: 0, // Free nationwide delivery
      totalPKR: cartSubtotal,
      customerName: info.customerName,
      customerPhone: info.customerPhone,
      city: info.city,
      address: info.address,
      paymentMethod: info.paymentMethod,
      status: 'Placed',
      notes: info.notes,
      courier: 'TCS Express Pakistan',
    };
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const trackOrder = (orderId: string) => {
    const clean = orderId.trim().toUpperCase();
    return orders.find(
      (o) =>
        o.id.toUpperCase() === clean ||
        o.trackingNumber?.toUpperCase() === clean ||
        o.customerPhone.includes(clean)
    );
  };

  // Complaint submission
  const submitComplaint = (data: {
    name: string;
    phone: string;
    email?: string;
    orderRef?: string;
    subject: string;
    message: string;
  }): Complaint => {
    const newCmp: Complaint = {
      id: `CMP-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name,
      phone: data.phone,
      email: data.email,
      orderRef: data.orderRef,
      subject: data.subject,
      message: data.message,
      date: new Date().toLocaleString(),
      status: 'Pending',
    };
    setComplaints((prev) => [newCmp, ...prev]);
    return newCmp;
  };

  // Sound toggle state
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('bhaibhai_sound_enabled');
      return saved !== '0';
    } catch {
      return true;
    }
  });

  const toggleSound = () => {
    setIsSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('bhaibhai_sound_enabled', next ? '1' : '0');
      } catch (e) {
        console.error(e);
      }
      showToast(next ? 'Sound effects enabled' : 'Sound effects muted');
      return next;
    });
  };

  // Products / Inventory state with localStorage and Firestore real-time sync
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('bhaibhai_admin_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return PRODUCTS;
  });

  const [isFirestoreSyncing, setIsFirestoreSyncing] = useState(false);

  // Real-time Firestore Live Inventory Sync
  useEffect(() => {
    const unsubscribe = InventoryService.subscribe(
      (liveProducts) => {
        if (liveProducts && liveProducts.length > 0) {
          setProducts(liveProducts);
        }
      },
      (err) => {
        console.warn('Real-time Firestore inventory listener note:', err);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('bhaibhai_admin_products', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  const updateProduct = async (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showToast(`Updated "${updated.name}"`);
    try {
      await InventoryService.saveProduct(updated);
    } catch (e) {
      console.warn('Background Firestore saveProduct failed:', e);
    }
  };

  const updateProductPrice = async (productId: string, pricePKR: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, pricePKR } : p))
    );
    showToast('Updated price in real time');
    try {
      await InventoryService.updatePrice(productId, pricePKR);
    } catch (e) {
      console.error('Failed to sync price to Firestore:', e);
    }
  };

  const updateProductStock = async (
    productId: string,
    inStock: boolean,
    stockCount: number
  ) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, inStock, stockCount } : p))
    );
    showToast('Updated stock in real time');
    try {
      await InventoryService.updateStock(productId, inStock, stockCount);
    } catch (e) {
      console.error('Failed to sync stock to Firestore:', e);
    }
  };

  const addProduct = async (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
    showToast(`Added "${newProd.name}" to inventory`);
    try {
      await InventoryService.saveProduct(newProd);
    } catch (e) {
      console.warn('Background Firestore addProduct failed:', e);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Product removed from catalog.');
    try {
      await InventoryService.deleteProduct(id);
    } catch (e) {
      console.warn('Background Firestore deleteProduct failed:', e);
    }
  };

  const syncInventoryToFirestore = async (): Promise<number> => {
    setIsFirestoreSyncing(true);
    try {
      const count = await InventoryService.syncAllToFirestore(products);
      showToast(`Synchronized ${count} items to Firestore successfully!`);
      return count;
    } catch (e) {
      console.error('Sync to Firestore error:', e);
      showToast('Error syncing inventory to Firestore.');
      throw e;
    } finally {
      setIsFirestoreSyncing(false);
    }
  };

  const resetProductsToDefault = () => {
    setProducts(PRODUCTS);
    try {
      localStorage.removeItem('bhaibhai_admin_products');
    } catch (e) {
      console.error(e);
    }
    showToast('Catalog restored to default store inventory.');
  };

  // WhatsApp Inquiries Log state
  const [inquiries, setInquiries] = useState<WhatsAppInquiry[]>(() => {
    try {
      const saved = localStorage.getItem('bhaibhai_admin_inquiries');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_INQUIRIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('bhaibhai_admin_inquiries', JSON.stringify(inquiries));
    } catch (e) {
      console.error(e);
    }
  }, [inquiries]);

  const updateInquiryStatus = (id: string, status: WhatsAppInquiry['status'], notes?: string) => {
    setInquiries((prev) =>
      prev.map((inq) =>
        inq.id === id ? { ...inq, status, notes: notes !== undefined ? notes : inq.notes } : inq
      )
    );
    showToast(`Inquiry marked as ${status}`);
  };

  const deleteInquiry = (id: string) => {
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));
    showToast('Inquiry removed.');
  };

  const addInquiry = (inquiry: Omit<WhatsAppInquiry, 'id' | 'date'>) => {
    const newInq: WhatsAppInquiry = {
      ...inquiry,
      id: `INQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleString(),
    };
    setInquiries((prev) => [newInq, ...prev]);
  };

  const updateOrderStatus = (
    id: string,
    status: Order['status'],
    trackingNumber?: string,
    courier?: string
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status,
              ...(trackingNumber !== undefined ? { trackingNumber } : {}),
              ...(courier !== undefined ? { courier } : {}),
            }
          : o
      )
    );
    showToast(`Order status updated to ${status}`);
  };

  // Video Inspection Queue state
  const [videoInspections, setVideoInspections] = useState<VideoInspectionRequest[]>(() => {
    try {
      const saved = localStorage.getItem('bhaibhai_admin_video_inspections');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_VIDEO_INSPECTIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('bhaibhai_admin_video_inspections', JSON.stringify(videoInspections));
    } catch (e) {
      console.error(e);
    }
  }, [videoInspections]);

  const updateVideoInspection = (id: string, updates: Partial<VideoInspectionRequest>) => {
    setVideoInspections((prev) =>
      prev.map((req) => (req.id === id ? { ...req, ...updates } : req))
    );
    showToast('Video inspection updated.');
  };

  const addVideoInspectionRequest = (
    req: Omit<VideoInspectionRequest, 'id' | 'requestDate' | 'status'>
  ) => {
    const newReq: VideoInspectionRequest = {
      ...req,
      id: `VIR-2026-${Math.floor(100 + Math.random() * 900)}`,
      requestDate: new Date().toLocaleString(),
      status: 'pending',
    };
    setVideoInspections((prev) => [newReq, ...prev]);
  };

  // Trade-In Submissions state
  const [tradeIns, setTradeIns] = useState<TradeInSubmission[]>(() => {
    try {
      const saved = localStorage.getItem('bhaibhai_admin_tradeins');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TRADE_INS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('bhaibhai_admin_tradeins', JSON.stringify(tradeIns));
    } catch (e) {
      console.error(e);
    }
  }, [tradeIns]);

  const updateTradeIn = (id: string, updates: Partial<TradeInSubmission>) => {
    setTradeIns((prev) =>
      prev.map((ti) => (ti.id === id ? { ...ti, ...updates } : ti))
    );
    showToast('Trade-in record updated.');
  };

  const addTradeInSubmission = (
    sub: Omit<TradeInSubmission, 'id' | 'submissionDate' | 'status'>
  ) => {
    const newSub: TradeInSubmission = {
      ...sub,
      id: `TI-2026-${Math.floor(100 + Math.random() * 900)}`,
      submissionDate: new Date().toLocaleString(),
      status: 'pending_review',
    };
    setTradeIns((prev) => [newSub, ...prev]);
  };

  // Store Configuration state
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(() => {
    try {
      const saved = localStorage.getItem('bhaibhai_admin_store_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_STORE_CONFIG;
  });

  useEffect(() => {
    try {
      localStorage.setItem('bhaibhai_admin_store_config', JSON.stringify(storeConfig));
    } catch (e) {
      console.error(e);
    }
  }, [storeConfig]);

  const updateStoreConfig = (updates: Partial<StoreConfig>) => {
    setStoreConfig((prev) => ({ ...prev, ...updates }));
    showToast('Store configuration saved!');
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedCategorySlug,
        setSelectedCategorySlug,
        searchQuery,
        setSearchQuery,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartSubtotal,
        cartItemCount,
        isCartOpen,
        setIsCartOpen,
        wishlist,
        toggleWishlist,
        isWishlisted,
        compareList,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        isInCompare,
        clearCompare,
        isCompareOpen,
        setIsCompareOpen,
        quickViewProduct,
        openQuickView,
        closeQuickView,
        priceAlertProduct,
        openPriceAlert,
        closePriceAlert,
        priceAlerts,
        addPriceAlert,
        removePriceAlert,
        hasPriceAlert,
        activeBuild,
        setBuildComponent,
        removeBuildComponent,
        resetBuild,
        loadPresetBuild,
        buildTotalPKR,
        activeProductModal,
        openProductModal,
        closeProductModal,
        orders,
        placeOrder,
        trackOrder,
        complaints,
        submitComplaint,
        toast,
        showToast,
        isSoundEnabled,
        toggleSound,
        fpsPreselect,
        setFpsPreselect,
        isTradeInOpen,
        openTradeIn,
        closeTradeIn,
        tradeInTargetProduct,
        videoInspectionProduct,
        openVideoInspection,
        closeVideoInspection,
        // Admin
        products,
        updateProduct,
        updateProductPrice,
        updateProductStock,
        addProduct,
        deleteProduct,
        resetProductsToDefault,
        syncInventoryToFirestore,
        isFirestoreSyncing,
        inquiries,
        updateInquiryStatus,
        deleteInquiry,
        addInquiry,
        updateOrderStatus,
        videoInspections,
        updateVideoInspection,
        addVideoInspectionRequest,
        tradeIns,
        updateTradeIn,
        addTradeInSubmission,
        storeConfig,
        updateStoreConfig,
        // Firebase User Authentication & Accounts
        user,
        userProfile,
        isAuthLoading,
        isAdmin,
        isSuperAdmin,
        loginWithGoogle,
        logout,
        updateUserProfile,
        isAuthModalOpen,
        setIsAuthModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
