<template>
  <div>
    <SessionStatsModal
      v-if="sessionDone"
      :correct-answers="correct"
      :incorrect-answers="wrong"
      :total-questions="total"
      :time-taken="totalTime"
      mode="math"
      @close="$emit('back-to-setup')"
      @restart="restart"
    />

    <div v-else>
      <div class="practice-header">
        <button @click="$emit('quit')" class="btn-back">✕</button>
        <span class="progress-text">{{ currentIndex + 1 }} / {{ total }}</span>
        <div class="score-info">
          <span v-if="setup.timeLimit" class="timer" :class="{ 'timer-low': timeLeft <= 3 }">⏱ {{ timeLeft }}s</span>
          <span class="score-correct">✅ {{ correct }}</span>
          <span class="score-wrong">❌ {{ wrong }}</span>
        </div>
      </div>

      <div v-if="setup.timeLimit" class="timer-bar-track">
        <div class="timer-bar-fill" :class="{ 'timer-bar-low': timerProgress <= 0.25 }" :style="{ width: (timerProgress * 100) + '%' }" />
      </div>

      <div class="question-area" :class="feedback">
        <div class="equation-text">{{ currentEquation?.display }}</div>
        <div v-if="!setup.perfectRootsOnly" class="hint-text">Round to 2 decimal places</div>
      </div>

      <div class="feedback-line" :class="feedback">
        <template v-if="feedback === 'correct'">✅ Correct!</template>
        <template v-else-if="feedback === 'timeout'">⏱ Time's up! Answer: <strong>{{ currentEquation?.answer }}</strong></template>
        <template v-else-if="feedback === 'wrong'">❌ Answer: <strong>{{ currentEquation?.answer }}</strong></template>
        <template v-else>&nbsp;</template>
      </div>

      <div class="answer-display" :class="{ disabled: feedback !== '' }">{{ userAnswer || '?' }}</div>

      <div class="numpad">
        <button v-for="n in [1,2,3,4,5,6,7,8,9]" :key="n" class="numpad-btn" :disabled="feedback !== ''" @click="pressKey(String(n))">{{ n }}</button>
        <button class="numpad-btn" :disabled="feedback !== ''" @click="pressKey('.')">.</button>
        <button class="numpad-btn" :disabled="feedback !== ''" @click="pressKey('0')">0</button>
        <button class="numpad-btn numpad-del" :disabled="feedback !== ''" @click="deleteLast">⌫</button>
        <button class="numpad-btn numpad-neg" :disabled="feedback !== ''" @click="toggleNeg">±</button>
        <button v-if="feedback === ''" class="numpad-btn numpad-submit" @click="submitAnswer">Submit</button>
        <button v-else class="numpad-btn numpad-submit" @click="nextQuestion">Next →</button>
        <button class="numpad-btn numpad-skip" :disabled="feedback !== ''" @click="skipQuestion">⏭</button>
      </div>

      <div class="nav-row">
        <button @click="prevQuestion" class="btn btn-secondary" :disabled="currentIndex === 0 || feedback === ''">← Prev</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { type GameSetup, type Equation, generateEquation } from '../../composables/useArithmeticEngine'
import SessionStatsModal from '../SessionStatsModal.vue'

const props = defineProps<{ setup: GameSetup }>()
defineEmits<{ 'back-to-setup': [], quit: [] }>()

const total = props.setup.questionsPerSession
const userAnswer = ref('')
const feedback = ref<'' | 'correct' | 'wrong' | 'timeout'>('')
const correct = ref(0)
const wrong = ref(0)
const currentIndex = ref(0)
const sessionDone = ref(false)
const totalTime = ref(0)
const timeLeft = ref(props.setup.timeLimit ?? 0)
const timerProgress = ref(1)

const history = ref<{ equation: Equation, userAnswer: string, result: 'correct' | 'wrong' | 'timeout' | 'skipped' }[]>([])
const currentEquation = ref<Equation | null>(generateEquation(props.setup))

let autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null
let timerStart = 0
const sessionStart = Date.now()

onUnmounted(() => {
  if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer)
  stopCountdown()
})

function startCountdown() {
  if (!props.setup.timeLimit) return
  timeLeft.value = props.setup.timeLimit
  timerProgress.value = 1
  timerStart = Date.now()
  stopCountdown()
  countdownTimer = setInterval(() => {
    const elapsed = (Date.now() - timerStart) / 1000
    const remaining = Math.max(0, props.setup.timeLimit! - elapsed)
    timeLeft.value = Math.ceil(remaining)
    timerProgress.value = remaining / props.setup.timeLimit!
    if (remaining <= 0) {
      stopCountdown()
      onTimeout()
    }
  }, 50)
}

function stopCountdown() {
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null }
}

