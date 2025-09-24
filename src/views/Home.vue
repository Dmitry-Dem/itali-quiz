<template>
  <div class="home-page">
    <div class="container">
      <!-- Hero Section -->
      <div class="hero-section animate-slide-down">
        <div class="hero-content">
          <h1 class="hero-title">
            Learn Italian
            <span class="gradient-text">Vocabulary</span>
          </h1>
          <p class="hero-subtitle">
            Build your Italian vocabulary with our beautiful, modern learning app
          </p>
        </div>
        
        <div class="hero-stats">
          <div class="stat-card">
            <div class="stat-number">{{ words.length }}</div>
            <div class="stat-label">Words Learned</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions animate-slide-up">
        <h2 class="section-title">Quick Actions</h2>
        
        <div class="action-grid">
          <router-link to="/words" class="action-card">
            <div class="action-icon">📚</div>
            <h3 class="action-title">View All Words</h3>
            <p class="action-description">Browse and manage your vocabulary collection</p>
          </router-link>
          
          <div class="action-card" @click="showAddModal = true">
            <div class="action-icon">➕</div>
            <h3 class="action-title">Add New Word</h3>
            <p class="action-description">Expand your vocabulary with new Italian words</p>
          </div>
          
          <div class="action-card" @click="showDataModal = true">
            <div class="action-icon">💾</div>
            <h3 class="action-title">Backup & Restore</h3>
            <p class="action-description">Export or import your vocabulary data</p>
          </div>
          
          <div class="action-card quiz-card">
            <div class="action-icon">🎯</div>
            <h3 class="action-title">Start Quiz</h3>
            <p class="action-description">Test your knowledge (Coming Soon)</p>
          </div>
        </div>
      </div>

      <!-- Recent Words -->
      <div class="recent-words animate-fade-in" v-if="recentWords.length > 0">
        <h2 class="section-title">Recently Added</h2>
        
        <div class="word-grid">
          <div 
            v-for="word in recentWords" 
            :key="word.id" 
            class="word-card"
          >
            <div class="word-content">
              <div class="italian-word">{{ word.italian }}</div>
              <div class="english-word">{{ word.english }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Word Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Add New Word</h3>
          <button @click="showAddModal = false" class="btn btn-icon btn-secondary">
            ✕
          </button>
        </div>
        
        <form @submit.prevent="handleAddWord" class="modal-form">
          <div class="form-group">
            <label class="form-label">Italian Word</label>
            <input 
              v-model="newWord.italian"
              type="text" 
              class="form-input"
              placeholder="e.g., Ciao"
              required
              ref="italianInput"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">English Translation</label>
            <input 
              v-model="newWord.english"
              type="text" 
              class="form-input"
              placeholder="e.g., Hello"
              required
            >
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="showAddModal = false" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              Add Word
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Data Management Modal -->
    <div v-if="showDataModal" class="modal-overlay" @click="closeDataModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Backup & Restore</h3>
          <button @click="showDataModal = false" class="btn btn-icon btn-secondary">
            ✕
          </button>
        </div>
        
        <div class="modal-body">
          <div class="data-section">
            <h4>Export Data</h4>
            <p>Download your vocabulary and settings as a JSON file</p>
            <button @click="handleExport" class="btn btn-primary">
              📥 Export Data
            </button>
          </div>
          
          <div class="data-divider"></div>
          
          <div class="data-section">
            <h4>Import Data</h4>
            <p>Upload a previously exported JSON file to restore your data</p>
            <input 
              ref="fileInput"
              type="file" 
              accept=".json"
              @change="handleFileSelect"
              style="display: none"
            >
            <button @click="triggerFileInput" class="btn btn-secondary">
              📤 Choose File
            </button>
            <div v-if="selectedFile" class="file-info">
              <span>{{ selectedFile.name }}</span>
              <button @click="handleImport" class="btn btn-primary">
                Import
              </button>
            </div>
          </div>
          
          <div v-if="importStatus" class="import-status" :class="importStatus.type">
            {{ importStatus.message }}
          </div>
        </div>
      </div>
    </div>

    <!-- PWA Install Prompt -->
    <PWAInstall />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useAppStore } from '../composables/useAppStore'
import PWAInstall from '../components/PWAInstall.vue'

const { words, addWord, exportData, importData } = useAppStore()

const showAddModal = ref(false)
const showDataModal = ref(false)
const italianInput = ref<HTMLInputElement>()
const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const importStatus = ref<{ type: 'success' | 'error', message: string } | null>(null)

const newWord = ref({
  italian: '',
  english: ''
})

const recentWords = computed(() => {
  return [...words.value]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
})

const handleAddWord = () => {
  if (newWord.value.italian.trim() && newWord.value.english.trim()) {
    addWord(newWord.value.italian, newWord.value.english)
    newWord.value = { italian: '', english: '' }
    showAddModal.value = false
  }
}

const closeModal = () => {
  showAddModal.value = false
  newWord.value = { italian: '', english: '' }
}

const closeDataModal = () => {
  showDataModal.value = false
  selectedFile.value = null
  importStatus.value = null
}

const handleExport = () => {
  exportData()
  showDataModal.value = false
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedFile.value = file
    importStatus.value = null
  }
}

const handleImport = async () => {
  if (!selectedFile.value) return
  
  try {
    await importData(selectedFile.value)
    importStatus.value = { type: 'success', message: 'Data imported successfully!' }
    setTimeout(() => {
      closeDataModal()
    }, 2000)
  } catch (error) {
    importStatus.value = { type: 'error', message: 'Failed to import data. Please check the file format.' }
  }
}

// Focus input when modal opens
nextTick(() => {
  if (showAddModal.value && italianInput.value) {
    italianInput.value.focus()
  }
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 2rem 0;
}

.hero-section {
  text-align: center;
  margin-bottom: 4rem;
}

.hero-content {
  margin-bottom: 3rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.gradient-text {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.hero-stats {
  display: flex;
  justify-content: center;
}

.stat-card {
  background: var(--gradient-accent);
  color: white;
  padding: 1.5rem 2rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.95rem;
  opacity: 0.9;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 2rem;
  text-align: center;
}

.quick-actions {
  margin-bottom: 4rem;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.action-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  color: var(--text-primary);
  position: relative;
  overflow: hidden;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--border-color-focus);
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transition: left 0.5s ease;
}

.action-card:hover::before {
  left: 100%;
}

.action-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.action-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.action-description {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.5;
}

.quiz-card {
  opacity: 0.7;
  cursor: not-allowed;
}

.recent-words {
  margin-bottom: 3rem;
}

.word-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.word-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.word-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.italian-word {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.english-word {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: var(--bg-primary);
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
  border: 1px solid var(--border-color);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.modal-form {
  padding: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.modal-body {
  padding: 1.5rem;
}

.data-section {
  margin-bottom: 1.5rem;
}

.data-section h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.data-section p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.data-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 2rem 0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  font-size: 0.9rem;
}

.import-status {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.import-status.success {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.import-status.error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

[data-theme="dark"] .import-status.success {
  background-color: rgba(16, 185, 129, 0.1);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.3);
}

[data-theme="dark"] .import-status.error {
  background-color: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.3);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .action-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .stat-number {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .action-card {
    padding: 1.5rem;
  }
  
  .action-icon {
    font-size: 2.5rem;
  }
}
</style>