import { ref, computed, onMounted } from 'vue'
import { dataService, type Word, type AppSettings, type WordGroup } from '../services/dataService'

export { type Word, type AppSettings, type WordGroup } from '../services/dataService'

export const useAppStore = () => {
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
  
  const setTheme = (newTheme: 'light' | 'dark') => {
    settings.value.theme = newTheme
    dataService.saveSettings(settings.value)
  }
  
  const addWord = (italian: string, english: string, groupId?: string, difficulty?: 'beginner' | 'intermediate' | 'advanced') => {
    const newWord: Word = {
      id: Date.now().toString(),
      italian: italian.trim(),
      english: english.trim(),
      groupId: groupId || 'default-group',
      difficulty: difficulty || 'beginner',
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
  
  const updateWord = (id: string, italian: string, english: string, groupId?: string, difficulty?: 'beginner' | 'intermediate' | 'advanced') => {
    const word = words.value.find(w => w.id === id)
    if (word) {
      word.italian = italian.trim()
      word.english = english.trim()
      if (groupId) word.groupId = groupId
      if (difficulty) word.difficulty = difficulty
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

  const getWordsByGroup = (groupId: string) => {
    return words.value.filter(word => word.groupId === groupId)
  }

  const getWordGroups = () => {
    return wordGroups.value
  }

  const exportData = () => {
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
    searchWords,
    getWordsByGroup,
    getWordGroups,
    exportData,
    importData
  }
}