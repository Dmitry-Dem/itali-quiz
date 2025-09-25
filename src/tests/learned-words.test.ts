import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAppStore } from '../composables/useAppStore'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('useAppStore - Learned Words Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('should toggle word learned status', () => {
    const { words, toggleWordLearned, addWord } = useAppStore()
    
    // Add a test word
    addWord('Ciao', 'Hello', 'test-group')
    
    const wordId = words.value[0]?.id
    expect(wordId).toBeDefined()
    
    // Initially not learned
    expect(words.value[0]?.learned).toBeFalsy()
    
    // Toggle to learned
    toggleWordLearned(wordId!)
    expect(words.value[0]?.learned).toBe(true)
    
    // Toggle back to not learned
    toggleWordLearned(wordId!)
    expect(words.value[0]?.learned).toBe(false)
  })

  it('should mark word as learned', () => {
    const { words, markWordAsLearned, addWord } = useAppStore()
    
    // Add a test word
    addWord('Grazie', 'Thank you', 'test-group')
    
    const wordId = words.value[0]?.id
    expect(wordId).toBeDefined()
    
    // Mark as learned
    markWordAsLearned(wordId!)
    expect(words.value[0]?.learned).toBe(true)
  })

  it('should mark word as not learned', () => {
    const { words, markWordAsNotLearned, addWord, toggleWordLearned } = useAppStore()
    
    // Add a test word and mark as learned
    addWord('Bene', 'Good', 'test-group')
    const wordId = words.value[0]?.id
    toggleWordLearned(wordId!) // Mark as learned first
    
    expect(words.value[0]?.learned).toBe(true)
    
    // Mark as not learned
    markWordAsNotLearned(wordId!)
    expect(words.value[0]?.learned).toBe(false)
  })

  it('should filter words for study excluding learned words by default', () => {
    const store = useAppStore()
    const { addWord, getWordsForStudy, toggleWordLearned, words } = store
    
    // Clear any existing words first
    words.value.length = 0
    
    // Add test words
    addWord('Word1', 'Translation1', 'test-group')
    addWord('Word2', 'Translation2', 'test-group')
    addWord('Word3', 'Translation3', 'test-group')
    
    // Verify we have 3 words
    expect(words.value.length).toBe(3)
    
    // Mark one word as learned
    const wordId = words.value[0]?.id
    toggleWordLearned(wordId!)
    
    // Verify the word is marked as learned
    expect(words.value[0]?.learned).toBe(true)
    
    const studyWords = getWordsForStudy(10, false)
    expect(studyWords.length).toBe(2)
    
    const allStudyWords = getWordsForStudy(10, true)
    expect(allStudyWords.length).toBe(3)
  })

  it('should filter words by group with learned status option', () => {
    const { addWord, getWordsByGroup, toggleWordLearned } = useAppStore()
    
    // Add test words to different groups
    addWord('Word1', 'Translation1', 'group1')
    addWord('Word2', 'Translation2', 'group1')
    addWord('Word3', 'Translation3', 'group2')
    
    // Mark one word in group1 as learned
    const group1Words = getWordsByGroup('group1')
    toggleWordLearned(group1Words[0]?.id!)
    
    // Get all words from group1 (including learned)
    const allGroup1Words = getWordsByGroup('group1', true)
    expect(allGroup1Words.length).toBe(2)
    
    // Get only unlearned words from group1
    const unlearnedGroup1Words = getWordsByGroup('group1', false)
    expect(unlearnedGroup1Words.length).toBe(1)
  })

  it('should handle undefined word IDs gracefully', () => {
    const { toggleWordLearned, markWordAsLearned, markWordAsNotLearned } = useAppStore()
    
    // These should not throw errors
    expect(() => toggleWordLearned('non-existent-id')).not.toThrow()
    expect(() => markWordAsLearned('non-existent-id')).not.toThrow()
    expect(() => markWordAsNotLearned('non-existent-id')).not.toThrow()
  })

  it('should maintain backward compatibility with words without learned field', () => {
    const { words, addWord, getWordsForStudy } = useAppStore()
    
    // Add a word (learned field will be undefined initially)
    addWord('Test', 'Test', 'test-group')
    
    const word = words.value[0]
    expect(word?.learned).toBeUndefined()
    
    // Should be included in study words (treated as not learned)
    const studyWords = getWordsForStudy(10, false)
    expect(studyWords.length).toBe(1)
    expect(studyWords[0]?.id).toBe(word?.id)
  })
})