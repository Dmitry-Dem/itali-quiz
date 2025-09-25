<template>
  <div class="word-list-page">
    <div class="container">
      <div class="page-header animate-slide-down">
        <div class="header-content">
          <h1 class="page-title">My Vocabulary</h1>
          <p class="page-subtitle">{{ words.length }} word{{ words.length !== 1 ? 's' : '' }} in your collection</p>
        </div>
        
        <div class="header-actions">
          <button @click="showAddModal = true" class="btn btn-primary">
            <span>➕</span>
            Add Word
          </button>
        </div>
      </div>

      <div class="search-section animate-slide-up">
        <div class="search-container">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input 
              v-model="searchQuery"
              type="text" 
              class="search-input"
              placeholder="Search Italian or English words..."
            >
            <button 
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="clear-search"
            >
              ✕
            </button>
          </div>
          
          <div class="filter-wrapper">
            <select v-model="learnedFilter" class="learned-filter">
              <option value="all">All Words</option>
              <option value="learned">Learned Only</option>
              <option value="unlearned">Not Learned</option>
            </select>
          </div>
        </div>
      </div>

      <div class="words-section animate-fade-in">
        <div v-if="filteredWords.length === 0 && searchQuery" class="no-results">
          <div class="no-results-icon">🔍</div>
          <h3>No words found</h3>
          <p>Try searching with different keywords</p>
        </div>
        
        <div v-else-if="words.length === 0" class="empty-state">
          <div class="empty-icon">📚</div>
          <h3>No words yet</h3>
          <p>Start building your Italian vocabulary!</p>
          <button @click="showAddModal = true" class="btn btn-primary mt-4">
            Add Your First Word
          </button>
        </div>
        
        <div v-else class="words-grid">
          <div 
            v-for="word in filteredWords" 
            :key="word.id"
            class="word-item"
            :class="{ 'editing': editingId === word.id }"
          >
            <div v-if="editingId !== word.id" class="word-display">
              <div class="word-content">
                <div class="italian-text">{{ word.italian }}</div>
                <div class="english-text">{{ word.english }}</div>
                <div class="word-meta">
                  <span class="category-badge">{{ getGroupName(word.groupId) || 'general' }}</span>
                  <span class="difficulty-badge" :class="word.difficulty || 'beginner'">
                    {{ word.difficulty || 'beginner' }}
                  </span>
                  <span v-if="word.learned" class="learned-badge">✅ Learned</span>
                  <span class="word-date">{{ formatDate(word.createdAt) }}</span>
                </div>
              </div>
              
              <div class="word-actions">
                <button 
                  @click="toggleLearned(word.id)"
                  class="action-btn learned-btn"
                  :class="{ 'learned': word.learned }"
                  :title="word.learned ? 'Mark as not learned' : 'Mark as learned'"
                >
                  {{ word.learned ? '✅' : '📚' }}
                </button>
                <button 
                  @click="startEdit(word)"
                  class="action-btn edit-btn"
                  title="Edit word"
                >
                  ✏️
                </button>
                <button 
                  @click="confirmDelete(word)"
                  class="action-btn delete-btn"
                  title="Delete word"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <div v-else class="word-edit">
              <div class="edit-form">
                <input 
                  v-model="editForm.italian"
                  type="text" 
                  class="edit-input italian-input"
                  placeholder="Italian word"
                  ref="editItalianInput"
                >
                <input 
                  v-model="editForm.english"
                  type="text" 
                  class="edit-input english-input"
                  placeholder="English translation"
                >
              </div>
              
              <div class="edit-actions">
                <button @click="cancelEdit" class="action-btn cancel-btn">
                  ✕
                </button>
                <button @click="saveEdit" class="action-btn save-btn">
                  ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click="closeAddModal">
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
              ref="addItalianInput"
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
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Category</label>
              <select v-model="newWord.groupId" class="form-input">
                <option 
                  v-for="group in wordGroups" 
                  :key="group.id" 
                  :value="group.id"
                >
                  {{ group.icon }} {{ group.name }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Difficulty</label>
              <select v-model="newWord.difficulty" class="form-input">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
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

    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3>Delete Word</h3>
        </div>
        
        <div class="modal-body">
          <p>Are you sure you want to delete this word?</p>
          <div class="word-preview">
            <strong>{{ wordToDelete?.italian }}</strong> - {{ wordToDelete?.english }}
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn btn-secondary">
            Cancel
          </button>
          <button @click="deleteWord" class="btn btn-danger">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useAppStore, type Word } from '../composables/useAppStore'

const { words, wordGroups, addWord, removeWord, updateWord, searchWords, toggleWordLearned } = useAppStore()

const searchQuery = ref('')
const learnedFilter = ref('all')

const showAddModal = ref(false)
const addItalianInput = ref<HTMLInputElement>()
const newWord = ref({
  italian: '',
  english: '',
  groupId: 'default-group',
  difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced'
})

const editingId = ref<string | null>(null)
const editItalianInput = ref<HTMLInputElement>()
const editForm = ref({
  italian: '',
  english: '',
  groupId: 'default-group',
  difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced'
})

const showDeleteModal = ref(false)
const wordToDelete = ref<Word | null>(null)

