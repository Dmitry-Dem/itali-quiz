export interface AppSettings {
  theme: 'light' | 'dark'
  language: string
  notifications: boolean
  autoBackup: boolean
  lastBackup: string | null
}

export interface WordGroup {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  createdAt: string
  wordCount?: number
}

export interface Word {
  id: string
  italian: string
  english: string
  groupId: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  createdAt: string
  lastReviewed: string | null
}

class DataService {
  private wordsCache: Word[] | null = null
  private settingsCache: AppSettings | null = null
  private groupsCache: WordGroup[] | null = null

  async loadWords(): Promise<Word[]> {
    if (this.wordsCache) {
      return this.wordsCache
    }

    try {
      const response = await fetch(import.meta.env.BASE_URL + 'data/words.json')
      if (!response.ok) {
        throw new Error('Failed to load words')
      }
      const words = await response.json()
      this.wordsCache = words
      return words
    } catch (error) {
      console.error('Error loading words:', error)
      const defaultWords: Word[] = [
        {
          id: '1',
          italian: 'Ciao',
          english: 'Hello',
          groupId: 'default-group',
          difficulty: 'beginner',
          createdAt: new Date().toISOString(),
          lastReviewed: null
        }
      ]
      this.wordsCache = defaultWords
      return defaultWords
    }
  }

  async loadSettings(): Promise<AppSettings> {
    if (this.settingsCache) {
      return this.settingsCache
    }

    try {
      const response = await fetch(import.meta.env.BASE_URL + 'data/settings.json')
      if (!response.ok) {
        throw new Error('Failed to load settings')
      }
      const settings = await response.json()
      this.settingsCache = settings
      return settings
    } catch (error) {
      console.error('Error loading settings:', error)
      const defaultSettings: AppSettings = {
        theme: 'dark',
        language: 'en',
        notifications: true,
        autoBackup: true,
        lastBackup: null
      }
      this.settingsCache = defaultSettings
      return defaultSettings
    }
  }

  saveWords(words: Word[]): void {
    this.wordsCache = words
    localStorage.setItem('italian-vocab-words', JSON.stringify(words))
  }

  saveSettings(settings: AppSettings): void {
    this.settingsCache = settings
    localStorage.setItem('italian-vocab-settings', JSON.stringify(settings))
  }

  async loadWordsWithFallback(): Promise<Word[]> {
    const localWords = localStorage.getItem('italian-vocab-words')
    if (localWords) {
      try {
        const words = JSON.parse(localWords)
        this.wordsCache = words
        return words
      } catch (error) {
        console.error('Error parsing local words:', error)
      }
    }

    return this.loadWords()
  }

  async loadSettingsWithFallback(): Promise<AppSettings> {
    const localSettings = localStorage.getItem('italian-vocab-settings')
    if (localSettings) {
      try {
        const settings = JSON.parse(localSettings)
        this.settingsCache = settings
        return settings
      } catch (error) {
        console.error('Error parsing local settings:', error)
      }
    }

    return this.loadSettings()
  }

  exportData(): { words: Word[], settings: AppSettings } {
    return {
      words: this.wordsCache || [],
      settings: this.settingsCache || {
        theme: 'dark',
        language: 'en',
        notifications: true,
        autoBackup: true,
        lastBackup: null
      }
    }
  }

  importData(data: { words?: Word[], settings?: AppSettings }): void {
    if (data.words) {
      this.saveWords(data.words)
    }
    if (data.settings) {
      this.saveSettings(data.settings)
    }
  }

  async loadWordGroups(): Promise<WordGroup[]> {
    if (this.groupsCache) {
      return this.groupsCache
    }

    try {
      const response = await fetch(import.meta.env.BASE_URL + 'data/groups.json')
      if (!response.ok) {
        throw new Error('Failed to load word groups')
      }
      const groups = await response.json()
      this.groupsCache = groups
      return groups
    } catch (error) {
      console.error('Error loading word groups:', error)
      const defaultGroups: WordGroup[] = [
        {
          id: 'default-group',
          name: 'General',
          description: 'General vocabulary words',
          color: '#3b82f6',
          icon: '📚',
          createdAt: new Date().toISOString()
        }
      ]
      this.groupsCache = defaultGroups
      return defaultGroups
    }
  }

  async loadWordGroupsWithFallback(): Promise<WordGroup[]> {
    const localGroups = localStorage.getItem('italian-vocab-groups')
    if (localGroups) {
      try {
        const groups = JSON.parse(localGroups)
        this.groupsCache = groups
        return groups
      } catch (error) {
        console.error('Error parsing local groups:', error)
      }
    }
    return this.loadWordGroups()
  }

  saveWordGroups(groups: WordGroup[]): void {
    this.groupsCache = groups
    localStorage.setItem('italian-vocab-groups', JSON.stringify(groups))
  }

  clearCache(): void {
    this.wordsCache = null
    this.settingsCache = null
    this.groupsCache = null
  }
}

export const dataService = new DataService()