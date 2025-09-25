<template>
  <div class="quiz-container">
    <div v-if="!isQuizStarted" class="quiz-setup">
      <header class="quiz-header">
        <button @click="goBack" class="btn-back">
          <i class="icon">←</i>
        </button>
        <h1>Quiz Setup</h1>
      </header>

      <div class="setup-content">
        <div class="setup-section">
          <h3>📚 Select Word Group</h3>
          <div class="group-selector">
            <div 
              v-for="group in wordGroups" 
              :key="group.id"
              class="group-option"
              :class="{ 'selected': selectedGroupId === group.id }"
              @click="selectGroup(group.id)"
            >
              <span class="group-icon">{{ group.icon }}</span>
              <div class="group-info">
                <div class="group-name">{{ group.name }}</div>
                <div class="group-count">{{ getGroupWordCount(group.id) }} words</div>
              </div>
            </div>
          </div>
        </div>

        <div class="setup-section" v-if="selectedGroupId">
          <h3>🎯 Word Range</h3>
          <div class="range-selector">
            <div class="range-inputs">
              <div class="input-group">
                <label>From word:</label>
                <input 
                  type="number" 
                  v-model.number="wordRange.from" 
                  :min="1" 
                  :max="maxWords"
                  class="range-input"
                >
              </div>
              <div class="input-group">
                <label>To word:</label>
                <input 
                  type="number" 
                  v-model.number="wordRange.to" 
                  :min="wordRange.from" 
                  :max="maxWords"
                  class="range-input"
                >
              </div>
            </div>
            <div class="range-info">
              Study {{ wordRange.to - wordRange.from + 1 }} words ({{ wordRange.from }}-{{ wordRange.to }})
            </div>
          </div>
        </div>

        <div class="setup-section">
          <h3>🎮 Quiz Mode</h3>
          <div class="mode-options">
            <div 
              class="mode-option"
              :class="{ 'selected': quizMode === 'write' }"
              @click="quizMode = 'write'"
            >
              <div class="mode-icon">✍️</div>
              <div class="mode-name">Write Answer</div>
              <div class="mode-desc">Type the translation</div>
            </div>
            <div 
              class="mode-option"
              :class="{ 'selected': quizMode === 'choice' }"
              @click="quizMode = 'choice'"
            >
              <div class="mode-icon">🎯</div>
              <div class="mode-name">Multiple Choice</div>
              <div class="mode-desc">Choose from 4 options</div>
            </div>
          </div>
        </div>

        <div class="setup-section">
          <h3>🔄 Translation Direction</h3>
          <div class="direction-options">
            <div 
              class="direction-option"
              :class="{ 'selected': direction === 'it-en' }"
              @click="direction = 'it-en'"
            >
              <div class="direction-flag">🇮🇹 → 🇬🇧</div>
              <div class="direction-desc">Italian to English</div>
            </div>
            <div 
              class="direction-option"
              :class="{ 'selected': direction === 'en-it' }"
              @click="direction = 'en-it'"
            >
              <div class="direction-flag">🇬🇧 → 🇮🇹</div>
              <div class="direction-desc">English to Italian</div>
            </div>
            <div 
              class="direction-option"
              :class="{ 'selected': direction === 'both' }"
              @click="direction = 'both'"
            >
              <div class="direction-flag">🔄</div>
              <div class="direction-desc">Both Directions</div>
            </div>
          </div>
        </div>

        <button 
          @click="startQuiz" 
          :disabled="!canStartQuiz"
          class="btn btn-primary start-quiz-btn"
        >
          🚀 Start Quiz ({{ quizWords.length }} words)
        </button>
      </div>
    </div>

    <div v-else-if="!showResults" class="quiz-game">
      <header class="quiz-header">
        <button @click="exitQuiz" class="btn-back">
          <i class="icon">←</i>
        </button>
        <div class="quiz-progress">
          <div class="progress-text">{{ currentQuestionIndex + 1 }} / {{ quizWords.length }}</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
        </div>
      </header>

      <div class="question-area" v-if="currentQuestion">
        <div class="question-type">
          {{ currentQuestion.direction === 'it-en' ? '🇮🇹 → 🇬🇧' : '🇬🇧 → 🇮🇹' }}
        </div>
        
        <div class="question-word">
          {{ currentQuestion.question }}
        </div>

        <div v-if="quizMode === 'write'" class="write-mode">
          <input 
            type="text" 
            v-model="userAnswer" 
            @keyup.enter="submitAnswer"
            placeholder="Type your answer..."
            class="answer-input"
            ref="answerInput"
            :disabled="showAnswerFeedback"
          >
          <button 
            @click="submitAnswer" 
            :disabled="!userAnswer.trim() || showAnswerFeedback"
            class="btn btn-primary submit-btn"
          >
            Submit
          </button>
        </div>

        <div v-if="quizMode === 'choice'" class="choice-mode">
          <div class="choice-options">
            <button
              v-for="(option, index) in currentQuestion.options"
              :key="index"
              @click="selectChoice(option)"
              :disabled="showAnswerFeedback"
              class="choice-option"
              :class="getChoiceClass(option)"
            >
              {{ option }}
            </button>
          </div>
        </div>

        <div v-if="showAnswerFeedback" class="answer-feedback">
          <div class="feedback-result" :class="{ 'correct': lastAnswerCorrect, 'wrong': !lastAnswerCorrect }">
            <div class="feedback-icon">
              {{ lastAnswerCorrect ? '✅' : '❌' }}
            </div>
            <div class="feedback-text">
              {{ lastAnswerCorrect ? 'Correct!' : 'Incorrect' }}
            </div>
          </div>
          
          <div class="correct-answer" v-if="!lastAnswerCorrect">
            <strong>Correct answer:</strong> {{ currentQuestion.correctAnswer }}
          </div>

          <div class="question-notes" v-if="currentQuestion.details">
            <strong>Notes:</strong> {{ currentQuestion.details }}
          </div>

          <button @click="nextQuestion" class="btn btn-primary next-btn">
            Next Question
          </button>
        </div>
      </div>
    </div>

    <div v-if="showResults" class="quiz-results">
      <header class="quiz-header">
        <h1>🎉 Quiz Complete!</h1>
      </header>

      <div class="results-content">
        <div class="score-display">
          <div class="score-circle">
            <div class="score-percentage">{{ Math.round(scorePercentage) }}%</div>
            <div class="score-fraction">{{ correctAnswers }} / {{ quizWords.length }}</div>
          </div>
        </div>

        <div class="results-stats">
          <div class="stat">
            <div class="stat-value">{{ correctAnswers }}</div>
            <div class="stat-label">Correct</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ incorrectAnswers }}</div>
            <div class="stat-label">Incorrect</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ quizWords.length }}</div>
            <div class="stat-label">Total</div>
          </div>
        </div>

        <div class="results-actions">
          <button @click="restartQuiz" class="btn btn-primary">
            🔄 Try Again
          </button>
          <button @click="goBack" class="btn btn-secondary">
            📚 Back to Home
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../composables/useAppStore'

