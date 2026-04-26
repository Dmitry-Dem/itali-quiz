export interface CrossConstraints {
  matchFirstDigit: boolean
  lastDigitsSum: number | null
}

export interface ArithmeticPreset {
  id: string
  name: string
  operations: string[]
  minNumber: number
  maxNumber: number
  operandCount: number
  allowNegatives: boolean
  integerDivision: boolean
  questionsPerSession: number
  powerK: number
  perfectRootsOnly: boolean
  operandDigits: (number | null)[]
  operandRanges: ({ min: number | null, max: number | null } | null)[]
  digitPatterns: ((number | null)[] | null)[]
  crossConstraints: CrossConstraints
  timeLimit: number | null
}

export interface Equation {
  display: string
  answer: number
}

export interface GameSetup {
  operations: string[]
  minNumber: number
  maxNumber: number
  operandCount: number
  allowNegatives: boolean
  integerDivision: boolean
  questionsPerSession: number
  presetName: string
  powerK: number
  perfectRootsOnly: boolean
  operandDigits: (number | null)[]
  operandRanges: ({ min: number | null, max: number | null } | null)[]
  digitPatterns: ((number | null)[] | null)[]
  crossConstraints: CrossConstraints
  timeLimit: number | null
}

const STORAGE_KEY = 'mykit-arithmetic-presets'

export const binaryOps = [
  { value: '+', symbol: '\u2795', label: 'Add' },
  { value: '-', symbol: '\u2796', label: 'Subtract' },
  { value: '\u00d7', symbol: '\u2716\ufe0f', label: 'Multiply' },
  { value: '\u00f7', symbol: '\u2797', label: 'Divide' },
]

export const unaryOps = [
  { value: 'n\u00b2', symbol: '\u00b2', label: 'Square' },
  { value: 'n\u00b3', symbol: '\u00b3', label: 'Cube' },
  { value: '\u221a', symbol: '\u221a', label: 'Sq Root' },
  { value: '\u221b', symbol: '\u221b', label: 'Cube Root' },
  { value: 'n\u1d4f', symbol: 'n\u1d4f', label: 'Power' },
]

export const availableOps = [...binaryOps, ...unaryOps]

export function isUnaryOp(op: string): boolean {
  return unaryOps.some(u => u.value === op)
}

export function defaultSetup(): GameSetup {
  return {
    operations: ['+', '-'],
    minNumber: 1,
    maxNumber: 100,
    operandCount: 2,
    allowNegatives: false,
    integerDivision: true,
    questionsPerSession: 20,
    presetName: '',
    powerK: 4,
    perfectRootsOnly: true,
    operandDigits: [null, null],
    operandRanges: [null, null],
    digitPatterns: [null, null],
    crossConstraints: { matchFirstDigit: false, lastDigitsSum: null },
    timeLimit: null,
  }
}

