/**
 * Amount utility functions for parsing, validating, and scaling ingredient amounts.
 * Supports integers, decimals, fractions (x/y), and mixed numbers (n x/y).
 */

// ==================== Types ====================

export interface Fraction {
  numerator: number;
  denominator: number;
}

export type ParsedAmount =
  | { type: 'integer'; value: number }
  | { type: 'decimal'; value: number }
  | { type: 'fraction'; value: Fraction }
  | { type: 'mixed'; whole: number; fraction: Fraction };

// ==================== Patterns ====================

// Matches: "3", "3.5", "1/2", "1 1/2"
// Does NOT match: "", "abc", "1/0", "-1", "1 1 1/2", "1//2"
const INTEGER_PATTERN = /^\d+$/;
const DECIMAL_PATTERN = /^\d+\.\d+$/;
const FRACTION_PATTERN = /^\d+\/[1-9]\d*$/;
const MIXED_PATTERN = /^\d+\s+\d+\/[1-9]\d*$/;

export const AMOUNT_PATTERN = /^(\d+|\d+\.\d+|\d+\/[1-9]\d*|\d+\s+\d+\/[1-9]\d*)$/;

// ==================== Validation ====================

/**
 * Check if a string is a valid amount format.
 * Valid: "3", "3.5", "1/2", "1 1/2"
 * Invalid: "", "abc", "1/0", "-1", "1 1 1/2"
 */
export function isValidAmount(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  return AMOUNT_PATTERN.test(trimmed);
}

// ==================== Detection ====================

/**
 * Detect the type of amount from a string.
 */
export function detectAmountType(value: string): 'integer' | 'decimal' | 'fraction' | 'mixed' {
  const trimmed = value.trim();
  if (MIXED_PATTERN.test(trimmed)) return 'mixed';
  if (FRACTION_PATTERN.test(trimmed)) return 'fraction';
  if (DECIMAL_PATTERN.test(trimmed)) return 'decimal';
  if (INTEGER_PATTERN.test(trimmed)) return 'integer';
  throw new Error(`Invalid amount format: ${value}`);
}

// ==================== Parsing ====================

/**
 * Parse a string amount into structured representation.
 * Throws Error for invalid formats.
 */
export function parseAmount(value: string): ParsedAmount {
  if (!isValidAmount(value)) {
    throw new Error(`Invalid amount format: ${value}`);
  }

  const trimmed = value.trim();
  const type = detectAmountType(trimmed);

  switch (type) {
    case 'integer':
      return { type: 'integer', value: parseInt(trimmed, 10) };

    case 'decimal':
      return { type: 'decimal', value: parseFloat(trimmed) };

    case 'fraction': {
      const [num, denom] = trimmed.split('/').map(Number);
      return { type: 'fraction', value: { numerator: num, denominator: denom } };
    }

    case 'mixed': {
      const [wholePart, fractionPart] = trimmed.split(/\s+/);
      const [num, denom] = fractionPart.split('/').map(Number);
      return {
        type: 'mixed',
        whole: parseInt(wholePart, 10),
        fraction: { numerator: num, denominator: denom },
      };
    }
  }
}

// ==================== Fraction Math ====================

/**
 * Calculate GCD using Euclidean algorithm.
 */
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Simplify a fraction to lowest terms.
 * Returns [numerator, denominator].
 */
export function simplifyFraction(numerator: number, denominator: number): [number, number] {
  if (denominator === 0) throw new Error('Division by zero');
  const divisor = gcd(numerator, denominator);
  return [numerator / divisor, denominator / divisor];
}

/**
 * Multiply two fractions and return simplified result.
 */
export function multiplyFractions(a: Fraction, b: Fraction): Fraction {
  const numerator = a.numerator * b.numerator;
  const denominator = a.denominator * b.denominator;
  const [simpNum, simpDenom] = simplifyFraction(numerator, denominator);
  return { numerator: simpNum, denominator: simpDenom };
}

/**
 * Convert a mixed number to an improper fraction.
 * Example: 1 1/2 -> 3/2
 */
function mixedToImproper(whole: number, fraction: Fraction): Fraction {
  const numerator = whole * fraction.denominator + fraction.numerator;
  return { numerator, denominator: fraction.denominator };
}

/**
 * Convert an improper fraction to mixed number if > 1.
 * Returns the string representation.
 */
function improperToMixed(fraction: Fraction): string {
  const [num, denom] = simplifyFraction(fraction.numerator, fraction.denominator);

  if (denom === 1) {
    return num.toString();
  }

  if (num < denom) {
    return `${num}/${denom}`;
  }

  const whole = Math.floor(num / denom);
  const remainder = num % denom;

  if (remainder === 0) {
    return whole.toString();
  }

  return `${whole} ${remainder}/${denom}`;
}

// ==================== Scaling ====================

/**
 * Scale an amount by a ratio (newServings / oldServings), preserving type.
 * - Integers/decimals stay as integers/decimals
 * - Fractions stay as fractions (exact arithmetic)
 * - Mixed numbers stay as mixed numbers
 *
 * @param amount - The original amount string (e.g., "1/3", "2.5", "4", "1 1/2")
 * @param newServings - The target serving count
 * @param oldServings - The original serving count
 * @returns The scaled amount as a string
 */
export function scaleAmount(amount: string, newServings: number, oldServings: number): string {
  if (newServings === oldServings) return amount;

  const parsed = parseAmount(amount);

  switch (parsed.type) {
    case 'integer': {
      // Scale as fraction for precision: value * newServings / oldServings
      const resultNum = parsed.value * newServings;
      const resultDenom = oldServings;
      const [simpNum, simpDenom] = simplifyFraction(resultNum, resultDenom);

      if (simpDenom === 1) {
        return simpNum.toString();
      }
      // Result is not a whole number - return as decimal
      const decimal = simpNum / simpDenom;
      return formatDecimal(decimal);
    }

    case 'decimal': {
      // Scale decimal: value * newServings / oldServings
      const scaled = (parsed.value * newServings) / oldServings;
      if (Number.isInteger(scaled)) {
        return scaled.toString();
      }
      return formatDecimal(scaled);
    }

    case 'fraction': {
      // Multiply fractions: (num/denom) * (newServings/oldServings)
      const scaleFraction: Fraction = { numerator: newServings, denominator: oldServings };
      const result = multiplyFractions(parsed.value, scaleFraction);

      if (result.denominator === 1) {
        return result.numerator.toString();
      }
      return `${result.numerator}/${result.denominator}`;
    }

    case 'mixed': {
      // Convert to improper fraction, scale, convert back
      const improper = mixedToImproper(parsed.whole, parsed.fraction);
      const scaleFraction: Fraction = { numerator: newServings, denominator: oldServings };
      const result = multiplyFractions(improper, scaleFraction);

      return improperToMixed(result);
    }
  }
}

/**
 * Format a decimal with reasonable precision, removing trailing zeros.
 */
function formatDecimal(value: number): string {
  // Use up to 4 decimal places, then strip trailing zeros
  return value.toFixed(4).replace(/\.?0+$/, '');
}

// ==================== Formatting ====================

/**
 * Format a stored amount for display.
 * Handles cleaning up decimal strings (removes trailing zeros).
 */
export function formatAmountForDisplay(amount: string | null): string {
  if (amount === null || amount === '') return '';

  const trimmed = amount.trim();

  // For decimals, remove trailing zeros
  if (trimmed.includes('.') && !trimmed.includes('/')) {
    return trimmed.replace(/\.?0+$/, '');
  }

  return trimmed;
}
