import { Product, CartItem, PCBuildSelection } from '../types';
import { formatPKR } from './currency';

export const WHATSAPP_PHONE = '923214023566';
export const WHATSAPP_DISPLAY = '+92 321 4023566';

export function createWhatsAppUrl(message: string): string {
  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encoded}`;
}

export function getWhatsAppProductUrl(productOrName: Product | string, pricePKR?: number): string {
  if (typeof productOrName === 'string') {
    const message = `Salam Bhai Bhai Tech World! 👋
I'm interested in buying:
*${productOrName}*
${pricePKR ? `Price: ${formatPKR(pricePKR)}` : ''}

Is this item currently in stock and available for delivery? Please confirm availability and payment details. Thank you!`;
    return createWhatsAppUrl(message);
  }

  const message = `Salam Bhai Bhai Tech World! 👋
I'm interested in buying:
*${productOrName.name}*
Price: ${formatPKR(productOrName.pricePKR)}
SKU / Item ID: ${productOrName.id}

Is this item currently in stock and available for delivery? Please confirm availability and payment details. Thank you!`;
  return createWhatsAppUrl(message);
}

export function getWhatsAppShareProductUrl(product: Product): string {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://bhaibhaitech.pk';
  const productUrl = `${currentOrigin}?product=${product.id}`;
  const specsSummary = Object.entries(product.specs).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' | ');

  const message = `Check out this PC hardware recommendation on Bhai Bhai Tech World! 🚀
*${product.name}*
💰 Price: ${formatPKR(product.pricePKR)}
⚡ Specs: ${specsSummary}
🛡️ 7-Day Check Warranty + Nationwide Courier Delivery

👉 View product: ${productUrl}`;

  const encoded = encodeURIComponent(message.trim());
  return `https://api.whatsapp.com/send?text=${encoded}`;
}

export function getWhatsAppCheckoutUrl(order: {
  orderId: string;
  name: string;
  phone: string;
  city: string;
  address: string;
  totalPKR: number;
  items?: { name: string; quantity: number; pricePKR: number }[];
}): string {
  let itemsText = '';
  if (order.items && order.items.length > 0) {
    itemsText =
      '\n*Items Ordered:*\n' +
      order.items
        .map((it, idx) => `${idx + 1}. ${it.name} x${it.quantity} = ${formatPKR(it.pricePKR * it.quantity)}`)
        .join('\n') +
      '\n';
  }

  const message = `Salam Bhai Bhai Tech! 🛍️
I have placed an order with reference: *${order.orderId}*

*Customer Details:*
• Name: ${order.name}
• Phone: ${order.phone}
• Destination: ${order.city}
• Address: ${order.address}
${itemsText}
*Total Payable:* ${formatPKR(order.totalPKR)}

Please confirm receipt and TCS dispatch details. Thank you!`;
  return createWhatsAppUrl(message);
}

export function getWhatsAppCartUrl(
  items: CartItem[],
  total: number,
  customer?: { name?: string; city?: string; address?: string }
): string {
  const itemsText = items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.product.name} x${item.quantity} = ${formatPKR(
          item.product.pricePKR * item.quantity
        )}`
    )
    .join('\n');

  let customerText = '';
  if (customer?.name) {
    customerText = `\n\n*Customer Details:*\nName: ${customer.name}\nCity: ${customer.city || 'Not specified'}\nAddress: ${customer.address || 'Not specified'}`;
  }

  const message = `Salam Bhai Bhai Tech! 🛒
I would like to place an order for the following items:

${itemsText}

*Subtotal:* ${formatPKR(total)}
*Delivery:* Nationwide Courier (TCS / Leopards / Trax)${customerText}

Please send your confirmation and payment/account details for Cash on Delivery or Bank Transfer.`;
  return createWhatsAppUrl(message);
}

export function getWhatsAppBuildUrl(
  buildOrName: PCBuildSelection | string,
  total: number,
  partsList?: string[]
): string {
  let parts: string[] = [];

  if (typeof buildOrName === 'string') {
    if (partsList && partsList.length > 0) {
      parts = partsList.map((p) => `• ${p}`);
    }
    const message = `Salam Bhai Bhai Tech! 🖥️
