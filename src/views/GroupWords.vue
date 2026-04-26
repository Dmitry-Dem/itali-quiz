<template>
  <div class="group-words-container">
    <div class="header">
      <div class="breadcrumb">
        <router-link to="/groups" class="breadcrumb-link">Categories</router-link>
        <span class="breadcrumb-separator">›</span>
        <span class="current-group">{{ currentGroup?.name || 'Loading...' }}</span>
      </div>
      
      <div class="group-info" v-if="currentGroup">
        <div class="group-badge" :style="{ backgroundColor: currentGroup.color + '20', color: currentGroup.color }">
          <span class="group-icon">{{ currentGroup.icon }}</span>
          <span class="group-name">{{ currentGroup.name }}</span>
        </div>
        <p class="group-description">{{ currentGroup.description }}</p>
      </div>
    </div>

    <div class="actions-bar">
      <div class="word-count">
        {{ filteredWords.length }} {{ filteredWords.length === 1 ? 'word' : 'words' }}
      </div>
      
      <div class="actions">
        <button 
          @click="goToFlashCards" 
          class="btn btn-flashcard"
          :disabled="filteredWords.length === 0"
          title="Study with flashcards"
        >
          <span class="icon">🃏</span>
          Flashcards
        </button>
        <button @click="showAddWordModal = true" class="btn btn-primary">
          <span class="icon">➕</span>
          Add Word
        </button>
        <button @click="showBulkImportModal = true" class="btn btn-primary">
          <span class="icon">📥</span>
          Bulk Import
        </button>
        <button @click="showEditGroupModal = true" class="btn btn-secondary">
          <span class="icon">✏️</span>
          Edit Category
        </button>
      </div>
    </div>

    <SearchFilter 
      v-model="searchQuery"
      v-model:learnedFilter="learnedFilter"
      placeholder="Search words in this category..."
      :showLearnedFilter="true"
    />

    <div v-if="isLoading" class="loading">
      Loading words...
    </div>

    <div v-else-if="filteredWords.length === 0 && searchQuery" class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>No words found</h3>
      <p>Try searching with different keywords</p>
      <button @click="searchQuery = ''" class="btn btn-secondary">
        Clear Search
      </button>
    </div>

    <div v-else-if="filteredWords.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>No words in this category yet</h3>
      <p>Add your first word to get started!</p>
      <button @click="showAddWordModal = true" class="btn btn-primary">
        Add First Word
      </button>
    </div>

    <div v-else class="words-list">
      <div 
        v-for="word in filteredWords" 
        :key="word.id"
        class="word-card"
      >
        <div class="word-content">
          <div class="word-pair">
            <div class="italian-word">{{ word.italian }}</div>
            <div class="english-word" :style="{ visibility: showTranslations ? 'visible' : 'hidden' }">{{ word.english }}</div>
          </div>
          
          <div class="word-meta">
            <span v-if="word.difficulty" class="difficulty-badge" :class="word.difficulty">
              {{ word.difficulty }}
            </span>
            <span v-if="word.learned" class="learned-badge">✅ Learned</span>
            <span v-if="word.wrongAttempts > 0" class="attempts-badge wrong">
              {{ word.wrongAttempts }} wrong
            </span>
            <span v-if="word.correctAttempts > 0" class="attempts-badge correct">
              {{ word.correctAttempts }} correct
            </span>
            <span class="created-date">{{ formatDate(word.createdAt) }}</span>
          </div>
          
          <div v-if="word.details || word.example" class="word-details">
            <div v-if="word.details" class="details">
              <strong>Note:</strong> {{ word.details }}
            </div>
            <div v-if="word.example" class="example">
              <strong>Example:</strong> {{ word.example }}
            </div>
          </div>
        </div>

        <div class="word-actions">
          <button 
            @click="toggleLearned(word.id)" 
            class="btn-icon learned-toggle"
            :class="{ 'learned': word.learned }"
            :title="word.learned ? 'Mark as not learned' : 'Mark as learned'"
          >
            {{ word.learned ? '✅' : '📚' }}
          </button>
          <button @click="editWord(word)" class="btn-icon" title="Edit Word">
            ✏️
          </button>
          <button @click="deleteWordConfirm(word.id)" class="btn-icon danger" title="Delete Word">
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Word Modal -->
    <div v-if="showAddWordModal || editingWord" class="modal-overlay" @click="closeWordModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingWord ? 'Edit Word' : 'Add New Word' }}</h3>
          <button @click="closeWordModal" class="btn-close">✕</button>
        </div>

        <form @submit.prevent="saveWord" class="modal-form">
          <div class="form-group">
            <label for="italianWord">Word</label>
            <input 
              id="italianWord"
              v-model="wordForm.italian" 
              type="text" 
              required 
              placeholder="e.g., ciao"
            >
          </div>

          <div class="form-group">
            <label for="englishWord">English Translation</label>
            <input 
              id="englishWord"
              v-model="wordForm.english" 
              type="text" 
              required 
              placeholder="e.g., hello"
            >
          </div>

          <div class="form-group">
            <label for="difficulty">Difficulty Level</label>
            <select id="difficulty" v-model="wordForm.difficulty">
              <option value="">Not specified</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div class="form-group">
            <label for="details">Details <span class="optional">(optional)</span></label>
            <textarea 
              id="details"
              v-model="wordForm.details" 
              placeholder="Grammar notes, pronunciation tips, etc."
              rows="2"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="example">Usage Example <span class="optional">(optional)</span></label>
            <textarea 
              id="example"
              v-model="wordForm.example" 
              placeholder="e.g., Ciao Maria! Come stai? (Hi Maria! How are you?)"
              rows="3"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeWordModal" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              {{ editingWord ? 'Update' : 'Add' }} Word
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Group Modal -->
    <div v-if="showEditGroupModal" class="modal-overlay" @click="closeGroupModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Edit Category</h3>
          <button @click="closeGroupModal" class="btn-close">✕</button>
        </div>

        <form @submit.prevent="saveGroup" class="modal-form">
          <div class="form-group">
            <label for="groupName">Category Name</label>
            <input 
              id="groupName"
              v-model="groupForm.name" 
              type="text" 
              required 
            >
          </div>

          <div class="form-group">
            <label for="groupDescription">Description</label>
            <textarea 
              id="groupDescription"
              v-model="groupForm.description" 
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="groupIcon">Icon</label>
            <div class="icon-picker">
              <input 
                id="groupIcon"
                v-model="groupForm.icon" 
                type="text" 
                maxlength="2"
              >
              <div class="icon-suggestions">
                <button 
                  v-for="icon in suggestedIcons" 
                  :key="icon"
                  type="button"
                  @click="groupForm.icon = icon"
                  class="icon-option"
                  :class="{ active: groupForm.icon === icon }"
                >
                  {{ icon }}
                </button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="groupColor">Color</label>
            <div class="color-picker">
              <input 
                id="groupColor"
                v-model="groupForm.color" 
                type="color"
              >
              <div class="color-suggestions">
                <button 
                  v-for="color in suggestedColors" 
                  :key="color"
                  type="button"
                  @click="groupForm.color = color"
                  class="color-option"
                  :style="{ backgroundColor: color }"
                  :class="{ active: groupForm.color === color }"
                ></button>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeGroupModal" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              Update Category
            </button>
          </div>
        </form>
      </div>
    </div>

    <BulkImport
      :is-open="showBulkImportModal"
      :category-name="currentGroup?.name"
      @close="showBulkImportModal = false"
      @import="handleBulkImport"
    />

    <button
      @click="showTranslations = !showTranslations"
      class="floating-toggle-btn"
      :class="{ 'translations-hidden': !showTranslations }"
      :title="showTranslations ? 'Hide translations' : 'Show translations'"
    >
      <span v-if="showTranslations">👁️</span>
      <span v-else>🙈</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore, type Word } from '../composables/useAppStore'