const filteredWords = computed(() => {
  let filtered = searchWords(searchQuery.value)
  
  if (learnedFilter.value === 'learned') {
    filtered = filtered.filter(word => word.learned)
  } else if (learnedFilter.value === 'unlearned') {
    filtered = filtered.filter(word => !word.learned)
  }
  
  return filtered
})

const getGroupName = (groupId: string) => {
  const group = wordGroups.value.find(g => g.id === groupId)
  return group?.name || 'General'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  })
}

const handleAddWord = () => {
  if (newWord.value.italian.trim() && newWord.value.english.trim()) {
    addWord(newWord.value.italian, newWord.value.english, newWord.value.groupId, newWord.value.difficulty)
    newWord.value = { italian: '', english: '', groupId: 'default-group', difficulty: 'beginner' }
    showAddModal.value = false
  }
}

const closeAddModal = () => {
  showAddModal.value = false
  newWord.value = { italian: '', english: '', groupId: 'default-group', difficulty: 'beginner' }
}

const startEdit = (word: Word) => {
  editingId.value = word.id
  editForm.value = {
    italian: word.italian,
    english: word.english,
    groupId: word.groupId || 'default-group',
    difficulty: word.difficulty || 'beginner'
  }
  
  nextTick(() => {
    if (editItalianInput.value) {
      editItalianInput.value.focus()
    }
  })
}

const cancelEdit = () => {
  editingId.value = null
  editForm.value = { italian: '', english: '', groupId: 'default-group', difficulty: 'beginner' }
}

const saveEdit = () => {
  if (editingId.value && editForm.value.italian.trim() && editForm.value.english.trim()) {
    updateWord(editingId.value, editForm.value.italian, editForm.value.english, editForm.value.groupId, editForm.value.difficulty)
    editingId.value = null
    editForm.value = { italian: '', english: '', groupId: 'default-group', difficulty: 'beginner' }
  }
}

const confirmDelete = (word: Word) => {
  wordToDelete.value = word
  showDeleteModal.value = true
}

const toggleLearned = (wordId: string) => {
  toggleWordLearned(wordId)
}

const deleteWord = () => {
  if (wordToDelete.value) {
    removeWord(wordToDelete.value.id)
    wordToDelete.value = null
    showDeleteModal.value = false
  }
}

nextTick(() => {
  if (showAddModal.value && addItalianInput.value) {
    addItalianInput.value.focus()
  }
})
</script>

<style scoped>
.word-list-page {
  min-height: 100vh;
  padding: 2rem 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.header-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.search-section {
  margin-bottom: 2rem;
}

.search-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
}

.filter-wrapper {
  min-width: 150px;
}

.learned-filter {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.learned-filter:focus {
  outline: none;
  border-color: var(--border-color-focus);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1rem;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--border-color-focus);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
}

.clear-search {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.25rem;
}

.words-grid {
  display: grid;
  gap: 1rem;
}

.word-item {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.word-item:hover:not(.editing) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.word-display {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.word-content {
  flex: 1;
}

.italian-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.english-text {
  color: var(--text-secondary);
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.english-text {
  color: var(--text-secondary);
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.word-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.category-badge {
  background-color: var(--bg-accent);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.difficulty-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.difficulty-badge.beginner {
  background-color: #10b981;
  color: white;
}

.difficulty-badge.intermediate {
  background-color: #f59e0b;
  color: white;
}

.difficulty-badge.advanced {
  background-color: #ef4444;
  color: white;
}

.word-date {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.word-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem;
  align-self: flex-start;
  margin-top: 0.125rem;
}

.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.edit-btn {
  background-color: var(--bg-accent);
  color: white;
}

.edit-btn:hover {
  background-color: var(--bg-accent-hover);
}

.delete-btn {
  background-color: #ef4444;
  color: white;
}

.delete-btn:hover {
  background-color: #dc2626;
}

.learned-btn {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.learned-btn:hover {
  background-color: var(--bg-accent-hover);
}

.learned-btn.learned {
  background-color: #10b981;
  color: white;
}

.learned-btn.learned:hover {
  background-color: #059669;
}

.learned-badge {
  background-color: #10b981;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.word-edit {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.edit-form {
  flex: 1;
  display: flex;
  gap: 1rem;
}

.edit-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
}

.edit-input:focus {
  outline: none;
  border-color: var(--border-color-focus);
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
}

.save-btn {
  background-color: #10b981;
  color: white;
}

.save-btn:hover {
  background-color: #059669;
}

.cancel-btn {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.cancel-btn:hover {
  background-color: var(--border-color);
}

.empty-state, .no-results {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.empty-icon, .no-results-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3, .no-results h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
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

.delete-modal {
  max-width: 400px;
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

.modal-body {
  padding: 1.5rem;
}

.word-preview {
  background-color: var(--bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: center;
}

.modal-form {
  padding: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding: 0 1.5rem 1.5rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .header-actions .btn {
    width: 100%;
  }
  
  .search-container {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .filter-wrapper {
    min-width: auto;
  }
  
  .word-display {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .word-actions {
    margin-left: 0;
    align-self: flex-end;
  }
  
  .edit-form {
    flex-direction: column;
  }
  
  .word-edit {
    flex-direction: column;
    align-items: stretch;
  }
  
  .edit-actions {
    align-self: flex-end;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>