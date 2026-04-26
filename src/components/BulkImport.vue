<template>
  <div v-if="isOpen" class="modal-overlay" @click="handleClose">
    <div class="modal bulk-import-modal" @click.stop>
      <div class="modal-header">
        <h2>📥 Bulk Import{{ categoryName ? ` to ${categoryName}` : '' }}</h2>
        <button @click="handleClose" class="btn-close">✕</button>
      </div>

      <div class="modal-body">
        <div class="import-instructions">
          <p><strong>Format:</strong> [word][translation][description], [word][translation][description]</p>
          <p><strong>Example:</strong> [ciao][hello][greeting], [grazie][thank you][]</p>
          <p class="note">Note: Description is optional. Separate multiple words with commas.</p>
        </div>

        <div v-if="showGroupSelect && groups" class="form-group">
          <label>Select Category</label>
          <select v-model="selectedGroupId" required>
            <option value="">Select a category...</option>
            <option v-for="group in groups" :key="group.id" :value="group.id">
              {{ group.icon }} {{ group.name }}
            </option>
          </select>
        </div>

        <textarea
          v-model="bulkText"
          @input="updatePreview"
          placeholder="[buongiorno][good morning][greeting], [casa][house][noun], [mangiare][to eat][verb]"
          class="bulk-textarea"
          rows="8"
        ></textarea>

        <div v-if="previewWords.length > 0" class="preview-section">
          <div class="preview-header">
            <h3>Preview ({{ previewWords.length }} words)</h3>
            <button @click="clearPreview" class="btn btn-outline btn-sm">Clear All</button>
          </div>
          
          <div class="preview-list">
            <div 
              v-for="(word, index) in previewWords" 
              :key="index" 
              class="preview-item"
            >
              <div class="word-content">
                <div class="word-pair">
                  <span class="italian">{{ word.italian }}</span>
                  <span class="arrow">→</span>
                  <span class="english">{{ word.english }}</span>
                </div>
                <div v-if="word.details" class="word-details">{{ word.details }}</div>
              </div>
              <button 
                @click="removePreviewWord(index)" 
                class="delete-btn"
                title="Remove this word"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" @click="handleClose" class="btn btn-secondary">
            Cancel
          </button>
          <button 
            v-if="previewWords.length === 0"
            @click="updatePreview" 
            class="btn btn-outline"
            :disabled="!bulkText.trim()"
          >
            Preview Words
          </button>
          <button 
            v-else
            @click="handleImport" 
            class="btn btn-primary"
            :disabled="previewWords.length === 0 || (showGroupSelect && !selectedGroupId)"
          >
            Import {{ previewWords.length }} Words
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface WordGroup {
  id: string
  name: string
  icon: string
}

interface Props {
  isOpen: boolean
  categoryName?: string
  showGroupSelect?: boolean
  groups?: WordGroup[]
}

interface Emits {
  (e: 'close'): void
  (e: 'import', data: { words: Array<{ italian: string; english: string; details?: string }>, groupId?: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const bulkText = ref('')
const selectedGroupId = ref('')
const previewWords = ref<Array<{ italian: string; english: string; details?: string }>>([])

watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    bulkText.value = ''
    selectedGroupId.value = ''
    previewWords.value = []
  }
})

const parseBulkText = (text: string) => {
  const regex = /\[([^\]]+)\]\[([^\]]+)\](?:\[([^\]]*)\])?/g
  const matches = []
  let match
  
  while ((match = regex.exec(text)) !== null) {
    matches.push({
      italian: match[1],
      english: match[2],
      details: match[3] || undefined
    })
  }
  
  return matches
}

const updatePreview = () => {
  const text = bulkText.value.trim()
  if (!text) {
    previewWords.value = []
    return
  }
  previewWords.value = parseBulkText(text)
}

const removePreviewWord = (index: number) => {
  previewWords.value.splice(index, 1)
}

const clearPreview = () => {
  previewWords.value = []
  bulkText.value = ''
}

const handleImport = () => {
  if (previewWords.value.length === 0) {
    updatePreview()
    if (previewWords.value.length === 0) {
      alert('No valid words found. Please check the format.')
      return
    }
  }
  
  emit('import', {
    words: previewWords.value,
    groupId: props.showGroupSelect ? selectedGroupId.value : undefined
  })
  handleClose()
}

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
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
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--bg-primary);
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.bulk-import-modal {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.5rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.import-instructions {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 3px solid var(--primary-color);
}

.import-instructions p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.import-instructions .note {
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-style: italic;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

.form-group select {
  width: 100%;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
}

.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.bulk-textarea {
  width: 100%;
  min-height: 200px;
  padding: 1rem;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-family: monospace;
  font-size: 0.9rem;
  resize: vertical;
  margin-bottom: 1rem;
}

.bulk-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.preview-section {
  margin-top: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.preview-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.btn-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.btn-outline:hover {
  background: var(--border-color);
}

.preview-list {
  max-height: 250px;
  overflow-y: auto;
}

.preview-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  gap: 1rem;
}

.preview-item:last-child {
  border-bottom: none;
}

.word-content {
  flex: 1;
  min-width: 0;
}

.word-pair {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.italian {
  font-weight: 600;
  color: var(--primary-color);
}

.arrow {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.english {
  color: var(--text-primary);
}

.word-details {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-style: italic;
  margin-top: 0.25rem;
}

.delete-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
  flex-shrink: 0;
}

.delete-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.delete-btn:active {
  transform: scale(0.95);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
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

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--border-color);
}

@media (max-width: 768px) {
  .modal {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .preview-item {
    padding: 1rem;
    gap: 0.75rem;
  }
  
  .word-pair {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .arrow {
    display: none;
  }
  
  .delete-btn {
    width: 36px;
    height: 36px;
    font-size: 1rem;
    position: relative;
    top: -0.5rem;
  }
  
  .preview-header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }
  
  .preview-header h3 {
    text-align: center;
  }
  
  .bulk-textarea {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}
</style>