function onTimeout() {
  if (feedback.value !== '') return
  wrong.value++
  feedback.value = 'timeout'
  timerProgress.value = 0
  timeLeft.value = 0
}

function pressKey(key: string) {
  if (feedback.value !== '') return
  if (key === '.' && userAnswer.value.includes('.')) return
  userAnswer.value += key
}

function deleteLast() {
  if (feedback.value !== '') return
  userAnswer.value = userAnswer.value.slice(0, -1)
}

function toggleNeg() {
  if (feedback.value !== '') return
  if (userAnswer.value.startsWith('-')) {
    userAnswer.value = userAnswer.value.slice(1)
  } else {
    userAnswer.value = '-' + userAnswer.value
  }
}

function submitAnswer() {
  if (userAnswer.value === '' || currentEquation.value === null) return
  stopCountdown()
  const userNum = parseFloat(userAnswer.value)
  const expected = currentEquation.value.answer
  const match = Math.abs(userNum - expected) < 0.005
  if (match) {
    correct.value++
    feedback.value = 'correct'
    history.value.push({ equation: currentEquation.value, userAnswer: userAnswer.value, result: 'correct' })
    autoAdvanceTimer = setTimeout(() => nextQuestion(), 800)
  } else {
    wrong.value++
    feedback.value = 'wrong'
    history.value.push({ equation: currentEquation.value, userAnswer: userAnswer.value, result: 'wrong' })
  }
}

function skipQuestion() {
  if (feedback.value !== '' || !currentEquation.value) return
  stopCountdown()
  wrong.value++
  feedback.value = 'wrong'
  history.value.push({ equation: currentEquation.value, userAnswer: '', result: 'skipped' })
}

function nextQuestion() {
  if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null }
  stopCountdown()
  currentIndex.value++
  if (currentIndex.value >= total) {
    totalTime.value = Math.round((Date.now() - sessionStart) / 1000)
    sessionDone.value = true
    return
  }
  feedback.value = ''
  userAnswer.value = ''
  currentEquation.value = generateEquation(props.setup)
  startCountdown()
}

function prevQuestion() {
  if (currentIndex.value === 0 || feedback.value === '') return
  if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null }
  stopCountdown()
  const prev = history.value[currentIndex.value - 1]
  if (!prev) return
  const prevResult = prev.result
  if (prevResult === 'correct') correct.value--
  else wrong.value--
  history.value.pop()
  currentIndex.value--
  currentEquation.value = prev.equation
  feedback.value = ''
  userAnswer.value = ''
  startCountdown()
}

function restart() {
  correct.value = 0
  wrong.value = 0
  currentIndex.value = 0
  sessionDone.value = false
  feedback.value = ''
  userAnswer.value = ''
  history.value = []
  currentEquation.value = generateEquation(props.setup)
  startCountdown()
}

startCountdown()
</script>

<style scoped>
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

.practice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.5rem;
}

.progress-text {
  font-size: 1rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.score-info {
  display: flex;
  gap: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}

.score-correct { color: #10b981; }
.score-wrong { color: #ef4444; }

.timer {
  font-weight: 600;
  color: var(--text-secondary);
  transition: color 0.3s;
}

.timer-low {
  color: #ef4444;
  animation: pulse 0.5s infinite alternate;
}

@keyframes pulse {
  from { opacity: 1; }
  to { opacity: 0.5; }
}

.timer-bar-track {
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.timer-bar-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 2px;
  transition: none;
}

.timer-bar-low {
  background: #ef4444;
}

.question-area {
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 1rem;
  padding: 3rem 2rem;
  text-align: center;
  margin-bottom: 1rem;
  transition: border-color 0.3s, background-color 0.3s;
}

.question-area.correct {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.06);
}

.question-area.wrong, .question-area.timeout {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
}

.equation-text {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.05em;
}

.hint-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.feedback-line {
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
  min-height: 1.75rem;
  margin-bottom: 0.75rem;
}

.feedback-line.correct { color: #10b981; }
.feedback-line.wrong, .feedback-line.timeout { color: #ef4444; }

.answer-display {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.answer-display.disabled {
  opacity: 0.5;
}

.numpad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  max-width: 320px;
  margin: 0 auto;
}

.numpad-btn {
  padding: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.numpad-btn:active:not(:disabled) {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.numpad-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.numpad-submit {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.numpad-submit:active:not(:disabled) {
  opacity: 0.8;
}

.numpad-del, .numpad-neg, .numpad-skip {
  font-size: 1rem;
}

.nav-row {
  display: flex;
  justify-content: center;
  margin-top: 0.75rem;
}

@media (max-width: 768px) {
  .equation-text {
    font-size: 2rem;
  }
  .question-area {
    padding: 2rem 1rem;
  }
  .numpad {
    max-width: 100%;
  }
}
</style>
