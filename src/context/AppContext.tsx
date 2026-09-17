import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  PCBuildSelection,
  Component,
  ComponentType,
  Order,
  Complaint,
} from '../types';
import { PRODUCTS } from '../data/products';
import { COMPONENTS } from '../data/components';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('home');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
