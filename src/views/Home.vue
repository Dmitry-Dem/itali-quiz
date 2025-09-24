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
          
          <router-link to="/flashcards/all" class="action-card flashcard-card" :class="{ disabled: words.length === 0 }">
            <div class="action-icon">🎯</div>
            <h3 class="action-title">Study Flashcards</h3>
            <p class="action-description">{{ words.length === 0 ? 'Add words to start studying' : 'Learn with interactive flashcards' }}</p>
          </router-link>
          
          <router-link to="/quiz" class="action-card quiz-card" :class="{ disabled: words.length === 0 }">
            <div class="action-icon">🧠</div>
            <h3 class="action-title">Take Quiz</h3>
            <p class="action-description">{{ words.length === 0 ? 'Add words to start quizzing' : 'Test your knowledge with quizzes' }}</p>
          </router-link>
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

      <!-- Word Groups -->
      <div class="word-groups animate-fade-in">
        <div class="section-header">
          <h2 class="section-title">Word Groups</h2>
          <router-link to="/groups" class="see-all-link">
            See All
            <span class="arrow">→</span>
          </router-link>
        </div>
        
        <div class="groups-grid">
          <router-link 
            v-for="group in wordGroups.slice(0, 4)" 
            :key="group.id"
            :to="`/words/${group.id}`"
            class="group-card"
          >
            <div class="group-icon" :style="{ backgroundColor: group.color }">
              {{ group.icon }}
            </div>
            <div class="group-info">
              <div class="group-name">{{ group.name }}</div>
              <div class="group-count">{{ getGroupWordCount(group.id) }} words</div>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Add Word Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeAddModal">
      <div class="modal add-word-modal" @click.stop>
        <div class="modal-header">
          <h3>Add New Word</h3>
          <button @click="closeAddModal" class="close-btn">×</button>
        </div>
        
        <form @submit.prevent="addNewWord" class="add-word-form">
          <div class="form-group">
            <label>Italian Word</label>
            <input 
              type="text" 
              v-model="newWord.italian" 
              placeholder="Enter Italian word..."
              required
              ref="italianInput"
            >
          </div>
          
          <div class="form-group">
            <label>English Translation</label>
            <input 
              type="text" 
              v-model="newWord.english" 
              placeholder="Enter English translation..."
              required
            >
          </div>
          
          <div class="form-group">
            <label>Group</label>
            <select v-model="newWord.groupId" required>
              <option value="">Select a group...</option>
              <option v-for="group in wordGroups" :key="group.id" :value="group.id">
                {{ group.name }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Difficulty (Optional)</label>
            <select v-model="newWord.difficulty">
              <option value="">Select difficulty...</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Details (Optional)</label>
            <textarea 
              v-model="newWord.details" 
              placeholder="Additional information about the word..."
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="closeAddModal" class="btn btn-secondary">
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
      <div class="modal data-modal" @click.stop>
        <div class="modal-header">
          <h3>Backup & Restore</h3>
          <button @click="closeDataModal" class="close-btn">×</button>
        </div>
        
        <div class="data-actions">
          <div class="data-action">
            <h4>Export Data</h4>
            <p>Download your vocabulary data as a JSON file</p>
            <button @click="exportData" class="btn btn-primary">
              📥 Export Data
            </button>
          </div>
          
          <div class="data-action">
            <h4>Import Data</h4>
            <p>Upload a JSON file to restore your vocabulary</p>
            <input 
              type="file" 
              ref="fileInput" 
              @change="handleFileImport" 
              accept=".json"
              style="display: none"
            >
            <button @click="triggerFileInput" class="btn btn-secondary">
              📤 Import Data
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h3>{{ confirmModal.title }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ confirmModal.message }}</p>
        </div>
        <div class="modal-actions">
          <button @click="cancelConfirm" class="btn btn-secondary">
            Cancel
          </button>
          <button @click="confirmAction" class="btn btn-primary">
            Confirm
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

// const router = useRouter() // removed unused
const { words, wordGroups, addWord, exportData, importData } = useAppStore()

// Modal states
const showAddModal = ref(false)
const showDataModal = ref(false)
const showConfirmModal = ref(false)

// Form data
const newWord = ref({
  italian: '',
  english: '',
  groupId: '',
  difficulty: '',
  details: ''
})

