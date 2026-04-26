<template>
  <div>
    <div class="page-header">
      <button @click="$emit('back')" class="btn-back">&larr; Back</button>
      <h1>Setup</h1>
    </div>

    <div class="setup-form">
      <div class="setup-section">
        <h3>Binary Operations</h3>
        <div class="ops-grid">
          <button
            v-for="op in binaryOps"
            :key="op.value"
            type="button"
            class="op-btn"
            :class="{ active: setup.operations.includes(op.value) }"
            @click="toggleOp(op.value)"
          >{{ op.symbol }} {{ op.label }}</button>
        </div>
      </div>

      <div class="setup-section">
        <h3>Unary Operations</h3>
        <div class="ops-grid">
          <button
            v-for="op in unaryOps"
            :key="op.value"
            type="button"
            class="op-btn"
            :class="{ active: setup.operations.includes(op.value) }"
            @click="toggleOp(op.value)"
          >{{ op.symbol }} {{ op.label }}</button>
        </div>
        <div v-if="setup.operations.includes('n\u1d4f')" class="power-input">
          <label>Power (k)</label>
          <input v-model.number="setup.powerK" type="number" min="2" max="20" class="form-input narrow" />
        </div>
        <p v-if="setup.operations.length === 0" class="validation-msg">Pick at least one operation</p>
      </div>

      <div class="setup-section">
        <h3>Number Range</h3>
        <div class="range-inputs">
          <div class="input-group">
            <label>Min</label>
            <input v-model.number="setup.minNumber" type="number" min="0" max="9999" class="form-input" />
          </div>
          <div class="input-group">
            <label>Max</label>
            <input v-model.number="setup.maxNumber" type="number" min="1" max="9999" class="form-input" />
          </div>
        </div>
      </div>

      <div class="setup-section" v-if="hasBinaryOps">
        <h3>Numbers per Equation</h3>
        <div class="selector-row">
          <button
            v-for="n in [2, 3, 4]"
            :key="n"
            type="button"
            class="selector-btn"
            :class="{ active: setup.operandCount === n }"
            @click="setOperandCount(n)"
          >{{ n }}</button>
        </div>
      </div>

      <div class="setup-section" v-if="hasBinaryOps">
        <h3>Per-Operand Constraints <span class="optional">(optional)</span></h3>
        <p class="section-hint">Leave defaults to use the global range above</p>
        <div class="operand-constraints-grid">
          <div v-for="i in setup.operandCount" :key="i" class="operand-constraint-card">
            <div class="operand-constraint-header">Operand {{ i }}</div>
            <div class="constraint-row">
              <label>Digits</label>
              <select :value="setup.operandDigits[i - 1]" @change="setDigitCount(i - 1, $event)" class="form-input narrow">
                <option :value="null">Any</option>
                <option v-for="d in 7" :key="d" :value="d">{{ d }}-digit</option>
              </select>
            </div>
            <div v-if="setup.operandDigits[i - 1] != null && setup.digitPatterns[i - 1]" class="digit-pattern-row">
              <label>Pattern</label>
              <div class="digit-pattern-slots">
                <select
                  v-for="(_, d) in setup.digitPatterns[i - 1]!"
                  :key="d"
                  v-model="setup.digitPatterns[i - 1]![d]"
                  class="digit-slot"
                >
                  <option :value="null">*</option>
                  <option v-for="n in (d === 0 && setup.operandDigits[i - 1]! > 1 ? 9 : 10)" :key="n" :value="d === 0 && setup.operandDigits[i - 1]! > 1 ? n : n - 1">
                    {{ d === 0 && setup.operandDigits[i - 1]! > 1 ? n : n - 1 }}
                  </option>
                </select>
              </div>
            </div>
            <div class="constraint-row" v-if="setup.operandDigits[i - 1] == null">
              <label>Min</label>
              <input
                type="number"
                class="form-input narrow"
                :value="setup.operandRanges[i - 1]?.min"
                :placeholder="String(setup.minNumber)"
                @change="setOperandRangeField(i - 1, 'min', $event)"
              />
            </div>
            <div class="constraint-row" v-if="setup.operandDigits[i - 1] == null">
              <label>Max</label>
              <input
                type="number"
                class="form-input narrow"
                :value="setup.operandRanges[i - 1]?.max"
                :placeholder="String(setup.maxNumber)"
                @change="setOperandRangeField(i - 1, 'max', $event)"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="setup-section" v-if="hasBinaryOps && setup.operandCount >= 2">
        <h3>Cross-Operand Constraints <span class="optional">(optional)</span></h3>
        <p class="section-hint">Link operand 1 and 2 together</p>
        <div class="toggle-row">
          <label>First digits must match</label>
          <input v-model="setup.crossConstraints.matchFirstDigit" type="checkbox" />
        </div>
        <div class="toggle-row">
          <label>Last digits sum to</label>
          <div class="inline-input">
            <input
              type="number"
              class="form-input narrow"
              min="0"
              max="18"
              :value="setup.crossConstraints.lastDigitsSum"
              :placeholder="'off'"
              @change="setLastDigitsSum($event)"
            />
          </div>
        </div>
      </div>

      <div class="setup-section">
        <h3>Questions per Session</h3>
        <input v-model.number="setup.questionsPerSession" type="number" min="1" max="200" class="form-input narrow" />
      </div>

      <div class="setup-section">
        <h3>Time Limit per Question</h3>
        <div class="selector-row">
          <button
            v-for="t in timeLimitOptions"
            :key="t.value ?? 'off'"
            type="button"
            class="selector-btn"
            :class="{ active: setup.timeLimit === t.value }"
            @click="setup.timeLimit = t.value"
          >{{ t.label }}</button>
          <input
            type="number"
            class="form-input narrow"
            min="1"
            max="300"
            :value="customTimeLimit"
            placeholder="Custom"
            @change="setCustomTimeLimit($event)"
          />
        </div>
      </div>

      <div class="setup-section">
        <div class="toggle-row">
          <label>Allow negative results</label>
          <input v-model="setup.allowNegatives" type="checkbox" />
        </div>
        <div class="toggle-row" v-if="setup.operations.includes('\u00f7')">
          <label>Integer division only</label>
          <input v-model="setup.integerDivision" type="checkbox" />
        </div>
        <div class="toggle-row" v-if="hasRootOps">
          <label>Perfect roots only (integer answers)</label>
          <input v-model="setup.perfectRootsOnly" type="checkbox" />
        </div>
      </div>

      <div class="setup-section">
        <h3>Save as Preset <span class="optional">(optional)</span></h3>
        <input v-model="setup.presetName" type="text" placeholder="Preset name..." class="form-input" maxlength="40" />
      </div>

      <button @click="$emit('start', setup)" class="btn btn-primary btn-start" :disabled="setup.operations.length === 0">
        Start
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  type GameSetup,
  binaryOps,
  unaryOps,
  isUnaryOp,
  defaultSetup,
} from '../../composables/useArithmeticEngine'

