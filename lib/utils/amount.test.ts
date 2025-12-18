import { describe, it, expect } from 'vitest';
import {
  isValidAmount,
  detectAmountType,
  parseAmount,
  gcd,
  simplifyFraction,
  multiplyFractions,
  scaleAmount,
  formatAmountForDisplay,
} from './amount';

describe('isValidAmount', () => {
  describe('valid amounts', () => {
    it('accepts integers', () => {
      expect(isValidAmount('3')).toBe(true);
      expect(isValidAmount('42')).toBe(true);
      expect(isValidAmount('100')).toBe(true);
      expect(isValidAmount('0')).toBe(true);
    });

    it('accepts decimals', () => {
      expect(isValidAmount('3.5')).toBe(true);
      expect(isValidAmount('0.25')).toBe(true);
      expect(isValidAmount('10.125')).toBe(true);
    });

    it('accepts fractions', () => {
      expect(isValidAmount('1/2')).toBe(true);
      expect(isValidAmount('3/4')).toBe(true);
      expect(isValidAmount('15/16')).toBe(true);
    });

    it('accepts mixed numbers', () => {
      expect(isValidAmount('1 1/2')).toBe(true);
      expect(isValidAmount('2 3/4')).toBe(true);
      expect(isValidAmount('10 1/8')).toBe(true);
    });
  });

  describe('invalid amounts', () => {
    it('rejects empty string', () => {
      expect(isValidAmount('')).toBe(false);
    });

    it('rejects letters', () => {
      expect(isValidAmount('abc')).toBe(false);
      expect(isValidAmount('1a')).toBe(false);
      expect(isValidAmount('a1')).toBe(false);
    });

    it('rejects negative numbers', () => {
      expect(isValidAmount('-1')).toBe(false);
      expect(isValidAmount('-1/2')).toBe(false);
      expect(isValidAmount('-1.5')).toBe(false);
    });

    it('rejects division by zero', () => {
      expect(isValidAmount('1/0')).toBe(false);
      expect(isValidAmount('5/0')).toBe(false);
    });

    it('rejects malformed fractions', () => {
      expect(isValidAmount('1//2')).toBe(false);
      expect(isValidAmount('/2')).toBe(false);
      expect(isValidAmount('1/')).toBe(false);
    });

    it('rejects multiple fractions in mixed', () => {
      expect(isValidAmount('1 1 1/2')).toBe(false);
    });

    it('rejects multiple slashes', () => {
      expect(isValidAmount('1/2/3')).toBe(false);
    });

    it('rejects null and undefined', () => {
      expect(isValidAmount(null as unknown as string)).toBe(false);
      expect(isValidAmount(undefined as unknown as string)).toBe(false);
    });
  });
});

describe('detectAmountType', () => {
  it('detects integers', () => {
    expect(detectAmountType('3')).toBe('integer');
    expect(detectAmountType('42')).toBe('integer');
  });

  it('detects decimals', () => {
    expect(detectAmountType('3.5')).toBe('decimal');
    expect(detectAmountType('0.25')).toBe('decimal');
  });

  it('detects fractions', () => {
    expect(detectAmountType('1/2')).toBe('fraction');
    expect(detectAmountType('3/4')).toBe('fraction');
  });

  it('detects mixed numbers', () => {
    expect(detectAmountType('1 1/2')).toBe('mixed');
    expect(detectAmountType('2 3/4')).toBe('mixed');
  });

  it('throws on invalid input', () => {
    expect(() => detectAmountType('abc')).toThrow();
  });
});

describe('parseAmount', () => {
  it('parses integers', () => {
    expect(parseAmount('3')).toEqual({ type: 'integer', value: 3 });
    expect(parseAmount('42')).toEqual({ type: 'integer', value: 42 });
  });

  it('parses decimals', () => {
    expect(parseAmount('3.5')).toEqual({ type: 'decimal', value: 3.5 });
    expect(parseAmount('0.25')).toEqual({ type: 'decimal', value: 0.25 });
  });

  it('parses fractions', () => {
    expect(parseAmount('1/2')).toEqual({
      type: 'fraction',
      value: { numerator: 1, denominator: 2 },
    });
    expect(parseAmount('3/4')).toEqual({
      type: 'fraction',
      value: { numerator: 3, denominator: 4 },
    });
  });

  it('parses mixed numbers', () => {
    expect(parseAmount('1 1/2')).toEqual({
      type: 'mixed',
      whole: 1,
      fraction: { numerator: 1, denominator: 2 },
    });
    expect(parseAmount('2 3/4')).toEqual({
      type: 'mixed',
      whole: 2,
      fraction: { numerator: 3, denominator: 4 },
    });
  });

  it('throws on invalid input', () => {
    expect(() => parseAmount('abc')).toThrow();
    expect(() => parseAmount('')).toThrow();
  });
});

describe('gcd', () => {
  it('returns correct GCD for common cases', () => {
    expect(gcd(8, 12)).toBe(4);
    expect(gcd(12, 8)).toBe(4);
    expect(gcd(7, 11)).toBe(1);
    expect(gcd(6, 9)).toBe(3);
    expect(gcd(4, 8)).toBe(4);
  });

  it('handles zero', () => {
    expect(gcd(0, 5)).toBe(5);
    expect(gcd(5, 0)).toBe(5);
  });

  it('handles same number', () => {
    expect(gcd(5, 5)).toBe(5);
  });
});