const router = useRouter()
const { wordGroups, words: allWords, updateWordStats } = useAppStore()

const selectedGroupId = ref('')
const wordRange = ref({ from: 1, to: 10 })
const quizMode = ref<'write' | 'choice'>('choice')
const direction = ref<'it-en' | 'en-it' | 'both'>('it-en')

const isQuizStarted = ref(false)
const currentQuestionIndex = ref(0)
const userAnswer = ref('')
const selectedChoice = ref('')
const showAnswerFeedback = ref(false)
const lastAnswerCorrect = ref(false)
const showResults = ref(false)

const correctAnswers = ref(0)
const incorrectAnswers = ref(0)

const quizWords = ref<any[]>([])
const answerInput = ref<HTMLInputElement>()

// const selectedGroup = computed(() => wordGroups.value.find(g => g.id === selectedGroupId.value)) // removed unused

const groupWords = computed(() => {
  if (!selectedGroupId.value) return []
  return allWords.value.filter(word => 
    word.groupId === selectedGroupId.value && 
    word.learned !== true
  )
})

const maxWords = computed(() => groupWords.value.length)

const canStartQuiz = computed(() => {
  return selectedGroupId.value && 
         wordRange.value.from >= 1 && 
         wordRange.value.to <= maxWords.value &&
         wordRange.value.from <= wordRange.value.to
})

const currentQuestion = computed(() => {
  if (!quizWords.value.length || currentQuestionIndex.value >= quizWords.value.length) {
    return null
  }
  return quizWords.value[currentQuestionIndex.value]
})

