<template>
  <div class="duplicates-page">
    <div class="container">
      <div class="page-header animate-slide-down">
        <div class="header-content">
          <h1 class="page-title">Duplicate Words</h1>
          <p class="page-subtitle">
            {{ duplicateGroups.length }} duplicate group{{ duplicateGroups.length !== 1 ? 's' : '' }} found
            ({{ totalDuplicates }} words)
          </p>
        </div>
        
        <div class="header-actions" v-if="duplicateGroups.length > 0">
          <button @click="selectAll" class="btn btn-secondary">
            {{ allSelected ? 'Deselect All' : 'Select All' }}
          </button>
          <button 
            @click="deleteSelected" 
            class="btn btn-danger"
            :disabled="selectedWords.size === 0"
          >
            Delete Selected ({{ selectedWords.size }})
          </button>
        </div>
      </div>

      <div class="duplicates-section animate-fade-in">
        <div v-if="duplicateGroups.length === 0" class="no-duplicates">
          <div class="no-duplicates-icon">✨</div>
          <h3>No duplicates found!</h3>
          <p>Your vocabulary is clean and organized.</p>
          <router-link to="/words" class="btn btn-primary mt-4">
            Back to Word List
          </router-link>
        </div>

        <div v-else class="duplicates-grid">
          <div 
            v-for="(group, groupIndex) in duplicateGroups" 
            :key="groupIndex"
            class="duplicate-group"
          >
            <div class="group-header">
              <h3 class="group-title">
                "{{ group.normalized }}" 
                <span class="group-count">({{ group.words.length }} instances)</span>
              </h3>
              <div class="group-actions">
                <button 
                  @click="selectGroup(group)"
                  class="btn btn-sm btn-secondary"
                >
                  {{ isGroupSelected(group) ? 'Deselect Group' : 'Select Group' }}
                </button>
                <button 
                  @click="keepBest(group)"
                  class="btn btn-sm btn-primary"
                  title="Keep the word with the best stats and delete others"
                >
                  Keep Best
                </button>
              </div>
            </div>

            <div class="duplicate-cards">
              <div 
                v-for="word in group.words" 
                :key="word.id"
                class="duplicate-card"
                :class="{ 
                  'selected': selectedWords.has(word.id),
                  'best-candidate': isBestCandidate(group, word)
                }"
              >
                <div class="card-header">
                  <div class="selection-checkbox">
                    <input 
                      type="checkbox"
                      :checked="selectedWords.has(word.id)"
                      @change="toggleSelection(word.id)"
                    >
                  </div>
                  <div class="word-info">
                    <div class="italian-text">{{ word.italian }}</div>
                    <div class="english-text">{{ word.english }}</div>
                  </div>
                  <button 
                    @click="deleteWord(word.id)"
                    class="btn btn-sm btn-danger delete-btn"
                    title="Delete this word"
                  >
                    🗑️
                  </button>
                </div>

                <div class="word-stats">
                  <div class="stat-item">
                    <span class="stat-label">Group:</span>
                    <span class="stat-value">{{ getGroupName(word.groupId) }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">R:</span>
                    <span class="stat-value">{{ word.correctAttempts || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">W:</span>
                    <span class="stat-value">{{ word.wrongAttempts || 0 }}</span>
                  </div>
                </div>

                <div class="duplicate-info">
                  <div class="difference-tags">
                    <span 
                      v-for="diff in getDifferences(group.normalized, word.italian)"
                      :key="diff"
                      class="diff-tag"
                    >
                      {{ diff }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore, type Word } from '../composables/useAppStore'

const { words, wordGroups, removeWord } = useAppStore()

const selectedWords = ref(new Set<string>())
const duplicateGroups = ref<Array<{
  normalized: string
  words: Array<Word>
}>>([])

const normalizeWord = (word: string): string => {
  return word
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"()[\]{}]/g, '') 
    .replace(/\s+/g, ' ') 
}

const findDuplicates = () => {
  const wordMap = new Map<string, Array<Word>>()
  
  words.value.forEach(word => {
    const normalized = normalizeWord(word.italian)
    if (!wordMap.has(normalized)) {
      wordMap.set(normalized, [])
    }
    wordMap.get(normalized)!.push(word)
  })
  
  duplicateGroups.value = Array.from(wordMap.entries())
    .filter(([_, wordList]) => wordList.length > 1)
    .map(([normalized, wordList]) => ({
      normalized,
      words: wordList.sort((a, b) => {
        const aTotal = (a.correctAttempts || 0) + (a.wrongAttempts || 0)
        const bTotal = (b.correctAttempts || 0) + (b.wrongAttempts || 0)
        if (aTotal !== bTotal) return bTotal - aTotal
        return a.italian.localeCompare(b.italian)
      })
    }))
    .sort((a, b) => a.normalized.localeCompare(b.normalized))
}

const getGroupName = (groupId: string): string => {
  const group = wordGroups.value.find(g => g.id === groupId)
  return group ? group.name : 'Unknown Group'
}

const getDifferences = (normalized: string, actual: string): string[] => {
  const diffs: string[] = []
  
  if (normalized !== actual.toLowerCase()) {
    diffs.push('case')
  }
  
  if (normalized !== normalizeWord(actual)) {
    diffs.push('punctuation')
  }
  
  if (actual.trim() !== actual) {
    diffs.push('spacing')
  }
  
  return diffs
}

const isBestCandidate = (group: { words: Word[] }, word: Word): boolean => {
  return group.words[0].id === word.id
}

const totalDuplicates = computed(() => {
  return duplicateGroups.value.reduce((total, group) => total + group.words.length, 0)
})

const allSelected = computed(() => {
  const totalWords = totalDuplicates.value
  return totalWords > 0 && selectedWords.value.size === totalWords
})

const toggleSelection = (wordId: string) => {
  if (selectedWords.value.has(wordId)) {
    selectedWords.value.delete(wordId)
  } else {
    selectedWords.value.add(wordId)
  }
}

const selectAll = () => {
  if (allSelected.value) {
    selectedWords.value.clear()
  } else {
    duplicateGroups.value.forEach(group => {
      group.words.forEach(word => {
        selectedWords.value.add(word.id)
      })
    })
  }
}

const selectGroup = (group: { words: Word[] }) => {
  const isSelected = isGroupSelected(group)
  group.words.forEach(word => {
    if (isSelected) {
      selectedWords.value.delete(word.id)
    } else {
      selectedWords.value.add(word.id)
    }
  })
}

const isGroupSelected = (group: { words: Word[] }): boolean => {
  return group.words.every(word => selectedWords.value.has(word.id))
}

const deleteWord = async (wordId: string) => {
  if (confirm('Are you sure you want to delete this word?')) {
    await removeWord(wordId)
    selectedWords.value.delete(wordId)
    findDuplicates() 
  }
}

const deleteSelected = async () => {
  if (selectedWords.value.size === 0) return
  
  const count = selectedWords.value.size
  if (confirm(`Are you sure you want to delete ${count} selected word${count !== 1 ? 's' : ''}?`)) {
    const promises = Array.from(selectedWords.value).map(id => removeWord(id))
    await Promise.all(promises)
    selectedWords.value.clear()
    findDuplicates()
  }
}

const keepBest = async (group: { words: Word[] }) => {
  const wordsToDelete = group.words.slice(1)
  const count = wordsToDelete.length
  
  if (confirm(`Keep "${group.words[0].italian}" and delete ${count} other${count !== 1 ? 's' : ''}?`)) {
    const promises = wordsToDelete.map(word => removeWord(word.id))
    await Promise.all(promises)
    
    wordsToDelete.forEach(word => selectedWords.value.delete(word.id))
    
    findDuplicates() 
  }
}

onMounted(() => {
  findDuplicates()
})
</script>

<style scoped>
.duplicates-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 2rem 0;
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

.no-duplicates {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-primary);
}

.no-duplicates-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.duplicates-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.duplicate-group {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-primary);
  overflow: hidden;
}

.group-header {
  padding: 1.5rem;
  background: var(--bg-accent);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

[data-theme="dark"] .group-header {
  background: var(--bg-tertiary);
}

[data-theme="midnight"] .group-header {
  background: var(--bg-tertiary);
}

[data-theme="dark"] .group-title {
  color: var(--text-primary);
}

[data-theme="midnight"] .group-title {
  color: var(--text-primary);
}

[data-theme="dark"] .group-count {
  color: var(--text-secondary);
  opacity: 1;
}

[data-theme="midnight"] .group-count {
  color: var(--text-secondary);
  opacity: 1;
}

.group-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-accent);
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.group-count {
  font-size: 0.9rem;
  font-weight: normal;
  color: var(--text-accent);
  opacity: 0.9;
}

.group-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.duplicate-cards {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.duplicate-card {
  background: var(--bg-primary);
  border: 2px solid var(--border-primary);
  border-radius: var(--border-radius);
  padding: 1rem;
  transition: all 0.2s ease;
}

.duplicate-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
}

.duplicate-card.selected {
  border-color: var(--primary);
  background: var(--primary-alpha-10);
}

.duplicate-card.best-candidate {
  border-color: var(--success);
  background: var(--success-alpha-10);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.selection-checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.word-info {
  flex: 1;
}

.italian-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.english-text {
  font-size: 1rem;
  color: var(--text-secondary);
}

.delete-btn {
  min-width: auto;
  padding: 0.5rem;
  font-size: 1rem;
}

.word-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  gap: 0.25rem;
  font-size: 0.9rem;
}

.stat-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.stat-value {
  color: var(--text-primary);
  font-weight: 600;
}

.duplicate-info {
  margin-top: 0.5rem;
}

.difference-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.diff-tag {
  background: var(--warning-alpha-20);
  color: var(--warning);
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.8rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .header-actions {
    justify-content: stretch;
  }
  
  .header-actions .btn {
    flex: 1;
  }
  
  .group-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .group-actions {
    justify-content: stretch;
  }
  
  .group-actions .btn {
    flex: 1;
  }
  
  .card-header {
    flex-wrap: wrap;
  }
  
  .word-stats {
    gap: 1rem;
  }
}

.animate-slide-down {
  animation: slideDown 0.5s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
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