I want to order the pre-configured gaming rig:
*${buildOrName}*

${parts.length > 0 ? `Key Components:\n${parts.join('\n')}\n\n` : ''}*Total Rig Price:* ${formatPKR(total)}

Please confirm dispatch timeline via TCS Express. Thank you!`;
    return createWhatsAppUrl(message);
  }

  const build = buildOrName;
  if (build.cpu) parts.push(`• Processor: ${build.cpu.name} (${formatPKR(build.cpu.pricePKR)})`);
  if (build.motherboard) parts.push(`• Motherboard: ${build.motherboard.name} (${formatPKR(build.motherboard.pricePKR)})`);
  if (build.ram) parts.push(`• RAM: ${build.ram.name} (${formatPKR(build.ram.pricePKR)})`);
  if (build.gpu) parts.push(`• GPU: ${build.gpu.name} (${formatPKR(build.gpu.pricePKR)})`);
  if (build.storage) parts.push(`• Storage: ${build.storage.name} (${formatPKR(build.storage.pricePKR)})`);
  if (build.psu) parts.push(`• Power Supply: ${build.psu.name} (${formatPKR(build.psu.pricePKR)})`);
  if (build.case) parts.push(`• Casing: ${build.case.name} (${formatPKR(build.case.pricePKR)})`);
  if (build.cooler) parts.push(`• Cooler: ${build.cooler.name} (${formatPKR(build.cooler.pricePKR)})`);

  const message = `Salam Bhai Bhai Tech! 🖥️
I have configured a custom Gaming PC build on your website and would like to request an official quote:

${parts.join('\n')}

*Estimated Total:* ${formatPKR(total)}

Can you confirm component availability, assembly timeline, and shipping time to my city?`;
  return createWhatsAppUrl(message);
}

export function getWhatsAppServiceUrl(serviceTitle: string): string {
  const message = `Salam Bhai Bhai Tech! 🔧
I want to book an appointment or get a quote for:
*${serviceTitle}*

Please let me know your current bench availability and turnaround time.`;
  return createWhatsAppUrl(message);
}

export function getWhatsAppOrderTrackingUrl(orderId: string): string {
  const message = `Salam Bhai Bhai Tech! 📦
I would like an update on my order:
*Order ID: ${orderId}*

Please check the tracking status and courier details. Thank you!`;
  return createWhatsAppUrl(message);
}

export function getWhatsAppCompatibilityExpertUrl(
  build: PCBuildSelection,
  totalPKR: number,
  issues?: string[]
): string {
  const parts: string[] = [];
  if (build.cpu) parts.push(`• Processor (CPU): ${build.cpu.name}`);
  if (build.motherboard) parts.push(`• Motherboard: ${build.motherboard.name}`);
  if (build.ram) parts.push(`• Memory (RAM): ${build.ram.name}`);
  if (build.gpu) parts.push(`• Graphics Card: ${build.gpu.name}`);
  if (build.storage) parts.push(`• Storage: ${build.storage.name}`);
  if (build.psu) parts.push(`• Power Supply: ${build.psu.name}`);
  if (build.case) parts.push(`• Casing: ${build.case.name}`);
  if (build.cooler) parts.push(`• Cooler: ${build.cooler.name}`);

  const partsText =
    parts.length > 0
      ? parts.join('\n')
      : '• (No parts selected yet — need starting recommendation)';

  const issuesText =
    issues && issues.length > 0
      ? `\n\n*Workbench Compatibility Alerts to Verify:*\n${issues.map((i) => `⚠️ ${i}`).join('\n')}`
      : '\n\n*Workbench Status:* Auto-checks passed, but need your technician sign-off.';

  const message = `Salam Bhai Bhai Tech World Hardware Experts! 🛠️
I am building a PC on your workbench and would like *Expert Advice* on component compatibility & optimization:

*Configured Parts:*
${partsText}

*Estimated Budget:* ${formatPKR(totalPKR)}${issuesText}

