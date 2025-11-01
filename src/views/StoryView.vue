<template>
  <div class="container mt-3">
    <div class="row justify-content-center">
      <div class="col-md-10">
        <div v-if="story" class="story-container">
          <div class="story-header">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h2 class="story-title">{{ story.title }}</h2>
                <div class="story-meta">
                  <span class="meta-item">
                    <i class="bi bi-calendar3"></i>
                    {{ formatDate(story.createdAt) }}
                  </span>
                  <span class="meta-item">
                    <i class="bi bi-chat-square-text"></i>
                    {{ getWordCount(story.content) }} words
                  </span>
                </div>
              </div>
              <div class="story-actions">
                <button @click="editStory" class="btn btn-primary btn-sm">
                  <i class="bi bi-pencil"></i> Edit
                </button>
                <router-link to="/stories" class="btn btn-secondary btn-sm ms-2">
                  <i class="bi bi-arrow-left"></i> Back
                </router-link>
              </div>
            </div>
          </div>

          <div class="story-content">
            <div class="text-display">
              <span 
                v-for="(token, index) in story.processedText" 
                :key="index"
                :class="getTokenClass(token)"
                @click="handleTokenClick(token, $event)"
              >
                {{ token.text }}
              </span>
            </div>
          </div>

          <div class="story-stats">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">{{ knownWordsCount }}</div>
                <div class="stat-label">Known Words</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ unknownWordsCount }}</div>
                <div class="stat-label">Unknown Words</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ totalWordsCount }}</div>
                <div class="stat-label">Total Words</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ comprehensionPercentage }}%</div>
                <div class="stat-label">Comprehension</div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-5">
          <div class="error-state">
            <i class="bi bi-exclamation-triangle display-1 mb-3"></i>
            <h4>Story not found</h4>
            <p class="text-muted">The story you're looking for doesn't exist.</p>
            <router-link to="/stories" class="btn btn-primary">
              <i class="bi bi-arrow-left"></i> Back to Stories
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div 
      v-if="showTranslation" 
      class="translation-popup"
      :style="{ left: popupPosition.x + 'px', top: popupPosition.y + 'px' }"
    >
      <div class="popup-content">
        <div class="popup-header">
          <strong>{{ selectedWord?.italian }}</strong>
          <button @click="closeTranslation" class="btn-close btn-close-sm"></button>
        </div>
        <div class="popup-body">
          <p v-if="selectedWord?.english !== 'Unknown word - add to import queue to learn'">
            <strong>English:</strong> {{ selectedWord?.english }}
          </p>
          <p v-if="selectedWord?.english === 'Unknown word - add to import queue to learn'" class="unknown-word-message">
            {{ selectedWord?.english }}
          </p>
          <p v-if="selectedWord?.details"><strong>Details:</strong> {{ selectedWord?.details }}</p>
          <p v-if="selectedWord?.example"><strong>Example:</strong> {{ selectedWord?.example }}</p>
          <div v-if="selectedWord?.english === 'Unknown word - add to import queue to learn'" class="popup-actions">
            <button @click="addToImportQueue" class="btn btn-primary btn-sm">
              <i class="bi bi-plus-circle"></i> Add to Import Queue
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore, type Word } from '../composables/useAppStore'

interface Token {
  text: string
  type: 'word' | 'punctuation' | 'space'
  isKnown: boolean
  isInQueue: boolean
  word?: Word
}

interface Story {
  id: string
  title: string
  content: string
  processedText: Token[]
  createdAt: string
  updatedAt: string
}

const { words } = useAppStore()
const route = useRoute()
const router = useRouter()

const story = ref<Story | null>(null)
const showTranslation = ref(false)
const selectedWord = ref<Word | null>(null)
const selectedToken = ref<Token | null>(null)
const popupPosition = ref({ x: 0, y: 0 })

const getStoriesFromStorage = (): Story[] => {
  const stored = localStorage.getItem('stories')
  return stored ? JSON.parse(stored) : []
}