const props = defineProps<{ initial?: GameSetup }>()
defineEmits<{ back: [], start: [setup: GameSetup] }>()

const setup = ref<GameSetup>(props.initial ? { ...props.initial } : defaultSetup())

const timeLimitOptions = [
  { value: null, label: 'Off' },
  { value: 5, label: '5s' },
  { value: 10, label: '10s' },
  { value: 15, label: '15s' },
  { value: 20, label: '20s' },
  { value: 30, label: '30s' },
  { value: 60, label: '60s' },
]

const presetValues = timeLimitOptions.map(t => t.value)
const customTimeLimit = computed(() => {
  const v = setup.value.timeLimit
  return v != null && !presetValues.includes(v) ? v : ''
})

function setCustomTimeLimit(event: Event) {
  const val = (event.target as HTMLInputElement).value
  setup.value.timeLimit = val === '' ? null : Number(val)
}

const hasBinaryOps = computed(() => setup.value.operations.some(op => !isUnaryOp(op)))
const hasRootOps = computed(() => setup.value.operations.includes('\u221a') || setup.value.operations.includes('\u221b'))

function toggleOp(op: string) {
  const idx = setup.value.operations.indexOf(op)
  if (idx >= 0) {
    setup.value.operations.splice(idx, 1)
  } else {
    setup.value.operations.push(op)
  }
}

function setOperandCount(n: number) {
  setup.value.operandCount = n
  while (setup.value.operandDigits.length < n) setup.value.operandDigits.push(null)
  setup.value.operandDigits.length = n
  while (setup.value.operandRanges.length < n) setup.value.operandRanges.push(null)
  setup.value.operandRanges.length = n
  while (setup.value.digitPatterns.length < n) setup.value.digitPatterns.push(null)
  setup.value.digitPatterns.length = n
}

function setDigitCount(index: number, event: Event) {
  const val = (event.target as HTMLSelectElement).value
  const count = val === 'null' ? null : Number(val)
  setup.value.operandDigits[index] = count
  setup.value.digitPatterns[index] = count != null ? Array(count).fill(null) : null
}

function setOperandRangeField(index: number, field: 'min' | 'max', event: Event) {
  const val = (event.target as HTMLInputElement).value
  const num = val === '' ? null : Number(val)
  const current = setup.value.operandRanges[index]
  const updated = { min: current?.min ?? null, max: current?.max ?? null, [field]: num }
  setup.value.operandRanges[index] = updated.min == null && updated.max == null ? null : updated
}

function setLastDigitsSum(event: Event) {
  const val = (event.target as HTMLInputElement).value
  setup.value.crossConstraints.lastDigitsSum = val === '' ? null : Number(val)
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.btn-back {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  transition: color 0.2s, background 0.2s;
}

.btn-back:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.setup-form {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.setup-section h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem;
}

.optional {
  font-weight: 400;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.ops-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.op-btn {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s;
}

.op-btn:hover {
  border-color: var(--primary-color);
  color: var(--text-primary);
}

.op-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
}

.range-inputs {
  display: flex;
  gap: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
}

.input-group label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.form-input {
  padding: 0.6rem 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  color: var(--text-primary);
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-input.narrow {
  max-width: 120px;
}

.selector-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.selector-btn {
  width: 56px;
  height: 48px;
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
}

.selector-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
}

.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 0.95rem;
}

.toggle-row:last-child {
  border-bottom: none;
}

.inline-input {
  display: flex;
  align-items: center;
}

.inline-input .form-input.narrow {
  max-width: 80px;
  text-align: center;
}

.validation-msg {
  margin-top: 0.5rem;
  color: #ef4444;
  font-size: 0.85rem;
}

.power-input {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.btn-start {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.section-hint {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.operand-constraints-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.operand-constraint-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 0.75rem;
}

.operand-constraint-header {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.constraint-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.3rem 0;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.constraint-row label {
  min-width: 45px;
}

.digit-pattern-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.3rem 0;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.digit-pattern-row label {
  min-width: 45px;
}

.digit-pattern-slots {
  display: flex;
  gap: 0.35rem;
}

.digit-slot {
  width: 44px;
  padding: 0.4rem 0.2rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.35rem;
  color: var(--text-primary);
  font-size: 0.9rem;
  text-align: center;
  appearance: auto;
}

.digit-slot:focus {
  outline: none;
  border-color: var(--primary-color);
}
</style>
