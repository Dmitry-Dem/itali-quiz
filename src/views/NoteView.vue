<template>
  <div class="note-view-page">
    <div class="container">
      <div v-if="!note" class="error-state">
        <div class="error-icon">📝</div>
        <h2>Note not found</h2>
        <p>The note you're looking for doesn't exist or has been deleted.</p>
        <router-link to="/notes" class="btn btn-primary">
          Back to Notes
        </router-link>
      </div>

      <div v-else class="note-view">
        <div class="note-header">
          <div class="header-actions">
            <router-link to="/notes" class="btn btn-secondary">
              <span>←</span>
              Back to Notes
            </router-link>
            <div class="action-buttons">
              <button @click="editNote" class="btn btn-secondary">
                <span>✏️</span>
                Edit
              </button>
              <button @click="deleteCurrentNote" class="btn btn-danger">
                <span>🗑️</span>
                Delete
              </button>
            </div>
          </div>
          
          <div class="note-meta">
            <h1 class="note-title">{{ note.title }}</h1>
            <div class="note-info">
              <span 
                class="note-category-badge" 
                :style="{ 
                  backgroundColor: note.color,
                  color: getContrastColor(note.color)
                }"
              >
                {{ note.category }}
              </span>
              <span class="note-date">Last updated {{ formatDate(note.updatedAt) }}</span>
            </div>
          </div>
        </div>

        <div class="note-content" v-html="formatContent(note.content)"></div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Edit Note</h2>
          <button @click="closeModal" class="btn-close">✕</button>
        </div>

        <form @submit.prevent="saveNote" class="modal-form">
          <div class="form-group">
            <label>Title</label>
            <input 
              ref="titleInput"
              v-model="editForm.title"
              type="text"
              class="form-input"
              required
              placeholder="Note title..."
            >
          </div>

          <div class="form-group">
            <label>Category</label>
            <input 
              v-model="editForm.category"
              type="text"
              placeholder="Grammar, Vocabulary, Tips..."
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label>Color</label>
            <div class="color-picker">
              <input 
                v-model="editForm.color"
                type="color"
                class="color-input"
              >
              <div class="color-suggestions">
                <button 
                  v-for="color in noteColors" 
                  :key="color"
                  type="button"
                  @click="editForm.color = color"
                  class="color-option"
                  :style="{ backgroundColor: color }"
                  :class="{ active: editForm.color === color }"
                ></button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Content</label>
            <textarea 
              v-model="editForm.content"
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
            <button type="submit" class="btn btn-primary">Update Note</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore, type Note } from '../composables/useAppStore'

const route = useRoute()
const router = useRouter()
const { notes, updateNote, removeNote } = useAppStore()

const showEditModal = ref(false)
const titleInput = ref<HTMLInputElement>()

const noteColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

const editForm = ref({
  title: '',
  content: '',
  category: '',
  color: '#3b82f6'
})

const note = computed(() => {
  const noteId = route.params.id as string
  return notes.value.find(n => n.id === noteId) || null
})

const getContrastColor = (hexColor: string): string => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? '#000000' : '#ffffff'
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
    return 'today'
  } else if (diffInHours < 48) {
    return 'yesterday'
  } else if (diffInHours < 168) {
    return `${Math.floor(diffInHours / 24)} days ago`
  } else {
    return date.toLocaleDateString()
  }
}

const editNote = () => {
  if (!note.value) return
  
  editForm.value = {
    title: note.value.title,
    content: note.value.content,
    category: note.value.category,
    color: note.value.color
  }
  showEditModal.value = true
  nextTick(() => {
    titleInput.value?.focus()
  })
}

const deleteCurrentNote = () => {
  if (!note.value) return
  
  if (confirm('Are you sure you want to delete this note?')) {
    removeNote(note.value.id)
    router.push('/notes')
  }
}

const saveNote = () => {
  if (!note.value) return
  
  updateNote(
    note.value.id,
    editForm.value.title,
    editForm.value.content,
    editForm.value.color,
    editForm.value.category
  )
  closeModal()
}

const closeModal = () => {
  showEditModal.value = false
  editForm.value = {
    title: '',
    content: '',
    category: '',
    color: '#3b82f6'
  }
}

onMounted(() => {
  // If note doesn't exist, redirect to notes page
  if (!note.value) {
    router.replace('/notes')
  }
})
</script>

<style scoped>
.note-view-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 2rem;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-primary);
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.note-view {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-primary);
  overflow: hidden;
}

.note-header {
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid var(--border-primary);
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.note-meta {
  text-align: left;
}

.note-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  line-height: 1.2;
}

.note-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.note-category-badge {
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  font-weight: 500;
  border: 2px solid transparent;
}

.note-date {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.note-content {
  padding: 2rem;
  color: var(--text-primary);
  line-height: 1.7;
  font-size: 1.1rem;
}

.note-content strong {
  font-weight: 600;
  color: var(--text-primary);
}

.note-content em {
  font-style: italic;
  color: var(--text-secondary);
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
}

.modal-content {
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem 1.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
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
  text-decoration: none;
  font-weight: 500;
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
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
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

/* Theme-specific styles for delete button */
[data-theme="ocean"] .btn-danger {
  background: #dc2626;
  color: white;
}

[data-theme="ocean"] .btn-danger:hover {
  background: #b91c1c;
}

[data-theme="midnight"] .btn-danger {
  background: #dc2626;
  color: white;
}

[data-theme="midnight"] .btn-danger:hover {
  background: #b91c1c;
}

[data-theme="dark"] .btn-danger {
  background: #dc2626;
  color: white;
}

[data-theme="dark"] .btn-danger:hover {
  background: #b91c1c;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .note-view-page {
    padding: 1rem;
  }
  
  .note-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .note-title {
    font-size: 2rem;
  }
  
  .note-content {
    padding: 1.5rem;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>