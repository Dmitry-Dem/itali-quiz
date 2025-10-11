import { ref, computed, onMounted } from 'vue'
import { dataService, type Word, type AppSettings, type WordGroup } from '../services/dataService'

export { type Word, type AppSettings, type WordGroup } from '../services/dataService'

// Create singleton store instance
const words = ref<Word[]>([])
const wordGroups = ref<WordGroup[]>([])
const settings = ref<AppSettings>({
  theme: 'dark',
  language: 'en',
  notifications: true,
  autoBackup: true,
  lastBackup: null
})

const isLoading = ref(true)
const error = ref<string | null>(null)

const theme = computed(() => settings.value.theme)

export const useAppStore = () => {
  
  const loadData = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const [loadedWords, loadedSettings, loadedGroups] = await Promise.all([
        dataService.loadWordsWithFallback(),
        dataService.loadSettingsWithFallback(),
        dataService.loadWordGroupsWithFallback()
      ])
      
      words.value = loadedWords
      settings.value = loadedSettings
      wordGroups.value = loadedGroups
    } catch (err) {
      error.value = 'Failed to load data'
      console.error('Error loading data:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  const setTheme = (newTheme: 'light' | 'dark' | 'ocean' | 'forest' | 'sunset' | 'purple' | 'rose' | 'midnight' | 'cream') => {
    settings.value.theme = newTheme
    dataService.saveSettings(settings.value)
  }
  
  const addWord = (italian: string, english: string, groupId?: string, difficulty?: 'beginner' | 'intermediate' | 'advanced', details?: string, example?: string) => {
    const newWord: Word = {
      id: Date.now().toString(),
      italian: italian.trim(),
      english: english.trim(),
      groupId: groupId || 'default-group',
      difficulty: difficulty || 'beginner',
      details: details?.trim() || undefined,
      example: example?.trim() || undefined,
      wrongAttempts: 0,
      correctAttempts: 0,
      createdAt: new Date().toISOString(),
      lastReviewed: null
    }
    words.value.push(newWord)
    dataService.saveWords(words.value)
  }
  
  const removeWord = (id: string) => {
    const index = words.value.findIndex(word => word.id === id)
    if (index > -1) {
      words.value.splice(index, 1)
      dataService.saveWords(words.value)
    }
  }
  
  const updateWord = (id: string, italian: string, english: string, groupId?: string, difficulty?: 'beginner' | 'intermediate' | 'advanced', details?: string, example?: string) => {
    const word = words.value.find(w => w.id === id)
    if (word) {
      word.italian = italian.trim()
      word.english = english.trim()
      if (groupId) word.groupId = groupId
      if (difficulty) word.difficulty = difficulty
      word.details = details?.trim() || undefined
      word.example = example?.trim() || undefined
      dataService.saveWords(words.value)
    }
  }

  const updateWordStats = (id: string, isCorrect: boolean) => {
    const word = words.value.find(w => w.id === id)
    if (word) {
      if (isCorrect) {
        word.correctAttempts++
        if (word.wrongAttempts > 0) {
          word.wrongAttempts--
        }
      } else {
        word.wrongAttempts++
      }
      word.lastReviewed = new Date().toISOString()
      dataService.saveWords(words.value)
    }
  }

  const toggleWordLearned = (id: string) => {
    const word = words.value.find(w => w.id === id)
    if (word) {
      word.learned = !word.learned
      dataService.saveWords(words.value)
    }
  }

  const markWordAsLearned = (id: string) => {
    const word = words.value.find(w => w.id === id)
    if (word) {
      word.learned = true
      dataService.saveWords(words.value)
    }
  }

  const markWordAsNotLearned = (id: string) => {
    const word = words.value.find(w => w.id === id)
    if (word) {
      word.learned = false
      dataService.saveWords(words.value)
    }
  }
  
  const searchWords = (query: string) => {
    if (!query.trim()) return words.value
    
    const lowercaseQuery = query.toLowerCase()
    return words.value.filter(word => {
      const group = wordGroups.value.find(g => g.id === word.groupId)
      const groupName = group?.name.toLowerCase() || ''
      
      return word.italian.toLowerCase().includes(lowercaseQuery) ||
             word.english.toLowerCase().includes(lowercaseQuery) ||
             groupName.includes(lowercaseQuery)
    })
  }

  const getWordsByGroup = (groupId: string, includeLearned: boolean = true) => {
    return words.value.filter(word => 
      word.groupId === groupId && (includeLearned || !word.learned)
    )
  }

  const getWordsForStudy = (limit: number = 20, includeLearned: boolean = false) => {
    return [...words.value]
      .filter(word => includeLearned || !word.learned)
      .sort((a, b) => {
        if (a.wrongAttempts !== b.wrongAttempts) {
          return b.wrongAttempts - a.wrongAttempts
        }
        if (!a.lastReviewed && !b.lastReviewed) return 0
        if (!a.lastReviewed) return -1
        if (!b.lastReviewed) return 1
        return new Date(a.lastReviewed).getTime() - new Date(b.lastReviewed).getTime()
      })
      .slice(0, limit)
  }

  const getWordGroups = () => {
    return wordGroups.value
  }

  const addWordGroup = async (groupData: { name: string; description?: string; icon: string; color: string }) => {
    const newGroup: WordGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: groupData.name,
      description: groupData.description,
      icon: groupData.icon,
      color: groupData.color,
      createdAt: new Date().toISOString()
    }

    wordGroups.value.push(newGroup)
    dataService.saveWordGroups(wordGroups.value)
  }

  const updateWordGroup = async (groupId: string, updates: Partial<Pick<WordGroup, 'name' | 'description' | 'icon' | 'color'>>) => {
    const groupIndex = wordGroups.value.findIndex(group => group.id === groupId)
    if (groupIndex !== -1) {
      wordGroups.value[groupIndex] = { ...wordGroups.value[groupIndex], ...updates }
      dataService.saveWordGroups(wordGroups.value)
    }
  }

  const deleteWordGroup = async (groupId: string) => {
    const defaultGroupId = 'default-group'
    
    // Move all words from this group to the default group
    words.value.forEach(word => {
      if (word.groupId === groupId) {
        word.groupId = defaultGroupId
      }
    })
    
    // Remove the group
    wordGroups.value = wordGroups.value.filter(group => group.id !== groupId)
    
    // Save both words and groups
    dataService.saveWords(words.value)
    dataService.saveWordGroups(wordGroups.value)
  }

  const exportData = () => {
    // Ensure dataService has the most current data
    dataService.saveWords(words.value)
    dataService.saveSettings(settings.value)
    dataService.saveWordGroups(wordGroups.value)
    
    const data = dataService.exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `italian-vocab-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importData = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          dataService.importData(data)
          loadData()
          resolve()
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }
  
  onMounted(() => {
    loadData()
  })
  
  return {
    words: computed(() => words.value),
    wordGroups: computed(() => wordGroups.value),
    settings: computed(() => settings.value),
    theme,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    loadData,
    setTheme,
    addWord,
    removeWord,
    updateWord,
    updateWordStats,
    toggleWordLearned,
    markWordAsLearned,
    markWordAsNotLearned,
    searchWords,
    getWordsByGroup,
    getWordsForStudy,
    getWordGroups,
    addWordGroup,
    updateWordGroup,
    deleteWordGroup,
    exportData,
    importData
  }
}