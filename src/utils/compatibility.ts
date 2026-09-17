import { PCBuildSelection, CompatibilityCheck } from '../types';

export function validateCompatibility(build: PCBuildSelection): CompatibilityCheck {
  const issues: string[] = [];
  const warnings: string[] = [];
  const passedChecks: string[] = [];

  const { motherboard, cpu, ram, gpu, psu, case: pcCase, cooler } = build;

  // 1. Socket Check (Motherboard vs CPU)
  if (motherboard && cpu) {
    const mbSocket = motherboard.specs.socket;
    const cpuSocket = cpu.specs.socket;
    if (mbSocket && cpuSocket && mbSocket !== cpuSocket) {
      issues.push(`Socket mismatch: ${cpu.name} (${cpuSocket}) cannot be installed on ${motherboard.name} (${mbSocket}).`);
    } else if (mbSocket && cpuSocket) {
      passedChecks.push(`Socket compatible: Matching ${cpuSocket} interface.`);
    }
  }

  // 2. RAM Type Check (Motherboard vs RAM)
  if (motherboard && ram) {
    const mbRam = motherboard.specs.ramType;
    const ramType = ram.specs.ramType;
    if (mbRam && ramType && mbRam !== ramType) {
      issues.push(`RAM Generation conflict: Motherboard supports ${mbRam}, but you selected ${ramType} memory.`);
    } else if (mbRam && ramType) {
      passedChecks.push(`Memory standard verified: ${ramType} architecture matches motherboard.`);
    }
  }

  // 3. Form factor Check (Case vs Motherboard)
  if (pcCase && motherboard) {
    const mbFF = motherboard.specs.formFactor;
    const caseFF = pcCase.specs.formFactor;
    if (caseFF === 'Micro-ATX' && mbFF === 'ATX') {
      issues.push(`Case constraint: Standard ATX motherboard will not fit inside a Micro-ATX compact case.`);
    } else if (caseFF === 'Mini-ITX' && (mbFF === 'ATX' || mbFF === 'Micro-ATX')) {
      issues.push(`Case constraint: ${mbFF} motherboard is too large for Mini-ITX chassis.`);
    } else {
      passedChecks.push(`Chassis fit verified: ${caseFF || 'Standard'} enclosure accommodates ${mbFF || 'selected'} board.`);
    }
  }

  // 4. Power & TDP Calculations
  const cpuTdp = cpu?.specs.tdp || 65;
  const gpuTdp = gpu?.specs.tdp || (gpu ? 150 : 0);
  const baselineSystemTdp = 60; // motherboard, SSD, fans, RAM
  const totalTdp = (cpu ? cpuTdp : 0) + (gpu ? gpuTdp : 0) + baselineSystemTdp;

  // Recommended PSU has ~150-200W safety overhead for transient spikes
  const recommendedPsuWattage = Math.ceil((totalTdp + 150) / 50) * 50;

  if (psu) {
    const selectedWattage = psu.specs.wattage || 500;
    if (selectedWattage < totalTdp) {
      issues.push(
        `Critical Power Deficit: Selected PSU (${selectedWattage}W) cannot supply system peak draw (${totalTdp}W). Risk of shutdown!`
      );
    } else if (selectedWattage < recommendedPsuWattage) {
      warnings.push(
        `Power headroom caution: Selected PSU is ${selectedWattage}W. We advise at least ${recommendedPsuWattage}W for peak GPU transient power spikes.`
      );
    } else {
      passedChecks.push(`Power delivery certified: ${selectedWattage}W PSU provides ample overhead for ${totalTdp}W peak load.`);
    }
  }

  // 5. Thermal & Cooler Check
  if (cpu && cooler) {
    const coolerType = cooler.specs.coolerType;
    if (cpuTdp >= 120 && coolerType === 'Air' && cooler.pricePKR < 5000) {
      warnings.push(
        `Thermal throttling advisory: ${cpu.name} has a high ${cpuTdp}W TDP. Basic air cooling may cause thermal throttle under sustained load.`
      );
    } else {
      passedChecks.push(`Thermal solution configured adequately for ${cpuTdp}W TDP.`);
    }
  }

  const isCompatible = issues.length === 0;

  return {
    isCompatible,
    totalTdp,
    recommendedPsuWattage,
    issues,
    warnings,
    passedChecks,
  };
}
