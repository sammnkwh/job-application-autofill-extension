import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert a string to Title Case (e.g., "JOHN DOE" -> "John Doe")
 */
export function toTitleCase(str: string): string {
  if (!str) return str
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Common country abbreviations mapped to full names
 */
const COUNTRY_ABBREVIATIONS: Record<string, string> = {
  'us': 'United States of America',
  'usa': 'United States of America',
  'united states': 'United States of America',
  'uk': 'United Kingdom',
  'gb': 'United Kingdom',
  'ca': 'Canada',
  'au': 'Australia',
  'nz': 'New Zealand',
  'de': 'Germany',
  'fr': 'France',
  'jp': 'Japan',
  'cn': 'China',
  'in': 'India',
  'br': 'Brazil',
  'mx': 'Mexico',
  'es': 'Spain',
  'it': 'Italy',
  'nl': 'Netherlands',
  'se': 'Sweden',
  'no': 'Norway',
  'dk': 'Denmark',
  'fi': 'Finland',
  'ch': 'Switzerland',
  'at': 'Austria',
  'be': 'Belgium',
  'ie': 'Ireland',
  'sg': 'Singapore',
  'kr': 'South Korea',
  'za': 'South Africa',
  'ae': 'United Arab Emirates',
  'uae': 'United Arab Emirates',
}

/**
 * Expand country abbreviations to full names (e.g., "USA" -> "United States of America")
 * Returns title case for unrecognized values
 */
export function expandCountryName(str: string): string {
  if (!str) return str
  const normalized = str.toLowerCase().trim()
  return COUNTRY_ABBREVIATIONS[normalized] || toTitleCase(str)
}
