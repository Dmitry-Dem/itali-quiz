<template>
  <div class="import-queue-page">
    <div class="container">
      <div class="page-header animate-slide-down">
        <div class="header-content">
          <h1 class="page-title">Import Queue</h1>
          <p class="page-subtitle">{{ importQueue.length }} word{{ importQueue.length !== 1 ? 's' : '' }} ready to import</p>
        </div>
        
        <div class="header-actions">
          <router-link to="/text-import" class="btn btn-secondary">
            <span>←</span>
            Back to Text Import
          </router-link>
          <button @click="copyList" class="btn btn-secondary" v-if="importQueue.length > 0">
            <span>📋</span>
            Copy List
          </button>
          <button @click="clearAll" class="btn btn-danger" v-if="importQueue.length > 0">
            <span>🗑️</span>
            Clear All
          </button>
        </div>
      </div>

      <div v-if="importQueue.length === 0" class="empty-state">
        <div class="empty-content">
          <div class="empty-icon">📝</div>
          <div class="empty-text">
            <h3>No words in queue</h3>
            <p>Use the text import feature to discover new words and add them to your import queue.</p>
          </div>
        </div>
        <div class="empty-actions">
          <router-link to="/text-import" class="btn btn-primary">
            <span>📄</span>
            Import Text
          </router-link>
        </div>
      </div>

      <div v-else class="queue-section animate-fade-in">
        <div class="queue-actions">
          <button @click="selectAll" class="btn btn-secondary">
            <span>☑️</span>
            Select All
          </button>
          <button @click="deselectAll" class="btn btn-secondary">
            <span>☐</span>
            Deselect All
          </button>
          <button @click="copySelected" class="btn btn-primary" :disabled="selectedWords.length === 0">
            <span>�</span>
            Copy Selected ({{ selectedWords.length }})
          </button>
        </div>

        <div class="words-grid">
          <div 
            v-for="(word, index) in importQueue" 
            :key="word"
            class="word-item"
            :class="{ 'selected': selectedWords.includes(word) }"
          >
            <div class="word-display">
              <div class="word-index">{{ index + 1 }}</div>
              <div class="word-content">
                <div class="word-main">
                  <h3 class="word-italian">{{ word }}</h3>
                  <p class="word-status">Ready to import</p>
                </div>
              </div>
              <div class="word-actions">
                <input 
                  type="checkbox" 
                  :checked="selectedWords.includes(word)"
                  @click.stop
                  @change="toggleWord(word)"
                  class="word-checkbox"
                >
                <button @click.stop="editWord(word, index)" class="action-btn edit-btn" title="Edit">
                  ✏️
                </button>
                <button @click.stop="removeWord(index)" class="action-btn delete-btn" title="Remove">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Edit Word</h3>
            <button @click="closeEditModal" class="btn-close">✕</button>
          </div>

          <form @submit.prevent="saveEdit" class="modal-form">
            <div class="form-group">
              <label for="editWord">Word</label>
              <input 
                id="editWord"
                v-model="editingWord" 
                type="text" 
                required 
                class="form-input"
                ref="editInput"
              >
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeEditModal" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
        <div class="modal-content success-modal" @click.stop>
          <div class="modal-header">
            <h3>Copy Successful!</h3>
            <button @click="closeSuccessModal" class="btn-close">✕</button>
          </div>

          <div class="success-content">
            <div class="success-icon">📋</div>
            <p>{{ copiedCount }} word{{ copiedCount !== 1 ? 's' : '' }} copied to clipboard successfully!</p>
            <p class="success-note">You can now paste these words where needed.</p>
            
            <div class="success-actions">
              <button @click="closeSuccessModal" class="btn btn-primary">
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

const importQueue = ref<string[]>([])
const selectedWords = ref<string[]>([])
const showEditModal = ref(false)
const showSuccessModal = ref(false)
const editingWord = ref('')
const editingIndex = ref(-1)
const editInput = ref<HTMLInputElement>()
const copiedCount = ref(0)

onMounted(() => {
  loadImportQueue()
})

const loadImportQueue = () => {
  const saved = localStorage.getItem('itali-quiz-import-queue')
  importQueue.value = saved ? JSON.parse(saved) : []
}

const saveImportQueue = () => {
  localStorage.setItem('itali-quiz-import-queue', JSON.stringify(importQueue.value))
}

const toggleWord = (word: string) => {
  const index = selectedWords.value.indexOf(word)
  if (index > -1) {
    selectedWords.value.splice(index, 1)
  } else {
    selectedWords.value.push(word)
  }
}

const selectAll = () => {
  selectedWords.value = [...importQueue.value]
}

const deselectAll = () => {
  selectedWords.value = []
}

