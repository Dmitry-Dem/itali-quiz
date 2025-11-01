<template>
  <div class="text-import-page">
    <div class="container">
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Text Import</h1>
          <p class="page-subtitle">Import text from books or articles to discover new words</p>
        </div>
        
        <div class="header-actions">
          <router-link to="/import-queue" class="btn btn-secondary">
            <span>📝</span>
            Import Queue ({{ importQueue.length }})
          </router-link>
        </div>
      </div>

      <div v-if="!processedText" class="import-section">
        <div class="input-area">
          <label for="text-input">Paste your Italian text here:</label>
          <textarea
            id="text-input"
            v-model="inputText"
            placeholder="Paste any Italian text here - from books, articles, or any content you want to read and understand..."
            rows="10"
            class="text-input"
          ></textarea>
          
          <div class="input-actions">
            <button @click="processText" class="btn btn-primary" :disabled="!inputText.trim()">
              <span>🔍</span>
              Analyze Text
            </button>
            <button @click="clearText" class="btn btn-secondary" v-if="inputText">
              <span>🗑️</span>
              Clear
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-display-section">
        <div class="text-controls">
          <button @click="resetText" class="btn btn-secondary">
            <span>←</span>
            Import New Text
          </button>
          <button @click="saveStory" class="btn btn-primary" v-if="!currentStory">
            <span>💾</span>
            Save Story
          </button>
          <div class="stats">
            <span class="stat">{{ knownWordsCount }} known words</span>
            <span class="stat">{{ unknownWordsCount }} unknown words</span>
          </div>
        </div>

        <div class="text-content">
          <span
            v-for="(token, index) in processedText"
            :key="index"
            :class="getTokenClass(token)"
            @click="handleTokenClick(token, $event)"
          >
            {{ token.text }}
          </span>
        </div>
      </div>

      <div class="stories-section">
        <div class="section-header">
          <h2>My Stories</h2>
          <p class="section-subtitle">{{ stories.length }} saved text{{ stories.length !== 1 ? 's' : '' }}</p>
        </div>

        <div v-if="stories.length === 0" class="empty-stories">
          <div class="empty-icon">📚</div>
          <p>No stories saved yet. Analyze and save your first text!</p>
        </div>

        <div v-else class="stories-grid">
          <div 
            v-for="story in stories.slice(0, 6)" 
            :key="story.id"
            class="story-card"
            @click="loadStory(story)"
          >
            <div class="story-content">
              <h3 class="story-title">{{ story.title }}</h3>
              <p class="story-preview">{{ getPreview(story.content) }}</p>
              <div class="story-footer">
                <span class="story-date">{{ formatDate(story.createdAt) }}</span>
                <div class="story-actions" @click.stop>
                  <button @click="viewStory(story)" class="action-btn view-btn" title="View">
                    👁️
                  </button>
                  <button @click="deleteStory(story.id)" class="action-btn delete-btn" title="Delete">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="stories.length > 6" class="stories-more">
          <p>And {{ stories.length - 6 }} more stories...</p>
        </div>
      </div>

      <div 
        v-if="showTranslation" 
        class="translation-popup"
        :style="{ top: popupPosition.y + 'px', left: popupPosition.x + 'px' }"
        @click.stop
      >
        <div class="translation-content">
          <div class="word-info">
            <strong>{{ selectedWord?.italian }}</strong>
            <span class="translation">{{ selectedWord?.english }}</span>
          </div>
          <button @click="closeTranslation" class="close-btn">✕</button>
        </div>
      </div>

      <div 
        v-if="showAddWord" 
        class="add-word-popup"
        :style="{ top: popupPosition.y + 'px', left: popupPosition.x + 'px' }"
        @click.stop
      >
        <div class="add-word-content">
          <div class="word-display">
            <strong>{{ selectedToken?.text }}</strong>
          </div>
          <button @click="addToImportQueue" class="btn btn-primary btn-sm">
            <span>➕</span>
            Add to Import Queue
          </button>
          <button @click="closeAddWord" class="close-btn">✕</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore, type Word } from '../composables/useAppStore'
import { useRoute, useRouter } from 'vue-router'

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

const inputText = ref('')
const processedText = ref<Token[] | null>(null)
const currentStory = ref<Story | null>(null)
const showTranslation = ref(false)
const showAddWord = ref(false)
const selectedWord = ref<Word | null>(null)
const selectedToken = ref<Token | null>(null)
const popupPosition = ref({ x: 0, y: 0 })

const importQueue = ref<string[]>([])
const stories = ref<Story[]>([])

const knownWordsCount = computed(() => {
  if (!processedText.value) return 0
  return processedText.value.filter(token => token.type === 'word' && token.isKnown).length
})

