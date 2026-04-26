<template>
  <div class="stories-page">
    <div class="container">
      <div class="page-header animate-slide-down">
        <div class="header-content">
          <h1 class="page-title">My Stories</h1>
          <p class="page-subtitle">{{ stories.length }} stor{{ stories.length !== 1 ? 'ies' : 'y' }}</p>
        </div>
        
        <div class="header-actions">
          <router-link to="/text-import" class="btn btn-primary">
            <span>📖</span>
            Import Text
          </router-link>
        </div>
      </div>

      <div class="stories-section animate-fade-in">
        <div v-if="stories.length === 0" class="empty-state">
          <div class="empty-icon">📚</div>
          <h3>No stories yet</h3>
          <p>Import your first text to start building your story collection and track your vocabulary progress.</p>
          <router-link to="/text-import" class="btn btn-primary mt-4">
            Import Text
          </router-link>
        </div>

        <div v-else class="stories-grid">
          <div 
            v-for="story in stories" 
            :key="story.id" 
            class="story-card"
            @click="viewStory(story)"
          >
            <div class="story-header">
              <h3 class="story-title">{{ story.title }}</h3>
              <div class="story-stats">
                {{ getWordCount(story.content) }} words
              </div>
            </div>
            
            <div class="story-preview">{{ getPreview(story.content) }}</div>
            
            <div class="story-footer">
              <span class="story-date">{{ formatDate(story.createdAt) }}</span>
              <div class="story-actions" @click.stop>
                <button @click="editStory(story)" class="action-btn edit-btn" title="Edit">
                  <span>✏️</span>
                </button>
                <button @click="deleteStory(story.id)" class="action-btn delete-btn" title="Delete">
                  <span>🗑️</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Delete Story</h3>
          <button @click="closeDeleteModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete "<strong>{{ storyToDelete?.title }}</strong>"?</p>
          <p class="text-muted">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button @click="closeDeleteModal" class="btn btn-secondary">Cancel</button>
          <button @click="confirmDelete" class="btn btn-danger">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

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

interface Word {
  italian: string
  english: string
  pronunciation?: string
  group?: string
}

const router = useRouter()

const stories = ref<Story[]>([])
const showDeleteModal = ref(false)
const storyToDelete = ref<Story | null>(null)

const getStoriesFromStorage = (): Story[] => {
  const stored = localStorage.getItem('stories')
  return stored ? JSON.parse(stored) : []
}

const saveStoriesToStorage = (updatedStories: Story[]) => {
  localStorage.setItem('stories', JSON.stringify(updatedStories))
}

const loadStories = () => {
  stories.value = getStoriesFromStorage()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getPreview = (content: string) => {
  const maxLength = 120
  return content.length > maxLength ? content.slice(0, maxLength) + '...' : content
}

const getWordCount = (content: string) => {
  return content.split(/\s+/).filter(word => word.length > 0).length
}

const viewStory = (story: Story) => {
  router.push(`/stories/${story.id}`)
}

const editStory = (story: Story) => {
  router.push({
    path: '/text-import',
    query: { story: story.id }
  })
}

const deleteStory = (storyId: string) => {
  const story = stories.value.find(s => s.id === storyId)
  if (story) {
    storyToDelete.value = story
    showDeleteModal.value = true
  }
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  storyToDelete.value = null
}

const confirmDelete = () => {
  if (storyToDelete.value) {
    const updatedStories = stories.value.filter(story => story.id !== storyToDelete.value!.id)
    stories.value = updatedStories
    saveStoriesToStorage(updatedStories)
    closeDeleteModal()
  }
}

onMounted(() => {
  loadStories()
})
</script>

<style scoped>
.stories-page {
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
  align-items: flex-end;
  margin-bottom: 2rem;
  color: white;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.page-subtitle {
  font-size: 1rem;
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
}

.header-actions .btn {
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

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
  }
  to {
    opacity: 1;
  }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.empty-state p {
  color: var(--text-muted);
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto 2rem auto;
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.story-card {
  background: var(--bg-card);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.story-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
  border-color: var(--border-color-focus);
}

.story-header {
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.story-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.story-stats {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-block;
}

.story-preview {
  padding: 1rem 1.5rem;
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 0.95rem;
}

.story-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

.story-date {
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 500;
}

.story-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.edit-btn:hover {
  background: rgba(0, 123, 255, 0.1);
}

.delete-btn:hover {
  background: rgba(220, 53, 69, 0.1);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 123, 255, 0.3);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
  transform: translateY(-2px);
}

.mt-4 {
  margin-top: 1.5rem;
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
  z-index: 1070;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 15px;
  max-width: 500px;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0.25rem;
  line-height: 1;
  border-radius: 4px;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #495057;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
}

.text-muted {
  color: #6c757d;
  font-size: 0.9rem;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .stories-page {
    padding: 0.5rem 0;
  }
  
  .container {
    padding: 0 0.5rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    text-align: center;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .stories-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .story-card {
    margin: 0;
  }
  
  .empty-state {
    padding: 3rem 1rem;
  }
  
  .empty-icon {
    font-size: 3rem;
  }
  
  .modal-content {
    margin: 1rem;
    max-width: calc(100vw - 2rem);
  }
}

@media (max-width: 480px) {
  .story-footer {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
  
  .story-actions {
    align-self: flex-end;
  }
}
</style>