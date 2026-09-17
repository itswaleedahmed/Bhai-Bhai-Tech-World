export interface HardwareService {
  id: string;
  title: string;
  tagline: string;
  pricePKR: string;
  turnaround: string;
  description: string;
  features: string[];
  iconName: string;
}

export const SERVICES: HardwareService[] = [
  {
    id: 'custom-pc-assembly',
    title: 'Custom PC Assembly & Cable Management',
    tagline: 'Professional bench assembly with surgical cable tying and stress-test certification.',
    pricePKR: 'Rs 3,500 - 6,000',
    turnaround: '24 - 48 Hours',
    description: 'Bring your parts or buy from us. We assemble your rig, update motherboard BIOS to the latest stable microcode, configure EXPO/XMP memory profiles, route cables invisibly, and run a 2-hour FurMark + Cinebench thermal stress test before handover.',
    features: [
      'Precision cable routing with Velcro straps',
      'Latest Motherboard BIOS & TPM 2.0 update',
      'Windows 11 Pro installation & driver tuning',
      'Cinebench R23 & FurMark thermal benchmark certification report',
    ],
    iconName: 'Wrench',
  },
  {
    id: 'pc-diagnosis-repair',
    title: 'Hardware Diagnosis & Component Repair',
    tagline: 'Pinpoint hardware failures, blue screens (BSOD), and no-post power problems.',
    pricePKR: 'Rs 1,500 Diagnostic Fee (Adjustable against repair)',
    turnaround: 'Same Day / 24 Hours',
    description: 'Stuck on VGA or CPU debug LED? Frequent game crashes? Our diagnostic lab at Shop No. 83, Stadium Park, Sheikhupura isolates faulty RAM sticks, dead PSU rails, corrupted BIOS chips, or GPU solder issues with professional test-benches.',
    features: [
      'Comprehensive multi-rail power supply test',
      'MemTest86 memory integrity testing',
      'Motherboard PCIe slot and VRM voltage check',
      'Transparent quote before any repair begins',
    ],
    iconName: 'Stethoscope',
  },
  {
    id: 'hardware-upgrades',
    title: 'Hardware Upgrades & Data Migration',
    tagline: 'Give your old gaming rig a new lease on life with zero data loss.',
    pricePKR: 'From Rs 2,000 + Parts',
    turnaround: '1 - 3 Hours',
    description: 'Upgrading from HDD to NVMe SSD? Moving from a GTX 1060 to an RTX 4060? We clone your entire Windows installation, games, and files byte-for-byte to your new drive so you don’t have to reinstall anything.',
    features: [
      'Byte-level NVMe / SSD cloning (keep all games & licenses)',
      'GPU and PSU swap with custom cable extensions',
      'RAM dual-channel optimization & timing verification',
      'Bottleneck assessment before purchase',
    ],
    iconName: 'ArrowUpCircle',
  },
  {
    id: 'thermal-repasting',
    title: 'Thermal Repasting & Deep Ultrasonic Cleaning',
    tagline: 'Drop CPU & GPU temperatures by 10°C - 20°C with Arctic MX-6 or liquid metal.',
    pricePKR: 'Rs 2,500 (CPU + GPU Combo)',
    turnaround: 'Same Day',
    description: 'Dust accumulation in Pakistan is brutal on heatsinks and fans. We disassemble your graphics card and CPU cooler, clean heatsink fins ultrasonically, and apply fresh non-conductive Arctic MX-6 compound or Thermal Grizzly Kryonaut.',
    features: [
      'Complete dust blowout with ESD-safe air equipment',
      'Fresh Arctic MX-6 or Kryonaut thermal paste application',
      'High-performance thermal pad replacement on GPU VRAM',
      'Before & After temperature comparison proof',
    ],
    iconName: 'ThermometerSnowflake',
  },
];