export function loadPresets(): ArithmeticPreset[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function savePresets(data: ArithmeticPreset[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateUnaryEquation(op: string, min: number, max: number, powerK: number, perfectRootsOnly: boolean): Equation | null {
  if (op === 'n\u00b2') {
    const n = randInt(min, max)
    return { display: n + '\u00b2 = ?', answer: n * n }
  }
  if (op === 'n\u00b3') {
    const n = randInt(min, max)
    return { display: n + '\u00b3 = ?', answer: n * n * n }
  }
  if (op === 'n\u1d4f') {
    const n = randInt(min, max)
    return { display: n + superscript(powerK) + ' = ?', answer: Math.pow(n, powerK) }
  }
  if (op === '\u221a') {
    if (perfectRootsOnly) {
      const sqrtMin = Math.max(1, Math.ceil(Math.sqrt(min)))
      const sqrtMax = Math.floor(Math.sqrt(max))
      if (sqrtMin > sqrtMax) return null
      const root = randInt(sqrtMin, sqrtMax)
      return { display: '\u221a' + (root * root) + ' = ?', answer: root }
    }
    const n = randInt(min, max)
    return { display: '\u221a' + n + ' = ?', answer: Math.round(Math.sqrt(n) * 100) / 100 }
  }
  if (op === '\u221b') {
    if (perfectRootsOnly) {
      const cbrtMin = Math.max(1, Math.ceil(Math.cbrt(min)))
      const cbrtMax = Math.floor(Math.cbrt(max))
      if (cbrtMin > cbrtMax) return null
      const root = randInt(cbrtMin, cbrtMax)
      return { display: '\u221b' + (root * root * root) + ' = ?', answer: root }
    }
    const n = randInt(min, max)
    return { display: '\u221b' + n + ' = ?', answer: Math.round(Math.cbrt(n) * 100) / 100 }
  }
  return null
}

function superscript(k: number): string {
  const map: Record<string, string> = { '0': '\u2070', '1': '\u00b9', '2': '\u00b2', '3': '\u00b3', '4': '\u2074', '5': '\u2075', '6': '\u2076', '7': '\u2077', '8': '\u2078', '9': '\u2079' }
  return String(k).split('').map(d => map[d] || d).join('')
}

function randForOperand(index: number, setup: GameSetup): number {
  const digits = setup.operandDigits[index]
  const pattern = setup.digitPatterns[index]
  if (digits != null && digits >= 1 && pattern && pattern.length === digits) {
    let num = 0
    for (let d = 0; d < digits; d++) {
      const fixed = pattern[d]
      if (fixed != null) {
        num = num * 10 + fixed
      } else {
        const lo = d === 0 && digits > 1 ? 1 : 0
        num = num * 10 + randInt(lo, 9)
      }
    }
    return num
  }
  if (digits != null && digits >= 1) {
    const lo = digits === 1 ? 0 : Math.pow(10, digits - 1)
    const hi = Math.pow(10, digits) - 1
    return randInt(lo, hi)
  }
  const range = setup.operandRanges[index]
  const lo = range?.min ?? setup.minNumber
  const hi = range?.max ?? setup.maxNumber
  return randInt(lo, hi)
}

function applyCrossConstraints(first: number, generated: number, cc: CrossConstraints, _index: number, setup: GameSetup): number {
  let n = generated
  const firstStr = String(Math.abs(first))
  const nStr = String(Math.abs(n))
  if (cc.matchFirstDigit && firstStr[0] !== nStr[0]) {
    const targetFirst = parseInt(firstStr[0])
    const nDigits = nStr.length
    const base = nDigits === 1 ? 0 : Math.pow(10, nDigits - 1)
    const oldFirstDigitContrib = parseInt(nStr[0]) * (nDigits === 1 ? 1 : Math.pow(10, nDigits - 1))
    const newFirstDigitContrib = targetFirst * (nDigits === 1 ? 1 : Math.pow(10, nDigits - 1))
    n = n - oldFirstDigitContrib + newFirstDigitContrib
    if (n < base && nDigits > 1) n = generated
  }
  if (cc.lastDigitsSum != null) {
    const firstLast = Math.abs(first) % 10
    const targetLast = cc.lastDigitsSum - firstLast
    if (targetLast < 0 || targetLast > 9) return generated
    const currentLast = Math.abs(n) % 10
    n = n - currentLast + targetLast
    if (n <= 0) n += 10
  }
  return n
}

function generateBinaryEquation(setup: GameSetup, binaryOps: string[]): Equation | null {
  const { operandCount, allowNegatives, integerDivision, crossConstraints } = setup
  for (let attempt = 0; attempt < 200; attempt++) {
    const first = randForOperand(0, setup)
    if (crossConstraints.lastDigitsSum != null) {
      const firstLast = Math.abs(first) % 10
      const needed = crossConstraints.lastDigitsSum - firstLast
      if (needed < 0 || needed > 9) continue
    }
    const nums: number[] = [first]
    const ops: string[] = []
    for (let i = 1; i < operandCount; i++) {
      ops.push(binaryOps[Math.floor(Math.random() * binaryOps.length)])
      let n = randForOperand(i, setup)
      if (i === 1) n = applyCrossConstraints(nums[0], n, crossConstraints, i, setup)
      nums.push(n)
    }
    let valid = true
    let result = nums[0]
    for (let i = 0; i < ops.length; i++) {
      const op = ops[i]
      const b = nums[i + 1]
      if (op === '\u00f7') {
        if (b === 0) { valid = false; break }
        if (integerDivision && result % b !== 0) { valid = false; break }
        result = integerDivision ? result / b : Math.round((result / b) * 10) / 10
      } else if (op === '+') {
        result = result + b
      } else if (op === '-') {
        result = result - b
        if (!allowNegatives && result < 0) { valid = false; break }
      } else {
        result = result * b
      }
    }
    if (!valid) continue
    const parts: string[] = [String(nums[0])]
    for (let i = 0; i < ops.length; i++) parts.push(ops[i], String(nums[i + 1]))
    return { display: parts.join(' ') + ' = ?', answer: result }
  }
  return null
}

export function generateEquation(setup: GameSetup): Equation {
  const { operations, minNumber, maxNumber, powerK } = setup
  const selectedBinary = operations.filter(op => !isUnaryOp(op))
  const selectedUnary = operations.filter(op => isUnaryOp(op))
  const pool: string[] = []
  if (selectedBinary.length > 0) pool.push('binary')
  if (selectedUnary.length > 0) pool.push('unary')
  for (let i = 0; i < 50; i++) {
    const pick = pool[Math.floor(Math.random() * pool.length)]
    if (pick === 'unary') {
      const op = selectedUnary[Math.floor(Math.random() * selectedUnary.length)]
      const eq = generateUnaryEquation(op, minNumber, maxNumber, powerK, setup.perfectRootsOnly)
      if (eq) return eq
    } else {
      const eq = generateBinaryEquation(setup, selectedBinary)
      if (eq) return eq
    }
  }
  return { display: '1 + 1 = ?', answer: 2 }
}

export function presetFromSetup(setup: GameSetup): ArithmeticPreset {
  return {
    id: Date.now().toString(),
    name: setup.presetName.trim(),
    operations: [...setup.operations],
    minNumber: setup.minNumber,
    maxNumber: setup.maxNumber,
    operandCount: setup.operandCount,
    allowNegatives: setup.allowNegatives,
    integerDivision: setup.integerDivision,
    questionsPerSession: setup.questionsPerSession,
    powerK: setup.powerK,
    perfectRootsOnly: setup.perfectRootsOnly,
    operandDigits: [...setup.operandDigits],
    operandRanges: setup.operandRanges.map(r => r ? { ...r } : null),
    digitPatterns: setup.digitPatterns.map(p => p ? [...p] : null),
    crossConstraints: { ...setup.crossConstraints },
    timeLimit: setup.timeLimit,
  }
}

export function setupFromPreset(preset: ArithmeticPreset): GameSetup {
  return {
    operations: [...preset.operations],
    minNumber: preset.minNumber,
    maxNumber: preset.maxNumber,
    operandCount: preset.operandCount,
    allowNegatives: preset.allowNegatives,
    integerDivision: preset.integerDivision,
    questionsPerSession: preset.questionsPerSession,
    presetName: '',
    powerK: preset.powerK || 4,
    perfectRootsOnly: preset.perfectRootsOnly !== false,
    operandDigits: preset.operandDigits || [null, null],
    operandRanges: preset.operandRanges || [null, null],
    digitPatterns: preset.digitPatterns || [null, null],
    crossConstraints: preset.crossConstraints || { matchFirstDigit: false, lastDigitsSum: null },
    timeLimit: preset.timeLimit ?? null,
  }
}

export function presetSummary(p: ArithmeticPreset): string {
  return p.operations.join(' ') + ' \u00b7 ' + p.minNumber + '\u2013' + p.maxNumber + ' \u00b7 ' + p.operandCount + ' numbers \u00b7 ' + p.questionsPerSession + 'q'
}