Could you please verify:
1. Socket, RAM speed & BIOS compatibility between CPU & Motherboard
2. Adequate PSU wattage headroom for load spikes
3. GPU length & cooler clearance in the chosen casing
4. Any potential bottleneck or better price-to-performance recommendations?

Looking forward to your guidance before placing my order. Thank you!`;

  return createWhatsAppUrl(message);
}

export function getWhatsAppStorePickupUrl(orderRef?: string): string {
  const message = `Salam Bhai Bhai Tech World Sheikhupura! 📍
I want to arrange a *Self-Pickup* at your official store (Shop No. 83, Stadium Park, Sheikhupura).${
    orderRef ? `\n*Order Reference:* ${orderRef}` : ''
  }

Please let me know when my hardware will be ready on the test bench for unboxing and physical verification. Thank you!`;
  return createWhatsAppUrl(message);
}

export function getWhatsAppGeneralUrl(topic?: string): string {
  const msg = topic
    ? `Salam Bhai Bhai Tech World! I have a question regarding ${topic}.`
    : `Salam Bhai Bhai Tech World! I need expert guidance regarding PC hardware and gaming gear.`;
  return createWhatsAppUrl(msg);
}

/**
 * Generates dynamic, context-specific WhatsApp URLs based on the current page.
 * Explicitly triggers specialized 'Component Advice' for the PC Builder page.
 */
export function getWhatsAppContextualUrl(
  page: string,
  buildData?: {
    activeBuild?: PCBuildSelection;
    buildTotalPKR?: number;
  }
): string {
  switch (page) {
    case 'pc-builder': {
      const activeParts = buildData?.activeBuild
        ? Object.entries(buildData.activeBuild)
            .filter(([_, comp]) => Boolean(comp))
            .map(([slot, comp]) => `• ${slot.toUpperCase()}: ${comp!.name}`)
        : [];

      if (activeParts.length > 0) {
        const partsList = activeParts.join('\n');
        const budgetText = buildData?.buildTotalPKR
          ? `\n*Current Workbench Total:* ${formatPKR(buildData.buildTotalPKR)}`
          : '';
        const message = `Salam Bhai Bhai Tech World Hardware Experts! 🛠️
I am using your *PC Builder* and need specialized *Component Advice* on my custom configuration:

*Selected Hardware:*
${partsList}${budgetText}

Could your hardware technicians verify:
1. Compatibility between my chosen CPU, Motherboard, and RAM speeds
2. Power supply wattage headroom and cooler clearance
3. Any price-to-performance recommendations or potential bottlenecks?

Thank you for your expert guidance!`;
        return createWhatsAppUrl(message);
      }

      const message = `Salam Bhai Bhai Tech World Hardware Experts! 🛠️
I am using your *PC Builder* tool and would like specialized *Component Advice* to help configure my custom gaming rig.

Could your hardware engineers advise on:
1. Recommended CPU & GPU combinations for my target games and budget
2. Compatible motherboard, RAM speed, and cooling setups
3. Genuine parts availability in Sheikhupura & nationwide TCS delivery

Looking forward to your recommendations!`;
      return createWhatsAppUrl(message);
    }

    case 'fps-estimator': {
      const message = `Salam Bhai Bhai Tech World! 🎯
I'm using your *FPS & Benchmark Estimator* to test gaming performance.

Could you provide expert advice on the ideal Processor & Graphics Card combination to achieve smooth high-FPS gameplay in CS2, Valorant, GTA V, and Cyberpunk 2077 within my budget? Thank you!`;
      return createWhatsAppUrl(message);
    }

    case 'community-builds': {
      const message = `Salam Bhai Bhai Tech World! ⚡
I'm browsing your *Prebuilt & Custom Gaming Rigs*.

Could you share details on currently available ready-to-dispatch systems, warranties, and options for custom component upgrades? Thank you!`;
      return createWhatsAppUrl(message);
    }

    case 'services': {
      const message = `Salam Bhai Bhai Tech World Workshop! 🔧
I'm interested in your *PC Bench & Technical Services* (Custom Assembly, Cable Management, Deep Clean & Thermal Repaste, BIOS Flashing, or Diagnostics).