// Confirmation modal
const confirmModal = ref({
  title: '',
  message: '',
  action: null as (() => void) | null
})

// Refs
const italianInput = ref<HTMLInputElement>()
const fileInput = ref<HTMLInputElement>()

// Computed
const recentWords = computed(() => {
  return [...words.value]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
})

// Methods
const getGroupWordCount = (groupId: string) => {
  return words.value.filter(word => word.groupId === groupId).length
}

const closeAddModal = () => {
  showAddModal.value = false
  newWord.value = {
    italian: '',
    english: '',
    groupId: '',
    difficulty: '',
    details: ''
  }
}

const closeDataModal = () => {
  showDataModal.value = false
}

const addNewWord = async () => {
  try {
    await addWord(
      newWord.value.italian.trim(),
      newWord.value.english.trim(),
      newWord.value.groupId,
      newWord.value.difficulty || undefined,
      newWord.value.details.trim() || undefined
    )
    closeAddModal()
  } catch (error) {
    console.error('Error adding word:', error)
  }
}
function triggerFileInput() {
  fileInput.value?.click();
}

const handleFileImport = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      confirmModal.value = {
        title: 'Import Data',
        message: 'This will replace all your current vocabulary data. Are you sure?',
        action: () => {
          importData(data)
          showConfirmModal.value = false
          closeDataModal()
        }
      }
      showConfirmModal.value = true
    } catch (error) {
      console.error('Error parsing file:', error)
      alert('Invalid file format')
    }
  }
  reader.readAsText(file)
}

const confirmAction = () => {
  if (confirmModal.value.action) {
    confirmModal.value.action()
  }
}

const cancelConfirm = () => {
  showConfirmModal.value = false
  confirmModal.value = {
    title: '',
    message: '',
    action: null
  }
}

// Lifecycle
onMounted(() => {
  // Focus on Italian input when add modal opens
  if (showAddModal.value) {
    nextTick(() => {
      italianInput.value?.focus()
    })
  }
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Animations */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-slide-down {
  animation: slideDown 0.6s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out 0.2s both;
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out 0.4s both;
}

/* Hero Section */
.hero-section {
  text-align: center;
  margin-bottom: 4rem;
}

.hero-content {
  margin-bottom: 2rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.gradient-text {
  background: linear-gradient(135deg, var(--bg-accent), #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.stat-card {
  background: var(--bg-secondary);
  padding: 1.5rem 2rem;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--bg-accent);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* Quick Actions */
.quick-actions, .recent-words, .word-groups {
  margin-bottom: 4rem;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.see-all-link {
  color: var(--bg-accent);
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.see-all-link:hover {
  gap: 0.75rem;
}

.arrow {
  font-size: 1.2rem;
  transition: transform 0.2s;
}

.see-all-link:hover .arrow {
  transform: translateX(2px);
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--bg-accent);
}

.action-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-card.disabled:hover {
  transform: none;
  box-shadow: var(--shadow-sm);
  border-color: var(--border-color);
}

.action-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  display: block;
}

.action-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.action-description {
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.flashcard-card .action-icon {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.quiz-card .action-icon {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Word Grid */
.word-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.word-card {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.word-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.italian-word {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.english-word {
  color: var(--text-secondary);
}

/* Groups Grid */
.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.group-card {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;
}

.group-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
  border-color: var(--bg-accent);
}

.group-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.group-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.group-count {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: var(--bg-secondary);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

/* Form Styles */
.add-word-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--bg-accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

/* Data Modal */
.data-actions {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.data-action {
  text-align: center;
}

.data-action h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.data-action p {
  margin: 0 0 1rem 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* Button Styles */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--bg-accent);
  color: var(--text-accent);
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-secondary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-stats {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .action-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .word-grid,
  .groups-grid {
    grid-template-columns: 1fr;
  }

  .modal {
    margin: 1rem;
    max-width: none;
  }

  .form-actions,
  .modal-actions {
    flex-direction: column;
  }

  .form-actions .btn,
  .modal-actions .btn {
    width: 100%;
  }

  .data-actions {
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.75rem;
  }

  .action-card {
    padding: 1.5rem;
  }

  .action-icon {
    font-size: 2rem;
  }
}
</style>