const unknownWordsCount = computed(() => {
  if (!processedText.value) return 0
  return processedText.value.filter(token => token.type === 'word' && !token.isKnown).length
})

onMounted(() => {
  loadImportQueue()
  loadStories()
  loadStoryFromRoute()
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})

const loadImportQueue = () => {
  const saved = localStorage.getItem('itali-quiz-import-queue')
  importQueue.value = saved ? JSON.parse(saved) : []
}

const saveImportQueue = () => {
  localStorage.setItem('itali-quiz-import-queue', JSON.stringify(importQueue.value))
}

const processText = () => {
  if (!inputText.value.trim()) return
  
  const tokens: Token[] = []
  const text = inputText.value
  let currentWord = ''
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    
    if (/[a-zA-ZàáâäèéêëìíîïòóôöùúûüçñÀÁÂÄÈÉÊËÌÍÎÏÒÓÔÖÙÚÛÜÇÑ]/.test(char)) {
      currentWord += char
    } else {
      if (currentWord) {
        const wordLower = currentWord.toLowerCase()
        const foundWord = words.value.find(w => w.italian.toLowerCase() === wordLower)
        const isInQueue = importQueue.value.includes(wordLower)
        
        tokens.push({
          text: currentWord,
          type: 'word',
          isKnown: !!foundWord,
          isInQueue,
          word: foundWord
        })
        currentWord = ''
      }
      
      if (char.trim()) {
        tokens.push({
          text: char,
          type: 'punctuation',
          isKnown: false,
          isInQueue: false
        })
      } else {
        tokens.push({
          text: char,
          type: 'space',
          isKnown: false,
          isInQueue: false
        })
      }
    }
  }
  
  if (currentWord) {
    const wordLower = currentWord.toLowerCase()
    const foundWord = words.value.find(w => w.italian.toLowerCase() === wordLower)
    const isInQueue = importQueue.value.includes(wordLower)
    
    tokens.push({
      text: currentWord,
      type: 'word',
      isKnown: !!foundWord,
      isInQueue,
      word: foundWord
    })
  }
  
  processedText.value = tokens
}

const getTokenClass = (token: Token) => {
  const classes = ['token']
  
  if (token.type === 'word') {
    classes.push('word-token')
    if (token.isKnown) {
      classes.push('known-word')
    } else if (token.isInQueue) {
      classes.push('queued-word')
    } else {
      classes.push('unknown-word')
    }
  } else {
    classes.push('non-word-token')
  }
  
  return classes
}

const handleTokenClick = (token: Token, event: MouseEvent) => {
  if (token.type !== 'word') return
  
  event.stopPropagation()
  closePopups()
  
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  popupPosition.value = {
    x: rect.left + rect.width / 2,
    y: rect.top - 10
  }
  
  if (token.isKnown && token.word) {
    selectedWord.value = token.word
    showTranslation.value = true
  } else {
    selectedToken.value = token
    showAddWord.value = true
  }
}

const closePopups = () => {
  showTranslation.value = false
  showAddWord.value = false
  selectedWord.value = null
  selectedToken.value = null
}

const closeTranslation = () => {
  showTranslation.value = false
  selectedWord.value = null
}

const closeAddWord = () => {
  showAddWord.value = false
  selectedToken.value = null
}

const getStoriesFromStorage = (): Story[] => {
  const stored = localStorage.getItem('stories')
  return stored ? JSON.parse(stored) : []
}

const saveStoriesToStorage = (stories: Story[]) => {
  localStorage.setItem('stories', JSON.stringify(stories))
}

const saveStory = () => {
  if (!processedText.value || !inputText.value.trim()) {
    alert('Please enter some text first!')
    return
  }

  const title = inputText.value.slice(0, 50) + (inputText.value.length > 50 ? '...' : '')
  const now = new Date().toISOString()
  
  const story: Story = {
    id: Date.now().toString(),
    title,
    content: inputText.value,
    processedText: processedText.value,
    createdAt: now,
    updatedAt: now
  }

  const allStories = getStoriesFromStorage()
  allStories.unshift(story)
  saveStoriesToStorage(allStories)
  
  stories.value = allStories
  
  currentStory.value = story
  alert('Story saved successfully!')
}

const loadStoryFromRoute = () => {
  const storyId = route.query.story as string
  if (storyId) {
    const stories = getStoriesFromStorage()
    const story = stories.find(s => s.id === storyId)
    if (story) {
      inputText.value = story.content
      processedText.value = story.processedText
      currentStory.value = story
    }
  }
}