const progressPercentage = computed(() => {
  if (!quizWords.value.length) return 0
  return (currentQuestionIndex.value / quizWords.value.length) * 100
})

const scorePercentage = computed(() => {
  if (!quizWords.value.length) return 0
  return (correctAnswers.value / quizWords.value.length) * 100
})

const goBack = () => {
  router.back()
}

const selectGroup = (groupId: string) => {
  selectedGroupId.value = groupId
  wordRange.value = { from: 1, to: Math.min(10, maxWords.value) }
}

const getGroupWordCount = (groupId: string) => {
  return allWords.value.filter(word => word.groupId === groupId).length
}

const generateQuizWords = () => {
  const selectedWords = groupWords.value.slice(
    wordRange.value.from - 1, 
    wordRange.value.to
  )
  
  const questions: any[] = []
  
  selectedWords.forEach(word => {
    if (direction.value === 'it-en' || direction.value === 'both') {
      questions.push({
        id: word.id,
        question: word.italian,
        correctAnswer: word.english,
        direction: 'it-en',
        details: word.details,
        word: word
      })
    }
    
    if (direction.value === 'en-it' || direction.value === 'both') {
      questions.push({
        id: word.id,
        question: word.english,
        correctAnswer: word.italian,
        direction: 'en-it',
        details: word.details,
        word: word
      })
    }
  })
  
  questions.sort(() => Math.random() - 0.5)
  
  if (quizMode.value === 'choice') {
    questions.forEach(question => {
      question.options = generateChoiceOptions(question)
    })
  }
  
  return questions
}

const generateChoiceOptions = (question: any) => {
  const correctAnswer = question.correctAnswer
  const allPossibleAnswers = direction.value === 'it-en' || question.direction === 'it-en'
    ? allWords.value.map(w => w.english)
    : allWords.value.map(w => w.italian)
  
  const wrongAnswers = allPossibleAnswers
    .filter(answer => answer !== correctAnswer)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
  
  const options = [correctAnswer, ...wrongAnswers]
  return options.sort(() => Math.random() - 0.5)
}

const startQuiz = () => {
  if (!canStartQuiz.value) return
  
  quizWords.value = generateQuizWords()
  isQuizStarted.value = true
  currentQuestionIndex.value = 0
  correctAnswers.value = 0
  incorrectAnswers.value = 0
  
  nextTick(() => {
    if (quizMode.value === 'write' && answerInput.value) {
      answerInput.value.focus()
    }
  })
}

const submitAnswer = () => {
  if (!userAnswer.value.trim() || showAnswerFeedback.value) return
  
  const isCorrect = checkAnswer(userAnswer.value.trim(), currentQuestion.value.correctAnswer)
  processAnswer(isCorrect)
}

const selectChoice = (choice: string) => {
  if (showAnswerFeedback.value) return
  
  selectedChoice.value = choice
  const isCorrect = choice === currentQuestion.value.correctAnswer
  processAnswer(isCorrect)
}

const checkAnswer = (userAnswer: string, correctAnswer: string) => {
  return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
}

const processAnswer = (isCorrect: boolean) => {
  lastAnswerCorrect.value = isCorrect
  showAnswerFeedback.value = true
  
  if (isCorrect) {
    correctAnswers.value++
    updateWordStats(currentQuestion.value.word.id, true)
  } else {
    incorrectAnswers.value++
    updateWordStats(currentQuestion.value.word.id, false)
  }
}

const getChoiceClass = (option: string) => {
  if (!showAnswerFeedback.value) return ''
  
  if (option === currentQuestion.value.correctAnswer) {
    return 'correct'
  } else if (option === selectedChoice.value && option !== currentQuestion.value.correctAnswer) {
    return 'wrong'
  }
  return ''
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < quizWords.value.length - 1) {
    currentQuestionIndex.value++
    userAnswer.value = ''
    selectedChoice.value = ''
    showAnswerFeedback.value = false
    
    nextTick(() => {
      if (quizMode.value === 'write' && answerInput.value) {
        answerInput.value.focus()
      }
    })
  } else {
    // Quiz complete
    showResults.value = true
  }
}

const restartQuiz = () => {
  isQuizStarted.value = false
  showResults.value = false
  currentQuestionIndex.value = 0
  userAnswer.value = ''
  selectedChoice.value = ''
  showAnswerFeedback.value = false
  correctAnswers.value = 0
  incorrectAnswers.value = 0
}

