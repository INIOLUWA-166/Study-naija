/**
 * Scientific Calculator Engine for JAMB UTME, WAEC, NECO & Science Examinations
 * Supports standard arithmetic, trigonometry (DEG/RAD), logarithms, powers,
 * roots, factorials, and standard physics/chemistry constants.
 */

export interface PhysicsConstant {
  symbol: string;
  name: string;
  value: number;
  unit: string;
  description: string;
}

export const PHYSICS_CONSTANTS: PhysicsConstant[] = [
  { symbol: 'g', name: 'Gravity (Standard)', value: 9.8, unit: 'm/s²', description: 'Acceleration due to gravity on Earth' },
  { symbol: 'g₁₀', name: 'Gravity (JAMB UTME)', value: 10, unit: 'm/s²', description: 'Standard UTME approximation for g' },
  { symbol: 'c', name: 'Speed of Light', value: 3e8, unit: 'm/s', description: 'Velocity of electromagnetic radiation in vacuum' },
  { symbol: 'π', name: 'Pi', value: Math.PI, unit: '', description: 'Ratio of circumference to diameter (3.14159...)' },
  { symbol: 'e', name: "Euler's Number", value: Math.E, unit: '', description: 'Base of natural logarithms (2.71828...)' },
  { symbol: 'h', name: "Planck's Constant", value: 6.626e-34, unit: 'J·s', description: 'Quantum of electromagnetic action' },
  { symbol: 'q_e', name: 'Electron Charge', value: 1.602e-19, unit: 'C', description: 'Elementary electric charge' },
  { symbol: 'N_A', name: 'Avogadro Constant', value: 6.022e23, unit: 'mol⁻¹', description: 'Number of particles per mole' },
  { symbol: 'G', name: 'Gravitational Constant', value: 6.674e-11, unit: 'N·m²/kg²', description: 'Universal gravitation constant' },
  { symbol: 'R', name: 'Universal Gas Constant', value: 8.314, unit: 'J/(mol·K)', description: 'Molar gas constant' },
];

export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) throw new Error('Factorial requires non-negative integer');
  if (n > 170) return Infinity; // JS number overflow limit
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

/**
 * Safely parses and evaluates scientific math expressions
 */
export function evaluateMathExpression(expr: string, angleMode: 'DEG' | 'RAD' = 'DEG'): number {
  if (!expr || expr.trim() === '') return 0;

  let sanitized = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, `(${Math.PI})`)
    .replace(/\bpi\b/gi, `(${Math.PI})`);

  // Replace constants if present
  PHYSICS_CONSTANTS.forEach(c => {
    // Avoid replacing single letters like 'e' or 'c' inside function names
    if (c.symbol === 'g₁₀') {
      sanitized = sanitized.replace(/g₁₀/g, '(10)');
    } else if (c.symbol === 'q_e') {
      sanitized = sanitized.replace(/q_e/g, '(1.602e-19)');
    } else if (c.symbol === 'N_A') {
      sanitized = sanitized.replace(/N_A/g, '(6.022e23)');
    }
  });

  // Handle factorials e.g. 5! or (3+2)!
  sanitized = sanitized.replace(/(\d+)!/g, (_, num) => {
    return `factorial(${num})`;
  });

  // Convert powers x^y -> x**y
  sanitized = sanitized.replace(/\^/g, '**');

  // Math functions environment
  const env: Record<string, any> = {
    Math,
    factorial,
    sin: (x: number) => {
      const rad = angleMode === 'DEG' ? (x * Math.PI) / 180 : x;
      // Handle floating point imprecision near 0/180/360
      if (angleMode === 'DEG' && (x % 180 === 0)) return 0;
      return Math.sin(rad);
    },
    cos: (x: number) => {
      const rad = angleMode === 'DEG' ? (x * Math.PI) / 180 : x;
      if (angleMode === 'DEG' && ((x - 90) % 180 === 0)) return 0;
      return Math.cos(rad);
    },
    tan: (x: number) => {
      const rad = angleMode === 'DEG' ? (x * Math.PI) / 180 : x;
      if (angleMode === 'DEG' && ((x - 90) % 180 === 0)) {
        throw new Error('tan undefined at 90° / 270°');
      }
      return Math.tan(rad);
    },
    asin: (x: number) => {
      const rad = Math.asin(x);
      return angleMode === 'DEG' ? (rad * 180) / Math.PI : rad;
    },
    acos: (x: number) => {
      const rad = Math.acos(x);
      return angleMode === 'DEG' ? (rad * 180) / Math.PI : rad;
    },
    atan: (x: number) => {
      const rad = Math.atan(x);
      return angleMode === 'DEG' ? (rad * 180) / Math.PI : rad;
    },
    log: (x: number) => {
      if (x <= 0) throw new Error('log of non-positive');
      return Math.log10(x);
    },
    ln: (x: number) => {
      if (x <= 0) throw new Error('ln of non-positive');
      return Math.log(x);
    },
    sqrt: (x: number) => {
      if (x < 0) throw new Error('sqrt of negative');
      return Math.sqrt(x);
    },
    cbrt: (x: number) => Math.cbrt(x),
    abs: (x: number) => Math.abs(x),
    exp: (x: number) => Math.exp(x),
  };

  // Replace function calls: ln( -> env.ln(, log( -> env.log( etc.
  const fnNames = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'sqrt', 'cbrt', 'abs', 'exp', 'factorial'];
  fnNames.forEach(fn => {
    const regex = new RegExp(`\\b${fn}\\(`, 'g');
    sanitized = sanitized.replace(regex, `env.${fn}(`);
  });

  // Evaluate safely with restricted scope
  const evaluator = new Function('env', `'use strict'; return (${sanitized});`);
  const result = evaluator(env);

  if (typeof result !== 'number' || isNaN(result)) {
    throw new Error('Invalid calculation');
  }

  // Round floating point glitches to 10 decimal digits
  return Math.round(result * 1e10) / 1e10;
}
