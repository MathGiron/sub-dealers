import React, { useEffect, useCallback } from "react";

// Define tipos para FREIGHT_TABLE
type DistanceRange = "001-100" | "101-200" | "201-400" | "401-600" | "601-800" | "801-1000" | "1001-1200" | "1201-1400" | "1401-1600" | "1601-1800" | "1801-2000" | "2001-2200" | "2201-2400" | "2401-2600" | "2601-2800" | "2801-3000" | "3001-3200" | "3201-3400" | "3401-3800" | "3801-4200" | "4201-4600" | "4601-5000" | "5001-5400" | "5400+";
type WeightRange = "0-5" | "5-10" | "11-20" | "21-40" | "41-60" | "61-100" | "100+";

type Product = {
  weight: number;
  quantity: number;
};

type FreightCalculatorProps = {
  products: Product[];
  distance: number;
  state: string;
  totalAmount: number;
  onFreightCalculated: (freight: number, additionalFees: number) => void;
};

const FREIGHT_TABLE: Record<DistanceRange, Record<WeightRange, number>> = {
  "001-100": { "0-5": 27.05, "5-10": 33.81, "11-20": 42.85, "21-40": 53.04, "41-60": 65.31, "61-100": 78.31, "100+": 1.22 },
  "101-200": { "0-5": 29.84, "5-10": 37.30, "11-20": 46.33, "21-40": 57.69, "41-60": 72.14, "61-100": 85.30, "100+": 1.33 },
  "201-400": { "0-5": 36.24, "5-10": 45.30, "11-20": 57.69, "21-40": 69.06, "41-60": 83.50, "61-100": 99.74, "100+": 1.56 },
  "401-600": { "0-5": 44.39, "5-10": 55.49, "11-20": 71.24, "21-40": 87.12, "41-60": 103.77, "61-100": 123.12, "100+": 1.91 },
  "601-800": { "0-5": 54.30, "5-10": 67.88, "11-20": 83.39, "21-40": 101.49, "41-60": 119.84, "61-100": 141.74, "100+": 2.21 },
  "801-1000": { "0-5": 61.86, "5-10": 77.32, "11-20": 96.85, "21-40": 113.90, "41-60": 135.49, "61-100": 158.96, "100+": 2.47 },
  "1001-1200": { "0-5": 80.22, "5-10": 100.27, "11-20": 112.71, "21-40": 191.80, "41-60": 227.78, "61-100": 262.26, "100+": 2.82 },
  "1201-1400": { "0-5": 90.17, "5-10": 112.71, "11-20": 126.50, "21-40": 214.81, "41-60": 255.22, "61-100": 294.63, "100+": 3.17 },
  "1401-1600": { "0-5": 98.12, "5-10": 122.66, "11-20": 137.66, "21-40": 233.75, "41-60": 277.73, "61-100": 320.62, "100+": 3.46 },
  "1601-1800": { "0-5": 100.02, "5-10": 125.03, "11-20": 138.96, "21-40": 237.04, "41-60": 280.18, "61-100": 323.88, "100+": 3.49 },
  "1801-2000": { "0-5": 110.30, "5-10": 137.88, "11-20": 152.60, "21-40": 260.44, "41-60": 308.98, "61-100": 355.00, "100+": 3.83 },
  "2001-2200": { "0-5": 120.56, "5-10": 150.71, "11-20": 166.10, "21-40": 282.56, "41-60": 334.24, "61-100": 383.73, "100+": 4.13 },
  "2201-2400": { "0-5": 130.94, "5-10": 163.68, "11-20": 180.62, "21-40": 307.55, "41-60": 364.08, "61-100": 450.25, "100+": 4.51 },
  "2401-2600": { "0-5": 139.86, "5-10": 174.82, "11-20": 181.41, "21-40": 323.21, "41-60": 371.16, "61-100": 487.61, "100+": 4.87 },
  "2601-2800": { "0-5": 151.07, "5-10": 188.83, "11-20": 195.48, "21-40": 347.17, "41-60": 397.81, "61-100": 522.08, "100+": 5.22 },
  "2801-3000": { "0-5": 163.88, "5-10": 204.84, "11-20": 211.64, "21-40": 374.97, "41-60": 428.97, "61-100": 562.52, "100+": 5.63 },
  "3001-3200": { "0-5": 177.80, "5-10": 222.25, "11-20": 229.89, "21-40": 407.86, "41-60": 467.04, "61-100": 612.74, "100+": 6.13 },
  "3201-3400": { "0-5": 199.00, "5-10": 248.75, "11-20": 257.64, "21-40": 457.91, "41-60": 524.97, "61-100": 689.14, "100+": 6.89 },
  "3401-3800": { "0-5": 222.79, "5-10": 278.48, "11-20": 288.18, "21-40": 511.63, "41-60": 586.12, "61-100": 845.37, "100+": 8.45 },
  "3801-4200": { "0-5": 245.06, "5-10": 306.33, "11-20": 317.00, "21-40": 562.80, "41-60": 644.74, "61-100": 929.91, "100+": 9.30 },
  "4201-4600": { "0-5": 269.57, "5-10": 336.96, "11-20": 348.70, "21-40": 619.07, "41-60": 709.21, "61-100": 1022.90, "100+": 10.23 },
  "4601-5000": { "0-5": 296.53, "5-10": 370.66, "11-20": 383.57, "21-40": 680.98, "41-60": 780.13, "61-100": 1125.19, "100+": 11.25 },
  "5001-5400": { "0-5": 326.18, "5-10": 407.73, "11-20": 421.92, "21-40": 749.07, "41-60": 858.14, "61-100": 1237.70, "100+": 12.38 },
  "5400+": { "0-5": 358.80, "5-10": 448.50, "11-20": 464.12, "21-40": 823.98, "41-60": 943.96, "61-100": 1361.48, "100+": 13.61 },
};