const loadStory = () => {
  const storyId = route.params.id as string
  const stories = getStoriesFromStorage()
  story.value = stories.find(s => s.id === storyId) || null
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getWordCount = (content: string) => {
  return content.split(/\s+/).filter(word => word.length > 0).length
}

const editStory = () => {
  if (story.value) {
    router.push({
      path: '/text-import',
      query: { story: story.value.id }
    })
  }
}

const getTokenClass = (token: Token) => {
  const classes = ['token']
  
  if (token.type === 'word') {
    if (token.isKnown) {
      classes.push('known-word')
    } else {
      classes.push('unknown-word')
    }
  }
  
  return classes.join(' ')
}

const handleTokenClick = (token: Token, event: MouseEvent) => {
  event.stopPropagation()
  
  if (token.type === 'word') {
    if (token.isKnown && token.word) {
      // Show translation for known words
      selectedWord.value = token.word
      selectedToken.value = null
      popupPosition.value = {
        x: event.clientX,
        y: event.clientY - 10
      }
      showTranslation.value = true
    } else if (!token.isKnown) {
      // Show "add to queue" popup for unknown words
      selectedWord.value = {
        id: '',
        italian: token.text,
        english: 'Unknown word - add to import queue to learn',
        groupId: '',
        wrongAttempts: 0,
        correctAttempts: 0,
        createdAt: new Date().toISOString(),
        lastReviewed: null
      }
      selectedToken.value = token
      popupPosition.value = {
        x: event.clientX,
        y: event.clientY - 10
      }
      showTranslation.value = true
    }
  }
}

const addToImportQueue = () => {
  if (!selectedToken.value) return
  
  const wordLower = selectedToken.value.text.toLowerCase()
  const importQueue = JSON.parse(localStorage.getItem('itali-quiz-import-queue') || '[]')
  
  if (!importQueue.includes(wordLower)) {
    importQueue.push(wordLower)
    localStorage.setItem('itali-quiz-import-queue', JSON.stringify(importQueue))
    
    // Update the token to show it's in queue
    selectedToken.value.isInQueue = true
    
    // Show success message
    alert(`"${selectedToken.value.text}" added to import queue!`)
  } else {
    alert(`"${selectedToken.value.text}" is already in the import queue.`)
  }
  
  closeTranslation()
}

const handleDocumentClick = () => {
  showTranslation.value = false
  selectedWord.value = null
}

const closeTranslation = () => {
  showTranslation.value = false
  selectedWord.value = null
}

const knownWordsCount = computed(() => {
  if (!story.value) return 0
  return story.value.processedText.filter(token => 
    token.type === 'word' && token.isKnown
  ).length
})

const unknownWordsCount = computed(() => {
  if (!story.value) return 0
  return story.value.processedText.filter(token => 
    token.type === 'word' && !token.isKnown
  ).length
})

const totalWordsCount = computed(() => {
  if (!story.value) return 0
  return story.value.processedText.filter(token => token.type === 'word').length
})

const comprehensionPercentage = computed(() => {
  if (totalWordsCount.value === 0) return 0
  return Math.round((knownWordsCount.value / totalWordsCount.value) * 100)
})

onMounted(() => {
  loadStory()
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<style scoped>
.story-container {
  max-width: 100%;
}

.story-header {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.story-title {
  color: var(--text-primary);
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.story-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.meta-item {
  color: var(--text-muted);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.story-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.story-content {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.text-display {
  line-height: 2;
  font-size: 1.125rem;
  color: var(--text-primary);
  letter-spacing: 0.025em;
  word-spacing: 0.15em;
}

.token {
  cursor: default;
  margin: 1px;
}

.known-word {
  border: 2px solid #28a745;
  border-radius: 4px;
  padding: 3px 5px;
  margin: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: rgba(40, 167, 69, 0.05);
  display: inline-block;
}

.known-word:hover {
  background-color: rgba(40, 167, 69, 0.15);
  transform: translateY(-1px);
}

.unknown-word {
  border: 2px dotted rgba(108, 117, 125, 0.4);
  border-radius: 4px;
  padding: 3px 5px;
  margin: 2px;
  cursor: pointer;
  background-color: rgba(108, 117, 125, 0.03);
  display: inline-block;
  transition: all 0.2s ease;
}

.unknown-word:hover {
  border-color: rgba(108, 117, 125, 0.6);
  background-color: rgba(108, 117, 125, 0.08);
}

.story-stats {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1.5rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 500;
}

.error-state {
  text-align: center;
  color: var(--text-muted);
}

.error-state i {
  color: var(--text-muted);
}

.error-state h4 {
  color: var(--text-primary);
  margin: 1rem 0;
}

.translation-popup {
  position: fixed;
  z-index: 1060;
  max-width: 320px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  font-size: 0.875rem;
}

.popup-content {
  padding: 0;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  border-radius: 8px 8px 0 0;
  color: var(--text-primary);
  font-weight: 600;
}

.popup-body {
  padding: 1rem;
  color: var(--text-primary);
}

.popup-body p {
  margin: 0.5rem 0;
  font-size: 0.875rem;
}

.popup-body strong {
  color: var(--text-secondary);
  font-weight: 600;
}

.unknown-word-message {
  color: var(--text-muted);
  font-style: italic;
  margin: 0.5rem 0;
}

.popup-actions {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
}

.popup-actions .btn {
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
}

.btn-close-sm {
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.btn-close-sm:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .story-header {
    padding: 1rem;
  }
  
  .story-content {
    padding: 1.5rem;
  }
  
  .text-display {
    font-size: 1rem;
    line-height: 2.2;
    word-spacing: 0.2em;
  }
  
  .token {
    margin: 2px;
  }
  
  .known-word, .unknown-word {
    padding: 4px 6px;
    margin: 3px 2px;
    font-size: 0.95rem;
  }
  
  .story-title {
    font-size: 1.5rem;
  }
  
  .story-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .story-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .translation-popup {
    max-width: 280px;
    font-size: 0.8rem;
  }
}

@media (max-width: 576px) {
  .story-header .d-flex {
    flex-direction: column;
    gap: 1rem;
  }
  
  .story-actions {
    align-self: stretch;
    flex-direction: row;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>