const exitQuiz = () => {
  if (confirm('Are you sure you want to exit the quiz? Progress will be lost.')) {
    restartQuiz()
  }
}

// Initialize with first group selected
onMounted(() => {
  if (wordGroups.value.length > 0) {
    selectGroup(wordGroups.value[0].id)
  }
})
</script>

<style scoped>
.quiz-container {
  min-height: 100vh;
  background: var(--bg-primary);
  padding-bottom: 2rem;
}

.quiz-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.btn-back {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: var(--bg-accent);
  color: var(--text-accent);
}

.quiz-header h1 {
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.quiz-progress {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.progress-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

.progress-bar {
  width: 100px;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--bg-accent);
  transition: width 0.3s ease;
}

.setup-content {
  padding: 2rem 1.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.setup-section {
  margin-bottom: 2rem;
}

.setup-section h3 {
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.group-selector {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.group-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.group-option:hover {
  border-color: var(--bg-accent);
  background: var(--bg-tertiary);
}

.group-option.selected {
  border-color: var(--bg-accent);
  background: var(--bg-accent);
  color: var(--text-accent);
}

.group-icon {
  font-size: 1.5rem;
}

.group-info {
  flex: 1;
}

.group-name {
  font-weight: 600;
  font-size: 1rem;
}

.group-count {
  font-size: 0.9rem;
  opacity: 0.8;
}

.range-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.range-inputs {
  display: flex;
  gap: 1rem;
}

.input-group {
  flex: 1;
}

.input-group label {
  display: block;
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.range-input {
  width: 100%;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
}

.range-info {
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-align: center;
  padding: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 8px;
}

.mode-options, .direction-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.mode-option, .direction-option {
  padding: 1rem;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.mode-option:hover, .direction-option:hover {
  border-color: var(--bg-accent);
  background: var(--bg-tertiary);
}

.mode-option.selected, .direction-option.selected {
  border-color: var(--bg-accent);
  background: var(--bg-accent);
  color: var(--text-accent);
}

.mode-icon, .direction-flag {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.mode-name, .direction-desc {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.mode-desc {
  font-size: 0.9rem;
  opacity: 0.8;
}

.start-quiz-btn {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 1rem;
}

.question-area {
  padding: 2rem 1.5rem;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.question-type {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.question-word {
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}



.write-mode {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.answer-input {
  width: 100%;
  max-width: 300px;
  padding: 1rem;
  font-size: 1.1rem;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-primary);
  text-align: center;
}

.answer-input:focus {
  border-color: var(--bg-accent);
  outline: none;
}

.submit-btn, .next-btn {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
}

.choice-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.choice-option {
  padding: 1rem;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.choice-option:hover:not(:disabled) {
  border-color: var(--bg-accent);
  background: var(--bg-tertiary);
}

.choice-option.correct {
  border-color: #10b981;
  background: #10b981;
  color: white;
}

.choice-option.wrong {
  border-color: #ef4444;
  background: #ef4444;
  color: white;
}

.answer-feedback {
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.feedback-result {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.feedback-result.correct {
  color: #10b981;
}

.feedback-result.wrong {
  color: #ef4444;
}

.feedback-icon {
  font-size: 1.5rem;
}

.feedback-text {
  font-size: 1.1rem;
  font-weight: 600;
}

.correct-answer {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.question-notes {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  font-style: italic;
  background: var(--bg-secondary);
  padding: 0.75rem;
  border-radius: 8px;
  border-left: 3px solid var(--primary-color);
}

.results-content {
  padding: 2rem 1.5rem;
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
}

.score-display {
  margin-bottom: 2rem;
}

.score-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: var(--bg-accent);
  color: var(--text-accent);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.score-percentage {
  font-size: 2rem;
  font-weight: 700;
}

.score-fraction {
  font-size: 0.9rem;
  opacity: 0.8;
}

.results-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 2rem;
}

.stat {
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.results-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--bg-accent);
  color: var(--text-accent);
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-secondary);
}

@media (max-width: 768px) {
  .range-inputs {
    flex-direction: column;
  }
  
  .mode-options, .direction-options {
    grid-template-columns: 1fr;
  }
  
  .choice-options {
    grid-template-columns: 1fr;
  }
  
  .results-actions {
    flex-direction: column;
  }
}
</style>