import BulkImport from '../components/BulkImport.vue'
import SearchFilter from '../components/SearchFilter.vue'

const route = useRoute()
const router = useRouter()
const { words, wordGroups, isLoading, loadData, addWord, updateWord, removeWord, updateWordGroup, toggleWordLearned } = useAppStore()

const groupId = computed(() => route.params.groupId as string)

const showAddWordModal = ref(false)
const showEditGroupModal = ref(false)
const showBulkImportModal = ref(false)
const showTranslations = ref(true)
const editingWord = ref<Word | null>(null)
const searchQuery = ref('')
const learnedFilter = ref<'all' | 'learned' | 'unlearned'>('all')

const wordForm = ref({
  italian: '',
  english: '',
  difficulty: '' as '' | 'beginner' | 'intermediate' | 'advanced',
  details: '',
  example: ''
})

const groupForm = ref({
  name: '',
  description: '',
  icon: '',
  color: ''
})

const suggestedIcons = ['📚', '🍝', '✈️', '👨‍👩‍👧‍👦', '👋', '🏠', '🚗', '💼', '🎵', '🏃‍♂️', '🌟', '❤️']
const suggestedColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

const currentGroup = computed(() => {
  return wordGroups.value.find(group => group.id === groupId.value)
})

const filteredWords = computed(() => {
  // First filter by group
  let groupWords = words.value.filter(word => word.groupId === groupId.value)
  
  // Then apply search if there's a query
  if (searchQuery.value.trim()) {
    const lowercaseQuery = searchQuery.value.toLowerCase()
    groupWords = groupWords.filter(word => 
      word.italian.toLowerCase().includes(lowercaseQuery) ||
      word.english.toLowerCase().includes(lowercaseQuery)
    )
  }
  
  // Finally apply learned filter
  if (learnedFilter.value === 'learned') {
    groupWords = groupWords.filter(word => word.learned)
  } else if (learnedFilter.value === 'unlearned') {
    groupWords = groupWords.filter(word => !word.learned)
  }
  
  return groupWords
})

