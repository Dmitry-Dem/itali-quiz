<template>
  <div class="notes-page">
    <div class="container">
      <div class="page-header animate-slide-down">
        <div class="header-content">
          <h1 class="page-title">Notes</h1>
          <p class="page-subtitle">{{ notes.length }} note{{ notes.length !== 1 ? 's' : '' }}</p>
        </div>
        
        <div class="header-actions">
          <button @click="showAddModal = true" class="btn btn-primary">
            <span>📝</span>
            Add Note
          </button>
        </div>
      </div>

      <div class="category-filter animate-fade-in" v-if="categories.length > 0">
        <div class="category-chips">
          <button 
            @click="selectedCategory = null"
            class="category-chip"
            :class="{ 'active': selectedCategory === null }"
          >
            All
          </button>
          <button 
            v-for="category in categories"
            :key="category.name"
            @click="selectedCategory = category.name"
            class="category-chip"
            :class="{ 'active': selectedCategory === category.name }"
            :style="{ 
              backgroundColor: category.color,
              color: getContrastColor(category.color)
            }"
          >
            {{ category.name }}
          </button>
        </div>
      </div>

      <div class="notes-section animate-fade-in">
        <div v-if="filteredNotes.length === 0 && notes.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>No notes yet</h3>
          <p>Create your first note to store Italian learning tips, grammar rules, or personal observations.</p>
          <button @click="showAddModal = true" class="btn btn-primary mt-4">
            Create Note
          </button>
        </div>

        <div v-else-if="filteredNotes.length === 0" class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>No notes in this category</h3>
          <p>Try selecting a different category or create a new note.</p>
        </div>

        <div v-else class="notes-grid">
          <div 
            v-for="note in filteredNotes" 
            :key="note.id" 
            class="note-card"
            @click="viewNote(note)"
          >
            <div class="note-header">
              <h3 class="note-title">{{ note.title }}</h3>
              <div class="note-category-badge" 
                   :style="{ backgroundColor: getCategoryColor(note.category) }">
                {{ note.category }}
              </div>
            </div>
            
            <div class="note-preview">{{ getPreview(note.content) }}</div>
            
            <div class="note-footer">
              <span class="note-date">{{ formatDate(note.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAddModal || editingNote" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingNote ? 'Edit Note' : 'Add Note' }}</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        
        <form @submit.prevent="saveNote" class="modal-body">
          <div class="form-group">
            <label>Title</label>
            <input 
              v-model="currentNote.title"
              type="text"
              placeholder="Note title..."
              class="form-input"
              required
              ref="titleInput"
            >
          </div>

          <div class="form-group">
            <label>Category</label>
            <input 
              v-model="currentNote.category"
              type="text"
              placeholder="Grammar, Vocabulary, Tips..."
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label>Color</label>
            <div class="color-picker">
              <input 
                v-model="currentNote.color"
                type="color"
                class="color-input"
              >
              <div class="color-suggestions">
                <button 
                  v-for="color in noteColors" 
                  :key="color"
                  type="button"
                  @click="currentNote.color = color"
                  class="color-option"
                  :style="{ backgroundColor: color }"
                  :class="{ active: currentNote.color === color }"
                ></button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Content</label>
            <textarea 
              v-model="currentNote.content"
              placeholder="Write your note here...

                You can use:
                - **bold text**
                - *italic text*
                - Lists with bullet points
                - Line breaks for organization"
              class="form-textarea"
              rows="10"
              required
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">
              {{ editingNote ? 'Update' : 'Save' }} Note
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore, type Note } from '../composables/useAppStore'

const router = useRouter()
const { notes, addNote, updateNote, removeNote } = useAppStore()

const showAddModal = ref(false)
const editingNote = ref<Note | null>(null)
const titleInput = ref<HTMLInputElement>()
const selectedCategory = ref<string | null>(null)

const noteColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

const currentNote = ref<Partial<Note>>({
  title: '',
  content: '',
  category: '',
  color: '#3b82f6'
})

const categories = computed(() => {
  const categoryMap = new Map()
  notes.value.forEach(note => {
    if (note.category && !categoryMap.has(note.category)) {
      categoryMap.set(note.category, {
        name: note.category,
        color: note.color
      })
    }
  })
  return Array.from(categoryMap.values())
})

const filteredNotes = computed(() => {
  if (!selectedCategory.value) {
    return notes.value
  }
  return notes.value.filter(note => note.category === selectedCategory.value)
})

const getCategoryColor = (category: string): string => {
  const note = notes.value.find(n => n.category === category)
  return note?.color || noteColors[0]
}

const getContrastColor = (hexColor: string): string => {
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

const getPreview = (content: string): string => {
  const plainText = content.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')
  return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText
}

const viewNote = (note: Note) => {
  router.push(`/notes/${note.id}`)
}

const formatContent = (content: string): string => {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 24) {
    return 'Today'
  } else if (diffInHours < 48) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString()
  }
}

const editNote = (note: Note) => {
  editingNote.value = note
  currentNote.value = { ...note }
  showAddModal.value = true
  nextTick(() => {
    titleInput.value?.focus()
  })
}

const deleteNote = (id: string) => {
  if (confirm('Are you sure you want to delete this note?')) {
    removeNote(id)
  }
}

const saveNote = () => {
  const now = new Date().toISOString()
  
  if (editingNote.value) {
    const updatedNote: Note = {
      ...editingNote.value,
      ...currentNote.value as Note,
      updatedAt: now
    }
    updateNote(
      updatedNote.id,
      updatedNote.title,
      updatedNote.content,
      updatedNote.color,
      updatedNote.category
    )
  } else {
    addNote(
      currentNote.value.title!,
      currentNote.value.content!,
      currentNote.value.color!,
      currentNote.value.category || ''
    )
  }
  
  closeModal()
}

const closeModal = () => {
  showAddModal.value = false
  editingNote.value = null
  currentNote.value = {
    title: '',
    content: '',
    category: '',
    color: '#3b82f6'
  }
}

onMounted(() => {
  if (showAddModal.value) {
    nextTick(() => {
      titleInput.value?.focus()
    })
  }
})
</script>

<style scoped>
.notes-page {
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

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-primary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

/* Category Filter */
.category-filter {
  margin-bottom: 2rem;
}

.category-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.category-chip {
  padding: 0.5rem 1rem;
  border: 2px solid var(--border-primary);
  border-radius: var(--border-radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.category-chip:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.category-chip.active {
  border-color: var(--accent-primary);
  background: var(--accent-primary);
  color: white;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.note-card {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-primary);
  padding: 1.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}

.note-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent-primary);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.note-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

.note-category-badge {
  background: var(--accent-primary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  border: 2px solid transparent;
}

.note-preview {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.note-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-primary);
}

.note-date {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.note-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
  line-height: 1.3;
}

.note-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.note-card:hover .note-actions {
  opacity: 1;
}

.btn-icon {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  transition: background 0.2s;
}

.btn-icon:hover {
  background: var(--bg-tertiary);
}

.note-content {
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 1rem;
  white-space: pre-wrap;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
  border-top: 1px solid var(--border-primary);
  padding-top: 1rem;
}

.note-category {
  background: var(--bg-accent);
  color: var(--text-accent);
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.8rem;
  font-weight: 500;
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
  padding: 1rem;
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-primary);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-primary);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  line-height: 1;
}

.modal-body {
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
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-alpha-20);
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 200px;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-alpha-20);
}

.color-picker {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.color-input {
  width: 4rem;
  height: 3rem;
  padding: 0;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

.color-suggestions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.color-option {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  background: none;
}

.color-option:hover,
.color-option.active {
  border-color: var(--text-primary);
  transform: scale(1.1);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .notes-page {
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
    justify-content: stretch;
  }
  
  .header-actions .btn {
    flex: 1;
  }
  
  .category-chips {
    justify-content: center;
  }
  
  .notes-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
    max-height: 85vh;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-actions .btn {
    width: 100%;
  }
  
  .view-modal {
    width: 95%;
    margin: 1rem;
  }
}

.animate-slide-down {
  animation: slideDown 0.5s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

/* View Modal Styles */
.view-modal {
  max-width: 700px;
  max-height: 80vh;
  overflow-y: auto;
}

.view-modal-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.view-modal-body {
  padding: 1rem 0;
}

.note-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-primary);
}

.note-content-full {
  color: var(--text-primary);
  line-height: 1.7;
  font-size: 1rem;
}

.note-content-full strong {
  font-weight: 600;
  color: var(--text-primary);
}

.note-content-full em {
  font-style: italic;
  color: var(--text-secondary);
}

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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>