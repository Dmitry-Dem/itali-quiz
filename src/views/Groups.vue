<template>
  <div class="groups-container">
    <div class="header">
      <h2>Word Categories</h2>
      <button @click="showAddGroupModal = true" class="btn btn-primary">
        <span class="icon">➕</span>
        Add Category
      </button>
    </div>

    <div v-if="isLoading" class="loading">
      Loading categories...
    </div>

    <div v-else class="groups-grid">
      <div 
        v-for="group in wordGroups" 
        :key="group.id"
        class="group-card"
        :style="{ borderColor: group.color }"
        @click="goToGroupWords(group.id)"
      >
        <div class="group-header">
          <div class="group-icon" :style="{ backgroundColor: group.color + '20' }">
            {{ group.icon }}
          </div>
          <div class="group-actions">
            <button @click.stop="editGroup(group)" class="btn-icon" title="Edit Category">
              ✏️
            </button>
            <button @click.stop="deleteGroup(group.id)" class="btn-icon" title="Delete Category">
              🗑️
            </button>
          </div>
        </div>

        <div class="group-content">
          <h3 class="group-name">{{ group.name }}</h3>
          <p class="group-description">{{ group.description }}</p>
          <div class="group-stats">
            <span class="word-count">{{ getGroupWordCount(group.id) }} words</span>
            <span class="created-date">Created {{ formatDate(group.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!isLoading && wordGroups.length === 0" class="empty-state">
      <div class="empty-icon">📚</div>
      <h3>No categories yet</h3>
      <p>Create your first word category to get started!</p>
      <button @click="showAddGroupModal = true" class="btn btn-primary">
        Add Your First Category
      </button>
    </div>

    <!-- Add/Edit Group Modal -->
    <div v-if="showAddGroupModal || editingGroup" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingGroup ? 'Edit Category' : 'Add New Category' }}</h3>
          <button @click="closeModal" class="btn-close">✕</button>
        </div>

        <form @submit.prevent="saveGroup" class="modal-form">
          <div class="form-group">
            <label for="groupName">Category Name</label>
            <input 
              id="groupName"
              v-model="groupForm.name" 
              type="text" 
              required 
              placeholder="e.g., Food & Dining"
            >
          </div>

          <div class="form-group">
            <label for="groupDescription">Description</label>
            <textarea 
              id="groupDescription"
              v-model="groupForm.description" 
              placeholder="Brief description of this category"
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
                placeholder="Choose an emoji"
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
            <button type="button" @click="closeModal" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              {{ editingGroup ? 'Update' : 'Create' }} Category
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore, type WordGroup } from '../composables/useAppStore'

const router = useRouter()
const { words, wordGroups, isLoading, loadData, addWordGroup, updateWordGroup, deleteWordGroup } = useAppStore()

const showAddGroupModal = ref(false)
const editingGroup = ref<WordGroup | null>(null)

const groupForm = ref({
  name: '',
  description: '',
  icon: '📚',
  color: '#3b82f6'
})

const suggestedIcons = ['📚', '🍝', '✈️', '👨‍👩‍👧‍👦', '👋', '🏠', '🚗', '💼', '🎵', '🏃‍♂️', '🌟', '❤️']
const suggestedColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

onMounted(() => {
  loadData()
})

const getGroupWordCount = (groupId: string) => {
  return words.value.filter(word => word.groupId === groupId).length
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const goToGroupWords = (groupId: string) => {
  router.push(`/words/${groupId}`)
}

const editGroup = (group: WordGroup) => {
  editingGroup.value = group
  groupForm.value = {
    name: group.name,
    description: group.description || '',
    icon: group.icon,
    color: group.color
  }
}

const deleteGroup = async (groupId: string) => {
  const group = wordGroups.value.find(g => g.id === groupId)
  const wordCount = getGroupWordCount(groupId)
  
  if (wordCount > 0) {
    const confirmed = confirm(`This category "${group?.name}" contains ${wordCount} words. Are you sure you want to delete it? All words in this category will be moved to "General".`)
    if (!confirmed) return
  } else {
    const confirmed = confirm(`Are you sure you want to delete the category "${group?.name}"?`)
    if (!confirmed) return
  }

  try {
    await deleteWordGroup(groupId)
  } catch (error) {
    alert('Failed to delete category. Please try again.')
  }
}

const saveGroup = async () => {
  try {
    if (editingGroup.value) {
      await updateWordGroup(editingGroup.value.id, {
        name: groupForm.value.name,
        description: groupForm.value.description,
        icon: groupForm.value.icon,
        color: groupForm.value.color
      })
    } else {
      await addWordGroup({
        name: groupForm.value.name,
        description: groupForm.value.description,
        icon: groupForm.value.icon,
        color: groupForm.value.color
      })
    }
    closeModal()
  } catch (error) {
    alert('Failed to save category. Please try again.')
  }
}

const closeModal = () => {
  showAddGroupModal.value = false
  editingGroup.value = null
  groupForm.value = {
    name: '',
    description: '',
    icon: '📚',
    color: '#3b82f6'
  }
}
</script>

<style scoped>
.groups-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 2rem;
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
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.group-card {
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
}

.group-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.group-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.group-actions {
  display: flex;
  gap: 0.5rem;
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

.group-content h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 1.25rem;
}

.group-description {
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.group-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.word-count {
  font-weight: 600;
  color: var(--primary-color);
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
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
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
  .groups-container {
    padding: 1rem;
  }
  
  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .groups-grid {
    grid-template-columns: 1fr;
  }
  
  .modal {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>