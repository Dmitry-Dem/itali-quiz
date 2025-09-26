<template>
  <div class="flashcards-container">
    <header class="flashcards-header">
      <button @click="goBack" class="btn-back">
        <i class="icon">←</i>
      </button>
      <h1>{{ isAllWords ? 'All Words' : selectedGroup?.name }} Flashcards</h1>
      <div class="progress">
        {{ currentIndex + 1 }} / {{ words.length }}
      </div>
    </header>

    <div class="flashcard-area" v-if="words.length > 0">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>

      <div class="card-stack">
        <div 
          v-for="(word, index) in visibleWords" 
          :key="word.id"
          class="flashcard"
          :class="{ 
            'current': index === 0,
            'next': index === 1,
            'flipped': index === 0 && isFlipped,
            'swiping-right': index === 0 && swipeDirection === 'right',
            'swiping-left': index === 0 && swipeDirection === 'left'
          }"
          :style="index === 0 ? cardTransform : {}"
          @click="index === 0 && flipCard()"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
          @mousedown="handleMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
        >
          <div class="card-inner">
            <div class="card-front">
              <div class="language-label">Italian</div>
              <div class="word-text">{{ word.italian }}</div>
              <div class="tap-hint" v-if="index === 0">Tap to reveal</div>
            </div>
            <div class="card-back">
              <div class="language-label">English</div>
              <div class="word-text">{{ word.english }}</div>
              <div class="word-details" v-if="word.details">
                {{ word.details }}
              </div>
              <div class="word-example" v-if="word.example">
                "{{ word.example }}"
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="swipe-hints">
        <div class="hint left">
          <div class="icon">👎</div>
          <div class="text">Hard</div>
        </div>
        <div class="hint right">
          <div class="icon">👍</div>
          <div class="text">Easy</div>
        </div>
      </div>

      <div class="action-buttons">
        <button @click="markHard" class="btn btn-hard">
          <i class="icon">👎</i>
          Hard
        </button>
        <button @click="flipCard" class="btn btn-flip">
          <i class="icon">🔄</i>
          Flip
        </button>
        <button @click="markEasy" class="btn btn-easy">
          <i class="icon">👍</i>
          Easy
        </button>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">📚</div>
      <h3>No words available</h3>
      <p>Add some words to start studying with flashcards!</p>
      <router-link :to="isAllWords ? '/groups' : `/groups/${groupId}/words`" class="btn btn-primary">
        Add Words
      </router-link>
    </div>

    <div v-if="showCompleteModal" class="modal-overlay" @click="closeCompleteModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>🎉 Session Complete!</h3>
        </div>
        <div class="modal-body">
          <div class="stats">
            <div class="stat">
              <div class="stat-value">{{ sessionStats.total }}</div>
              <div class="stat-label">Total Cards</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ sessionStats.easy }}</div>
              <div class="stat-label">Easy</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ sessionStats.hard }}</div>
              <div class="stat-label">Hard</div>
            </div>
          </div>
          <p>Keep up the great work!</p>
        </div>
        <div class="modal-actions">
          <button @click="restartSession" class="btn btn-primary">Study Again</button>
          <button @click="goBack" class="btn btn-secondary">Done</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '../composables/useAppStore'

const route = useRoute()
const router = useRouter()
const { wordGroups, words: allWords, updateWordStats } = useAppStore()

const groupId = ref(route.params.groupId as string)
const isAllWords = computed(() => groupId.value === 'all')
const selectedGroup = computed(() => wordGroups.value.find((g: any) => g.id === groupId.value))

const currentIndex = ref(0)
const isFlipped = ref(false)
const showCompleteModal = ref(false)

const isDragging = ref(false)
const startX = ref(0)
const currentX = ref(0)
const swipeThreshold = 100
const swipeDirection = ref<'left' | 'right' | null>(null)

const sessionStats = ref({
  total: 0,
  easy: 0,
  hard: 0
})

const shuffleArray = (array: any[]) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const words = computed(() => {
  let filteredWords
  if (isAllWords.value) {
    filteredWords = allWords.value.filter(word => word.learned !== true)
  } else {
    filteredWords = allWords.value.filter(word => word.groupId === groupId.value && word.learned !== true)
  }
  return shuffleArray(filteredWords)
})

const visibleWords = computed(() => {
  return words.value.slice(currentIndex.value, currentIndex.value + 2)
})

const progressPercentage = computed(() => {
  if (words.value.length === 0) return 0
  return ((currentIndex.value) / words.value.length) * 100
})

const cardTransform = computed(() => {
  if (!isDragging.value) return {}
  const deltaX = currentX.value - startX.value
  const rotation = deltaX * 0.1
  return {
    transform: `translateX(${deltaX}px) rotate(${rotation}deg)`,
    opacity: 1 - Math.abs(deltaX) / 300
  }
})

const flipCard = () => {
  isFlipped.value = !isFlipped.value
}

const nextCard = () => {
  if (currentIndex.value < words.value.length - 1) {
    currentIndex.value++
    isFlipped.value = false
  } else {
    showCompleteModal.value = true
  }
}

const markEasy = () => {
  const currentWord = words.value[currentIndex.value]
  if (currentWord) {
    updateWordStats(currentWord.id, true)
    sessionStats.value.easy++
    sessionStats.value.total++
    
    swipeDirection.value = 'right'
    setTimeout(() => {
      swipeDirection.value = null
      nextCard()
    }, 300)
  }
}