const removeWord = (index: number) => {
  const word = importQueue.value[index]
  importQueue.value.splice(index, 1)
  
  const selectedIndex = selectedWords.value.indexOf(word)
  if (selectedIndex > -1) {
    selectedWords.value.splice(selectedIndex, 1)
  }
  
  saveImportQueue()
}

const editWord = (word: string, index: number) => {
  editingWord.value = word
  editingIndex.value = index
  showEditModal.value = true
  
  nextTick(() => {
    editInput.value?.focus()
  })
}

const saveEdit = () => {
  if (editingIndex.value >= 0 && editingWord.value.trim()) {
    const oldWord = importQueue.value[editingIndex.value]
    const newWord = editingWord.value.trim().toLowerCase()
    
    importQueue.value[editingIndex.value] = newWord
    
    const selectedIndex = selectedWords.value.indexOf(oldWord)
    if (selectedIndex > -1) {
      selectedWords.value[selectedIndex] = newWord
    }
    
    saveImportQueue()
  }
  
  closeEditModal()
}

const closeEditModal = () => {
  showEditModal.value = false
  editingWord.value = ''
  editingIndex.value = -1
}

const copySelected = async () => {
  if (selectedWords.value.length === 0) return
  
  try {
    const text = selectedWords.value.join('\n')
    await navigator.clipboard.writeText(text)
    
    copiedCount.value = selectedWords.value.length
    showSuccessModal.value = true
    
    if (confirm(`Successfully copied ${selectedWords.value.length} words to clipboard. Remove them from the queue?`)) {
      importQueue.value = importQueue.value.filter(word => !selectedWords.value.includes(word))
      saveImportQueue()
    }
    
    selectedWords.value = []
    
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    alert('Failed to copy to clipboard. Please try again.')
  }
}

const copyList = async () => {
  const text = importQueue.value.join('\n')
  
  try {
    await navigator.clipboard.writeText(text)
    alert('Word list copied to clipboard!')
  } catch (err) {
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    alert('Word list copied to clipboard!')
  }
}

const clearAll = () => {
  if (confirm('Are you sure you want to clear all words from the import queue?')) {
    importQueue.value = []
    selectedWords.value = []
    saveImportQueue()
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  copiedCount.value = 0
}
</script>

<style scoped>
.import-queue-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 1rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
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

.empty-state {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 3rem 2rem;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-primary);
  min-height: 300px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  justify-content: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.7;
}

.empty-text h3 {
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.empty-text p {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
  max-width: 400px;
}

.empty-actions {
  display: flex;
  justify-content: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-secondary);
}

.queue-section {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  border: 1px solid var(--border-primary);
}

.queue-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.words-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.word-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.word-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.word-item.selected {
  border-color: var(--primary-color);
  background: var(--bg-secondary);
}

.word-display {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.word-index {
  background: var(--bg-accent);
  color: var(--text-accent);
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.word-content {
  flex: 1;
}

.word-main {
  margin-bottom: 0.5rem;
}

.word-italian {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.word-status {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin: 0;
}

.word-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.word-checkbox {
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
}

.action-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  font-size: 0.9rem;
}

.action-btn:hover {
  background: var(--bg-tertiary);
  transform: scale(1.05);
}

.edit-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.delete-btn:hover {
  border-color: #dc3545;
  color: #dc3545;
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

.btn-primary:hover:not(:disabled) {
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

.btn-danger {
  background: var(--error);
  color: white;
}

.btn-danger:hover {
  background: var(--error-dark);
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
}

.modal-content {
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.success-modal {
  max-width: 400px;
}

.modal-header {
  padding: 1.5rem 1.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--border-radius);
  color: var(--text-secondary);
}

.btn-close:hover {
  background: var(--bg-secondary);
}

.modal-form {
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

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-primary-alpha);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.success-content {
  padding: 1.5rem;
  text-align: center;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.success-content p {
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.success-note {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.success-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .import-queue-page {
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
  
  .header-actions {
    flex-direction: column;
  }
  
  .queue-actions {
    flex-direction: column;
  }
  
  .words-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-actions,
  .success-actions {
    flex-direction: column;
  }
  
  .empty-state {
    padding: 2rem 1rem;
    margin: 0 0.5rem;
    gap: 1.5rem;
    min-height: auto;
  }
  
  .empty-content {
    gap: 1rem;
  }
  
  .empty-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  .empty-text h3 {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
    line-height: 1.3;
  }
  
  .empty-text p {
    font-size: 0.9rem;
    line-height: 1.5;
    padding: 0 0.5rem;
  }
  
  .empty-actions {
    padding-top: 1.5rem;
    margin-top: 0.5rem;
  }
  
  .empty-actions .btn {
    width: 100%;
    padding: 1rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
  }
}

/* Animations */
.animate-slide-down {
  animation: slideDown 0.6s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>