Could you please provide turnaround times and cost estimates for my hardware? Thank you!`;
      return createWhatsAppUrl(message);
    }

    case 'store-locator':
    case 'about': {
      const message = `Salam Bhai Bhai Tech World Sheikhupura! 📍
I'm inquiring about visiting your official store (Shop No. 83, Stadium Park, Sheikhupura).

I'd like to plan an in-person visit for live hardware bench testing and same-day pickup. Could you please confirm counter timings and test bench availability? Thank you!`;
      return createWhatsAppUrl(message);
    }

    case 'shop': {
      const message = `Salam Bhai Bhai Tech World! 🛒
I'm browsing your *Hardware Catalog* and would like to check current market pricing, live stock availability, and 7-day replacement warranty details for PC parts. Thank you!`;
      return createWhatsAppUrl(message);
    }

    case 'my-account': {
      const message = `Salam Bhai Bhai Tech World! 📦
I would like to track my order status, verify courier dispatch details, or inquire about customer rewards. Thank you!`;
      return createWhatsAppUrl(message);
    }

    case 'warranty-policy':
    case 'return-policy': {
      const message = `Salam Bhai Bhai Tech World Support! 🛡️
I have a question regarding your *7-Day Replacement Check Warranty*, seal verification, or manufacturer claim process. Could you guide me through the procedure?`;
      return createWhatsAppUrl(message);
    }

    case 'complaints': {
      const message = `Salam Bhai Bhai Tech World Management! 📋
I would like to submit a customer support inquiry or feedback regarding my order/service experience. Please connect me with a senior support representative.`;
      return createWhatsAppUrl(message);
    }

    default: {
      const message = `Salam Bhai Bhai Tech World! 👋
I'm browsing your online store and need expert hardware advice regarding custom gaming PCs, components, and authentic gear in Pakistan.`;
      return createWhatsAppUrl(message);
    }
  }
}

/**
 * Returns a contextual badge and title for the floating WhatsApp UI based on current page.
 */
export function getWhatsAppPageContextBadge(page: string): { title: string; subtitle: string; isHighlight?: boolean } {
  switch (page) {
    case 'pc-builder':
      return {
        title: 'Component Advice Desk',
        subtitle: 'Hardware Specialists Ready',
        isHighlight: true,
      };
    case 'fps-estimator':
      return {
        title: 'Benchmark & FPS Advice',
        subtitle: 'Consult GPU Specialists',
        isHighlight: true,
      };
    case 'community-builds':
      return {
        title: 'Prebuilt Rigs Support',
        subtitle: 'Ready-to-Ship Rig Help',
      };
    case 'services':
      return {
        title: 'PC Workshop & Bench',
        subtitle: 'Book Tech Assembly',
      };
    case 'store-locator':
      return {
        title: 'Sheikhupura Store Counter',
        subtitle: 'Shop #83 Pickup Desk',
      };
    case 'my-account':
      return {
        title: 'Order Tracking Helpline',
        subtitle: 'TCS Courier Support',
      };
    default:
      return {
        title: 'WhatsApp Instant Ordering',
        subtitle: WHATSAPP_DISPLAY,
      };
  }
}

/**
 * Calculates estimated response time based on business hours.
 * Store & Bench hours: Mon-Sat 11:00 AM - 10:00 PM PKT (UTC+5), Friday break 1:00-2:30 PM.
 */
export interface ResponseTimeInfo {
  isOpen: boolean;
  responseTimeText: string;
  statusText: string;
  hoursDetail: string;
}