onMounted(() => {
  loadData()
})

watch(currentGroup, (newGroup) => {
  if (newGroup) {
    groupForm.value = {
      name: newGroup.name,
      description: newGroup.description || '',
      icon: newGroup.icon,
      color: newGroup.color
    }
  }
}, { immediate: true })

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const goToFlashCards = () => {
  router.push(`/flashcards/${groupId.value}`)
}

const toggleLearned = (wordId: string) => {
  toggleWordLearned(wordId)
}

const editWord = (word: Word) => {
  editingWord.value = word
  wordForm.value = {
    italian: word.italian,
    english: word.english,
    difficulty: word.difficulty || '',
    details: word.details || '',
    example: word.example || ''
  }
}

const saveWord = async () => {
  try {
    if (editingWord.value) {
      updateWord(
        editingWord.value.id,
        wordForm.value.italian,
        wordForm.value.english,
        editingWord.value.groupId,
        wordForm.value.difficulty || undefined,
        wordForm.value.details,
        wordForm.value.example
      )
    } else {
      await addWord(
        wordForm.value.italian,
        wordForm.value.english,
        groupId.value,
        wordForm.value.difficulty || undefined,
        wordForm.value.details,
        wordForm.value.example
      )
    }
    closeWordModal()
  } catch (error) {
    alert('Failed to save word. Please try again.')
  }
}

const deleteWordConfirm = async (wordId: string) => {
  const word = words.value.find(w => w.id === wordId)
  const confirmed = confirm(`Are you sure you want to delete "${word?.italian}" (${word?.english})?`)
  
  if (confirmed) {
    try {
      await removeWord(wordId)
    } catch (error) {
      alert('Failed to delete word. Please try again.')
    }
  }
}

const saveGroup = async () => {
  if (!currentGroup.value) return
  
  try {
    await updateWordGroup(currentGroup.value.id, {
      name: groupForm.value.name,
      description: groupForm.value.description,
      icon: groupForm.value.icon,
      color: groupForm.value.color
    })
    closeGroupModal()
  } catch (error) {
    alert('Failed to update category. Please try again.')
  }
}

const closeWordModal = () => {
  showAddWordModal.value = false
  editingWord.value = null
  wordForm.value = {
    italian: '',
    english: '',
    difficulty: '',
    details: '',
    example: ''
  }
}

const closeGroupModal = () => {
  showEditGroupModal.value = false
}

