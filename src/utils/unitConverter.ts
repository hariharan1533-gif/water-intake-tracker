import { Unit } from '../types';

export const ML_PER_OZ = 29.5735;

export function mlToOz(ml: number): number {
  return Number((ml / ML_PER_OZ).toFixed(1));
}

export function ozToMl(oz: number): number {
  return Math.round(oz * ML_PER_OZ);
}

export function formatVolume(ml: number, unit: Unit, showUnit = true): string {
  if (unit === 'oz') {
    const oz = mlToOz(ml);
    const formatted = oz % 1 === 0 ? oz.toFixed(0) : oz.toFixed(1);
    return showUnit ? `${formatted} fl oz` : formatted;
  }
  const formatted = Math.round(ml).toLocaleString();
  return showUnit ? `${formatted} ml` : formatted;
}

export function convertAmount(amount: number, fromUnit: Unit, toUnit: Unit): number {
  if (fromUnit === toUnit) return amount;
  if (fromUnit === 'ml' && toUnit === 'oz') return mlToOz(amount);
  return ozToMl(amount);
}