const markHard = () => {
  const currentWord = words.value[currentIndex.value]
  if (currentWord) {
    updateWordStats(currentWord.id, false)
    sessionStats.value.hard++
    sessionStats.value.total++
    
    swipeDirection.value = 'left'
    setTimeout(() => {
      swipeDirection.value = null
      nextCard()
    }, 300)
  }
}

const handleSwipe = (direction: 'left' | 'right') => {
  if (direction === 'right') {
    markEasy()
  } else {
    markHard()
  }
}

const handleTouchStart = (e: TouchEvent) => {
  isDragging.value = true
  startX.value = e.touches[0].clientX
  currentX.value = e.touches[0].clientX
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return
  e.preventDefault()
  currentX.value = e.touches[0].clientX
}

const handleTouchEnd = () => {
  if (!isDragging.value) return
  
  const deltaX = currentX.value - startX.value
  
  if (Math.abs(deltaX) > swipeThreshold) {
    handleSwipe(deltaX > 0 ? 'right' : 'left')
  }
  
  isDragging.value = false
  currentX.value = 0
}

const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  startX.value = e.clientX
  currentX.value = e.clientX
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  currentX.value = e.clientX
}

const handleMouseUp = () => {
  if (!isDragging.value) return
  
  const deltaX = currentX.value - startX.value
  
  if (Math.abs(deltaX) > swipeThreshold) {
    handleSwipe(deltaX > 0 ? 'right' : 'left')
  }
  
  isDragging.value = false
  currentX.value = 0
}

const restartSession = () => {
  currentIndex.value = 0
  isFlipped.value = false
  sessionStats.value = { total: 0, easy: 0, hard: 0 }
  showCompleteModal.value = false
}

const closeCompleteModal = () => {
  showCompleteModal.value = false
}

const goBack = () => {
  router.back()
}

const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.code) {
    case 'Space':
      e.preventDefault()
      flipCard()
      break
    case 'ArrowLeft':
      e.preventDefault()
      markHard()
      break
    case 'ArrowRight':
      e.preventDefault()
      markEasy()
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.flashcards-container {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 0 1rem 2rem 1rem;
}

.flashcards-header {
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
  border-color: var(--bg-accent);
}

.flashcards-header h1 {
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
  text-align: center;
}

.progress {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.9rem;
}

.flashcard-area {
  padding: 2rem 1.5rem;
  max-width: 400px;
  margin: 0 auto;
  background: var(--bg-secondary);
  border-radius: 20px;
  margin-top: 1rem;
  box-shadow: var(--shadow-sm);
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  margin-bottom: 2rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.card-stack {
  position: relative;
  height: 400px;
  margin-bottom: 2rem;
}

.flashcard {
  position: absolute;
  width: 100%;
  height: 100%;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
}

.flashcard.current {
  z-index: 2;
}

.flashcard.next {
  z-index: 1;
  transform: scale(0.95) translateY(10px);
  opacity: 0.7;
}

.flashcard.swiping-right {
  animation: swipeRight 0.3s ease-out forwards;
}

.flashcard.swiping-left {
  animation: swipeLeft 0.3s ease-out forwards;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.flashcard.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.card-back {
  transform: rotateY(180deg);
}

.language-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1rem;
}

.word-text {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  line-height: 1.2;
}

.word-details {
  font-size: 1rem;
  color: var(--text-secondary);
  font-style: italic;
  margin-top: 1rem;
}

.word-example {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: 10px;
  border-left: 3px solid var(--primary-color);
}

.tap-hint {
  position: absolute;
  bottom: 1rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
  opacity: 0.7;
}

.swipe-hints {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  opacity: 0.7;
}

.hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
}

.hint .icon {
  font-size: 2rem;
}

.hint .text {
  font-size: 0.8rem;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 48px;
}

.btn-hard {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.btn-hard:hover {
  background: rgba(239, 68, 68, 1);
  transform: translateY(-2px);
}

.btn-flip {
  background: var(--bg-accent);
  color: var(--text-accent);
}

.btn-flip:hover {
  background: var(--bg-accent-hover);
  transform: translateY(-2px);
}

.btn-easy {
  background: rgba(34, 197, 94, 0.9);
  color: white;
}

.btn-easy:hover {
  background: rgba(34, 197, 94, 1);
  transform: translateY(-2px);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.empty-state p {
  opacity: 0.8;
  margin-bottom: 2rem;
}

.btn-primary {
  background: var(--gradient-primary);
  color: var(--text-accent);
}

.btn-primary:hover {
  background: var(--gradient-primary);
  transform: translateY(-2px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.modal-header h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.stats {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin: 2rem 0;
}

.stat {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
}

@keyframes swipeRight {
  to {
    transform: translateX(100vw) rotate(30deg);
    opacity: 0;
  }
}

@keyframes swipeLeft {
  to {
    transform: translateX(-100vw) rotate(-30deg);
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .flashcards-header {
    padding: 1rem;
  }
  
  .flashcard-area {
    padding: 1.5rem 1rem;
  }
  
  .word-text {
    font-size: 2rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .stats {
    gap: 1rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>