const handleBulkImport = (data: { words: Array<{ italian: string; english: string; details?: string }> }) => {
  data.words.forEach(word => {
    addWord(
      word.italian,
      word.english,
      groupId.value,
      undefined,
      word.details,
      undefined
    )
  })
  
  alert(`Successfully imported ${data.words.length} word(s) to ${currentGroup.value?.name}`)
}
</script>

<style scoped>
.group-words-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 2rem;
}

.breadcrumb {
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.breadcrumb-link {
  color: var(--primary-color);
  text-decoration: none;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-separator {
  margin: 0 0.5rem;
  color: var(--text-secondary);
}

.current-group {
  color: var(--text-primary);
  font-weight: 600;
}

.group-info {
  margin-top: 1rem;
}

.group-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.group-icon {
  font-size: 1.25rem;
}

.group-description {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 0.75rem;
}

.word-count {
  color: var(--text-secondary);
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-quaternary);
}

.btn-flashcard {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(240, 147, 251, 0.3);
}

.btn-flashcard:hover:not(:disabled) {
  background: linear-gradient(135deg, #e186f0 0%, #e34960 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(240, 147, 251, 0.4);
}

.btn-flashcard:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
  font-size: 1.1rem;
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
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.words-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.word-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}

.word-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.word-content {
  flex: 1;
}

.word-pair {
  margin-bottom: 0.5rem;
}

.italian-word {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.english-word {
  color: var(--text-secondary);
  font-size: 1rem;
}

.word-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.word-details {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
  font-style: italic;
}

.word-example {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
  padding: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 0.25rem;
  border-left: 3px solid var(--primary-color);
}

.word-stats {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.stat-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-weight: 600;
}

.stat-badge.correct {
  background: rgba(34, 197, 94, 0.1);
  color: #059669;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.stat-badge.wrong {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.difficulty-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.difficulty-badge.beginner {
  background: #10b98120;
  color: #10b981;
}

.difficulty-badge.intermediate {
  background: #f59e0b20;
  color: #f59e0b;
}

.difficulty-badge.advanced {
  background: #ef444420;
  color: #ef4444;
}

.created-date {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.word-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem;
}

.btn-icon {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 1rem;
}

.btn-icon:hover {
  background: var(--bg-tertiary);
}

.btn-icon.danger:hover {
  background: #ef444420;
}

.btn-icon.learned-toggle {
  transition: all 0.2s ease;
}

.btn-icon.learned-toggle:hover {
  background: var(--bg-accent-hover);
}

.btn-icon.learned-toggle.learned {
  background: #10b981;
  color: white;
}

.btn-icon.learned-toggle.learned:hover {
  background: #059669;
}

.learned-badge {
  background-color: #10b981;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--bg-primary);
  border-radius: 1rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
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
  border-radius: 0.5rem;
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
  color: var(--text-primary);
  font-weight: 600;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.icon-picker input {
  margin-bottom: 1rem;
}

.icon-suggestions,
.color-suggestions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.icon-option,
.color-option {
  padding: 0.5rem;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-option {
  background: var(--bg-secondary);
  font-size: 1.25rem;
}

.color-option {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
}

.icon-option:hover,
.color-option:hover,
.icon-option.active,
.color-option.active {
  border-color: var(--primary-color);
}

.color-picker {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.color-picker input[type="color"] {
  width: 4rem;
  height: 3rem;
  padding: 0;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .group-words-container {
    padding: 1rem;
  }
  
  .actions-bar {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    width: 100%;
  }

  .btn {
    font-size: 0.9rem;
    padding: 1rem 0.75rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .word-card {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .word-actions {
    margin-left: 0;
    justify-content: center;
  }
  
  .modal {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
  
  .btn {
    padding: 0.875rem 0.5rem;
    font-size: 0.85rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    min-height: 60px;
  }
  
  .btn .icon {
    font-size: 1.2rem;
  }
  
  .actions-bar {
    gap: 0.75rem;
  }
}

.floating-toggle-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: var(--bg-accent);
  color: var(--text-accent);
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-toggle-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: var(--shadow-xl);
}

.floating-toggle-btn:active {
  transform: translateY(0) scale(0.95);
}

.floating-toggle-btn.translations-hidden {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

@media (max-width: 768px) {
  .floating-toggle-btn {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 48px;
    height: 48px;
    font-size: 1.3rem;
  }
}
</style>