const ADDITIONAL_FEES = {
  pedagio: 7.46, // por 100 kg
  despacho: 21.21, // RJ, ES, MT, MS, RO, AC
  tas: 9.08, // GO, MG, DF, MT, MS, RO, AC, PA, RR, RO, AP, TO, AM
  grisMin: 1.36, // RS, SC, PR, SP, MG, GO, DF
  grisPercentLow: 0.001, // até 10.000
  grisPercentHigh: 0.0023, // acima 10.000
  grisMinOther: 2.47, // RJ, ES, MT, MS, AM, PA, RO, RR, AP, TO, AC
  grisPercentOther: 0.003, // %
  secCatSP: 37.08, // São Paulo Capital
  secCatGrandeSP: 47.93, // Grande São Paulo
  emex: 19.40, // Grande Rio e cidades de alto risco
  zonaRestricao: { "1-100": 53.03, "101-200": 68.35, "201-300": 91.92, "301-500": 123.74, "501-1000": 206.24, "1001-1500": 406.59, "1500+": 565.69 },
  tfdMin: 105.95, // por posição palete por dia
  tfdPercent: 0.009, // % sobre valor
  reentrega: 0.5, // 50% do frete original
  devolucao: 1.0, // 100% do frete original
  cargaDificil: 0.3, // 30% do frete original
  copias: 6.25, // por conhecimento
  tdeMin: 155.20, // demais localidades
  tdeMinNorth: 320.00, // região norte
};

const FreightCalculator: React.FC<FreightCalculatorProps> = ({ products, distance, state, totalAmount, onFreightCalculated }) => {
  const calculateFreight = useCallback((totalWeight: number) => {
    let distanceRange: DistanceRange = "001-100";
    if (distance <= 100) distanceRange = "001-100";
    else if (distance <= 200) distanceRange = "101-200";
    else if (distance <= 400) distanceRange = "201-400";
    else if (distance <= 600) distanceRange = "401-600";
    else if (distance <= 800) distanceRange = "601-800";
    else if (distance <= 1000) distanceRange = "801-1000";
    else if (distance <= 1200) distanceRange = "1001-1200";
    else if (distance <= 1400) distanceRange = "1201-1400";
    else if (distance <= 1600) distanceRange = "1401-1600";
    else if (distance <= 1800) distanceRange = "1601-1800";
    else if (distance <= 2000) distanceRange = "1801-2000";
    else if (distance <= 2200) distanceRange = "2001-2200";
    else if (distance <= 2400) distanceRange = "2201-2400";
    else if (distance <= 2600) distanceRange = "2401-2600";
    else if (distance <= 2800) distanceRange = "2601-2800";
    else if (distance <= 3000) distanceRange = "2801-3000";
    else if (distance <= 3200) distanceRange = "3001-3200";
    else if (distance <= 3400) distanceRange = "3201-3400";
    else if (distance <= 3800) distanceRange = "3401-3800";
    else if (distance <= 4200) distanceRange = "3801-4200";
    else if (distance <= 4600) distanceRange = "4201-4600";
    else if (distance <= 5000) distanceRange = "4601-5000";
    else if (distance <= 5400) distanceRange = "5001-5400";
    else distanceRange = "5400+";

    let weightRange: WeightRange = "0-5";
    if (totalWeight <= 5) weightRange = "0-5";
    else if (totalWeight <= 10) weightRange = "5-10";
    else if (totalWeight <= 20) weightRange = "11-20";
    else if (totalWeight <= 40) weightRange = "21-40";
    else if (totalWeight <= 60) weightRange = "41-60";
    else if (totalWeight <= 100) weightRange = "61-100";
    else weightRange = "100+";

    const baseFreight = FREIGHT_TABLE[distanceRange][weightRange];
    return baseFreight;
  }, [distance]);

  const calculateAdditionalFees = (totalWeight: number, totalPrice: number, state: string) => {
    const pedagio = Math.ceil(totalWeight / 100) * ADDITIONAL_FEES.pedagio;
    const gris = totalWeight > 10000 ? totalWeight * ADDITIONAL_FEES.grisPercentHigh : totalWeight * ADDITIONAL_FEES.grisPercentLow;
    const grisFee = ["SP", "RS", "SC", "PR", "MG", "GO", "DF"].includes(state)
      ? (gris < ADDITIONAL_FEES.grisMin ? ADDITIONAL_FEES.grisMin : gris)
      : (gris < ADDITIONAL_FEES.grisMinOther ? ADDITIONAL_FEES.grisMinOther : gris * ADDITIONAL_FEES.grisPercentOther);
    const tfdFee = Math.max(ADDITIONAL_FEES.tfdMin, totalPrice * ADDITIONAL_FEES.tfdPercent);

    let additional = pedagio + grisFee + tfdFee;
    if (state === "SP") additional += ADDITIONAL_FEES.secCatSP;
    else if (["RJ", "ES"].includes(state)) additional += ADDITIONAL_FEES.despacho;
    else if (["GO", "MG", "DF", "MT", "MS", "RO", "AC", "PA", "RR", "AP", "TO", "AM"].includes(state)) additional += ADDITIONAL_FEES.tas;

    return additional;
  };

  useEffect(() => {
    const totalWeight = products.reduce((sum, p) => sum + (p.weight || 0) * p.quantity, 0);
    const freightCost = calculateFreight(totalWeight);
    const additionalFees = calculateAdditionalFees(totalWeight, totalAmount, state);
    onFreightCalculated(freightCost, additionalFees);
  }, [products, distance, state, totalAmount, onFreightCalculated, calculateFreight]);

  return null; // Componente não renderiza nada visível, só calcula
};

export default FreightCalculator;