export function getEstimatedResponseTime(): ResponseTimeInfo {
  const now = new Date();
  // Pakistan Standard Time is UTC+5
  const utcHour = now.getUTCHours();
  const utcMin = now.getUTCMinutes();
  const pktHour = (utcHour + 5) % 24;
  const dayOfWeek = now.getUTCDay(); // 0 = Sun, 5 = Fri, 6 = Sat

  const isFridayBreak = dayOfWeek === 5 && (pktHour === 13 || (pktHour === 14 && utcMin < 30));
  const isDuringHours = pktHour >= 9 && pktHour < 21 && !isFridayBreak;

  if (isFridayBreak) {
    return {
      isOpen: false,
      responseTimeText: 'Typical response time: ~15 mins (Friday Break)',
      statusText: 'Friday Prayer Break',
      hoursDetail: 'Bench resumes 2:30 PM PKT',
    };
  }

  if (isDuringHours) {
    return {
      isOpen: true,
      responseTimeText: 'Typical response time: < 5 mins',
      statusText: 'Technicians Active',
      hoursDetail: 'Mon–Sun: 9:00 AM – 9:00 PM PKT',
    };
  }

  return {
    isOpen: false,
    responseTimeText: 'Typical response time: ~15-30 mins (After-Hours)',
    statusText: 'After-Hours Standby',
    hoursDetail: 'Opens 9:00 AM PKT',
  };
}

export interface RecentInquiry {
  id: string;
  topic: string;
  category: string;
  url: string;
  timestamp: string;
}

const RECENT_INQUIRIES_KEY = 'bhaibhai_recent_whatsapp_topics';

/**
 * Retrieves the last 3 stored WhatsApp message topics.
 */
export function getRecentInquiries(): RecentInquiry[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(RECENT_INQUIRIES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, 3);
      }
    }
  } catch (e) {
    console.error(e);
  }

  // Pre-seed with helpful realistic hardware topics
  return [
    {
      id: 'inq-pc-builder',
      topic: 'Component Advice (PC Builder)',
      category: 'Workbench',
      url: getWhatsAppContextualUrl('pc-builder'),
      timestamp: 'Recently viewed',
    },
    {
      id: 'inq-store-pickup',
      topic: 'Hafeez Centre Lahore Pickup',
      category: 'Store Counter',
      url: getWhatsAppStorePickupUrl(),
      timestamp: 'Popular',
    },
    {
      id: 'inq-catalog',
      topic: 'Live Stock & Price Verification',
      category: 'Sales',
      url: getWhatsAppGeneralUrl('Hardware Availability & Deals'),
      timestamp: 'Available now',
    },
  ];
}

/**
 * Saves a WhatsApp message topic to local storage (maintains the last 3).
 */
export function saveRecentInquiry(inquiry: { topic: string; category: string; url: string }): RecentInquiry[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getRecentInquiries();
    const filtered = current.filter(
      (item) => item.topic.toLowerCase() !== inquiry.topic.toLowerCase()
    );
    const updated: RecentInquiry[] = [
      {
        id: `inq-${Date.now()}`,
        topic: inquiry.topic,
        category: inquiry.category,
        url: inquiry.url,
        timestamp: 'Just now',
      },
      ...filtered,
    ].slice(0, 3);

    localStorage.setItem(RECENT_INQUIRIES_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Returns clean topic and category descriptors for a given page route.
 */
export function getTopicForPage(page: string): { topic: string; category: string } {
  switch (page) {
    case 'pc-builder':
      return { topic: 'Component Advice (Custom PC Build)', category: 'Workbench' };
    case 'fps-estimator':
      return { topic: 'GPU & CPU FPS Benchmark Advice', category: 'Gaming' };
    case 'community-builds':
      return { topic: 'Prebuilt Gaming Rig Inquiry', category: 'Systems' };
    case 'services':
      return { topic: 'Bench Testing & Assembly Services', category: 'Workshop' };
    case 'store-locator':
    case 'about':
      return { topic: 'Sheikhupura Store Pickup & Visit', category: 'Store Visit' };
    case 'shop':
      return { topic: 'Hardware Stock & Price Inquiry', category: 'Catalog' };
    case 'my-account':
      return { topic: 'Order Status & TCS Courier Tracking', category: 'Tracking' };
    case 'warranty-policy':
    case 'return-policy':
      return { topic: '7-Day Replacement Warranty Query', category: 'Warranty' };
    case 'complaints':
      return { topic: 'Customer Support / RMA Ticket', category: 'Support' };
    default:
      return { topic: 'Hardware Inquiry & Expert Guidance', category: 'General' };
  }
}



