// Data service for handling JSON file operations
export interface AppSettings {
  theme: 'light' | 'dark'
  language: string
  notifications: boolean
  autoBackup: boolean
  lastBackup: string | null
}

export interface Word {
  id: string
  italian: string
  english: string
  category?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  createdAt: string
  lastReviewed: string | null
}

class DataService {
  private wordsCache: Word[] | null = null
  private settingsCache: AppSettings | null = null

  // Load words from JSON file
  async loadWords(): Promise<Word[]> {
    if (this.wordsCache) {
      return this.wordsCache
    }

    try {
      const response = await fetch('/data/words.json')
      if (!response.ok) {
        throw new Error('Failed to load words')
      }
      const words = await response.json()
      this.wordsCache = words
      return words
    } catch (error) {
      console.error('Error loading words:', error)
      // Fallback to default words
      const defaultWords: Word[] = [
        {
          id: '1',
          italian: 'Ciao',
          english: 'Hello',
          category: 'greetings',
          difficulty: 'beginner',
          createdAt: new Date().toISOString(),
          lastReviewed: null
        }
      ]
      this.wordsCache = defaultWords
      return defaultWords
    }
  }

  // Load settings from JSON file
  async loadSettings(): Promise<AppSettings> {
    if (this.settingsCache) {
      return this.settingsCache
    }

    try {
      const response = await fetch('/data/settings.json')
      if (!response.ok) {
        throw new Error('Failed to load settings')
      }
      const settings = await response.json()
      this.settingsCache = settings
      return settings
    } catch (error) {
      console.error('Error loading settings:', error)
      // Fallback to default settings
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

  // Save words to localStorage (since we can't write to JSON files in browser)
  saveWords(words: Word[]): void {
    this.wordsCache = words
    localStorage.setItem('italian-vocab-words', JSON.stringify(words))
  }

  // Save settings to localStorage
  saveSettings(settings: AppSettings): void {
    this.settingsCache = settings
    localStorage.setItem('italian-vocab-settings', JSON.stringify(settings))
  }

  // Load from localStorage if available, otherwise from JSON
  async loadWordsWithFallback(): Promise<Word[]> {
    // First try localStorage
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

    // Fallback to JSON file
    return this.loadWords()
  }

  // Load from localStorage if available, otherwise from JSON
  async loadSettingsWithFallback(): Promise<AppSettings> {
    // First try localStorage
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

    // Fallback to JSON file
    return this.loadSettings()
  }

  // Export data as JSON for download
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

  // Import data from uploaded JSON
  importData(data: { words?: Word[], settings?: AppSettings }): void {
    if (data.words) {
      this.saveWords(data.words)
    }
    if (data.settings) {
      this.saveSettings(data.settings)
    }
  }

  // Clear cache (useful for testing)
  clearCache(): void {
    this.wordsCache = null
    this.settingsCache = null
  }
}

export const dataService = new DataService()