describe('simplifyFraction', () => {
  it('simplifies common fractions', () => {
    expect(simplifyFraction(4, 8)).toEqual([1, 2]);
    expect(simplifyFraction(6, 9)).toEqual([2, 3]);
    expect(simplifyFraction(12, 4)).toEqual([3, 1]);
  });

  it('keeps already simplified fractions', () => {
    expect(simplifyFraction(1, 3)).toEqual([1, 3]);
    expect(simplifyFraction(1, 2)).toEqual([1, 2]);
  });

  it('throws on division by zero', () => {
    expect(() => simplifyFraction(1, 0)).toThrow('Division by zero');
  });
});

describe('multiplyFractions', () => {
  it('multiplies and simplifies', () => {
    const result = multiplyFractions(
      { numerator: 1, denominator: 2 },
      { numerator: 2, denominator: 3 }
    );
    expect(result).toEqual({ numerator: 1, denominator: 3 });
  });

  it('handles whole number results', () => {
    const result = multiplyFractions(
      { numerator: 2, denominator: 1 },
      { numerator: 3, denominator: 1 }
    );
    expect(result).toEqual({ numerator: 6, denominator: 1 });
  });
});

describe('scaleAmount', () => {
  describe('integer scaling', () => {
    it('scales integer to integer when result is whole', () => {
      expect(scaleAmount('2', 8, 4)).toBe('4');
      expect(scaleAmount('4', 2, 4)).toBe('2');
    });

    it('scales integer to decimal when result is not whole', () => {
      expect(scaleAmount('3', 6, 4)).toBe('4.5');
      expect(scaleAmount('1', 3, 2)).toBe('1.5');
    });

    it('returns same value when servings unchanged', () => {
      expect(scaleAmount('5', 4, 4)).toBe('5');
    });
  });

  describe('decimal scaling', () => {
    it('scales decimal and returns integer when possible', () => {
      expect(scaleAmount('2.5', 8, 4)).toBe('5');
    });

    it('scales decimal to decimal', () => {
      expect(scaleAmount('1.5', 6, 4)).toBe('2.25');
    });

    it('returns same value when servings unchanged', () => {
      expect(scaleAmount('2.5', 4, 4)).toBe('2.5');
    });
  });

  describe('fraction scaling', () => {
    it('scales fraction with exact arithmetic', () => {
      // 1/3 * 5/4 = 5/12
      expect(scaleAmount('1/3', 5, 4)).toBe('5/12');
    });

    it('simplifies result', () => {
      // 1/2 * 8/4 = 8/8 = 1
      expect(scaleAmount('1/2', 8, 4)).toBe('1');
    });

    it('handles fractions that become whole numbers', () => {
      // 1/2 * 4/2 = 4/4 = 1
      expect(scaleAmount('1/2', 4, 2)).toBe('1');
    });

    it('returns same value when servings unchanged', () => {
      expect(scaleAmount('1/3', 4, 4)).toBe('1/3');
    });
  });

  describe('mixed number scaling', () => {
    it('scales mixed number to integer', () => {
      // 1 1/2 = 3/2, * 8/4 = 24/8 = 3
      expect(scaleAmount('1 1/2', 8, 4)).toBe('3');
    });

    it('scales mixed number to mixed number', () => {
      // 2 1/4 = 9/4, * 4/6 = 36/24 = 3/2 = 1 1/2
      expect(scaleAmount('2 1/4', 4, 6)).toBe('1 1/2');
    });

    it('scales mixed number to fraction', () => {
      // 1 1/2 = 3/2, * 1/3 = 3/6 = 1/2
      expect(scaleAmount('1 1/2', 1, 3)).toBe('1/2');
    });

    it('returns same value when servings unchanged', () => {
      expect(scaleAmount('1 1/2', 4, 4)).toBe('1 1/2');
    });
  });
});

describe('formatAmountForDisplay', () => {
  it('returns empty string for null', () => {
    expect(formatAmountForDisplay(null)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(formatAmountForDisplay('')).toBe('');
  });

  it('returns integers as-is', () => {
    expect(formatAmountForDisplay('3')).toBe('3');
    expect(formatAmountForDisplay('42')).toBe('42');
  });

  it('removes trailing zeros from decimals', () => {
    expect(formatAmountForDisplay('3.50')).toBe('3.5');
    expect(formatAmountForDisplay('2.00')).toBe('2');
    expect(formatAmountForDisplay('1.250')).toBe('1.25');
  });

  it('keeps fractions as-is', () => {
    expect(formatAmountForDisplay('1/2')).toBe('1/2');
    expect(formatAmountForDisplay('3/4')).toBe('3/4');
  });

  it('keeps mixed numbers as-is', () => {
    expect(formatAmountForDisplay('1 1/2')).toBe('1 1/2');
    expect(formatAmountForDisplay('2 3/4')).toBe('2 3/4');
  });
});