const addToImportQueue = () => {
  if (!selectedToken.value) return
  
  const wordLower = selectedToken.value.text.toLowerCase()
  if (!importQueue.value.includes(wordLower)) {
    importQueue.value.push(wordLower)
    saveImportQueue()
    
    if (processedText.value) {
      const tokenIndex = processedText.value.findIndex(t => 
        t.text.toLowerCase() === wordLower && t.type === 'word'
      )
      if (tokenIndex !== -1) {
        processedText.value[tokenIndex].isInQueue = true
      }
    }
  }
  
  closeAddWord()
}

const handleDocumentClick = () => {
  closePopups()
}

const resetText = () => {
  processedText.value = null
  inputText.value = ''
}

const clearText = () => {
  inputText.value = ''
}

const loadStories = () => {
  stories.value = getStoriesFromStorage()
}

const loadStory = (story: Story) => {
  inputText.value = story.content
  currentStory.value = story
  processText()
}

const getPreview = (content: string) => {
  return content.length > 100 ? content.substring(0, 100) + '...' : content
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const viewStory = (story: Story) => {
  router.push(`/story/${story.id}`)
}

const deleteStory = (storyId: string) => {
  if (confirm('Are you sure you want to delete this story?')) {
    stories.value = stories.value.filter(s => s.id !== storyId)
    saveStoriesToStorage(stories.value)
    
    if (currentStory.value?.id === storyId) {
      currentStory.value = null
      resetText()
    }
  }
}
</script>

<style scoped>
.text-import-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.import-section {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  border: 1px solid var(--border-primary);
}

.input-area label {
  display: block;
  margin-bottom: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.text-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--border-primary);
  border-radius: var(--border-radius);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  min-height: 200px;
}

.text-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-primary-alpha);
}

.input-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.text-display-section {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  border: 1px solid var(--border-primary);
}

.text-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.stats {
  display: flex;
  gap: 2rem;
}

.stat {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.text-content {
  line-height: 2.2;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.token {
  position: relative;
}

.word-token {
  padding: 3px 5px;
  margin: 2px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-block;
}

.known-word {
  border: 2px solid #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.known-word:hover {
  background: rgba(16, 185, 129, 0.2);
  transform: translateY(-1px);
}

.unknown-word {
  border: 2px dotted rgba(107, 114, 128, 0.4);
  background: rgba(107, 114, 128, 0.03);
}

.unknown-word:hover {
  border-color: rgba(107, 114, 128, 0.6);
  background: rgba(107, 114, 128, 0.08);
  transform: translateY(-1px);
}

.queued-word {
  border: 2px solid #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.queued-word:hover {
  background: rgba(245, 158, 11, 0.2);
}

.non-word-token {
  color: var(--text-primary);
}

.translation-popup,
.add-word-popup {
  position: fixed;
  z-index: 1000;
  background: var(--bg-primary);
  border: 2px solid var(--border-primary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  transform: translate(-50%, -100%);
  margin-top: -10px;
  min-width: 200px;
}

.translation-content,
.add-word-content {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.word-info {
  flex: 1;
}

.word-info strong {
  display: block;
  color: var(--text-primary);
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.translation {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.word-display strong {
  color: var(--text-primary);
  font-size: 1.1rem;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  font-size: 1rem;
}

.close-btn:hover {
  background: var(--bg-secondary);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  text-decoration: none;
}

.btn-primary {
  background: var(--accent-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--accent-primary-dark);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.btn-secondary:hover {
  background: var(--bg-quaternary);
  transform: translateY(-1px);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Stories Section */
.stories-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-primary);
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

.section-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.empty-stories {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.story-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.story-card:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent-primary);
  transform: translateY(-2px);
}

.story-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.story-title {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.3;
}

.story-preview {
  margin: 0 0 1rem 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

.story-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-secondary);
}

.story-date {
  color: var(--text-tertiary);
  font-size: 0.8rem;
}

.story-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
}

.action-btn:hover {
  background: var(--bg-quaternary);
  transform: scale(1.1);
}

.view-btn:hover {
  background: var(--bg-success);
}

.delete-btn:hover {
  background: var(--bg-danger);
}

.stories-more {
  text-align: center;
  margin-top: 1rem;
  padding: 1rem;
  color: var(--text-tertiary);
  font-style: italic;
}

@media (max-width: 768px) {
  .text-import-page {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .text-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stats {
    justify-content: center;
  }
  
  .text-display {
    line-height: 2.2;
    word-spacing: 0.2em;
  }
  
  .word-token {
    padding: 4px 6px;
    margin: 3px 2px;
    font-size: 0.95rem;
  }
  
  .translation-popup,
  .add-word-popup {
    left: 50% !important;
    right: auto;
    max-width: 90vw;
  }
  
  .input-actions {
    flex-direction: column;
  }
  
  .btn {
    justify-content: center;
  }
}
</style>