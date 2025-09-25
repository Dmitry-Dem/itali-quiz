import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Word } from '../services/dataService'

// Mock fetch for testing
globalThis.fetch = vi.fn()

describe('Word Interface and Data Compatibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle words with learned field', () => {
    const wordWithLearned: Word = {
      id: '1',
      italian: 'Ciao',
      english: 'Hello',
      groupId: 'greetings',
      difficulty: 'beginner',
      wrongAttempts: 0,
      correctAttempts: 0,
      createdAt: '2025-09-25T10:00:00.000Z',
      lastReviewed: null,
      learned: true
    }

    expect(wordWithLearned.learned).toBe(true)
    expect(wordWithLearned.italian).toBe('Ciao')
  })

  it('should handle words without learned field (backward compatibility)', () => {
    const wordWithoutLearned: Word = {
      id: '2',
      italian: 'Grazie',
      english: 'Thank you',
      groupId: 'courtesy',
      difficulty: 'beginner',
      wrongAttempts: 0,
      correctAttempts: 0,
      createdAt: '2025-09-25T10:00:00.000Z',
      lastReviewed: null
      // learned field is optional and undefined
    }

    expect(wordWithoutLearned.learned).toBeUndefined()
    expect(wordWithoutLearned.italian).toBe('Grazie')
    
    const isLearned = wordWithoutLearned.learned || false
    expect(isLearned).toBe(false)
  })

  it('should handle mixed array of words with and without learned field', () => {
    const words: Word[] = [
      {
        id: '1',
        italian: 'Ciao',
        english: 'Hello',
        groupId: 'greetings',
        difficulty: 'beginner',
        wrongAttempts: 0,
        correctAttempts: 0,
        createdAt: '2025-09-25T10:00:00.000Z',
        lastReviewed: null,
        learned: true
      },
      {
        id: '2',
        italian: 'Grazie',
        english: 'Thank you',
        groupId: 'courtesy',
        difficulty: 'beginner',
        wrongAttempts: 0,
        correctAttempts: 0,
        createdAt: '2025-09-25T10:00:00.000Z',
        lastReviewed: null
        // no learned field
      }
    ]

    const learnedWords = words.filter(word => word.learned)
    expect(learnedWords.length).toBe(1)
    expect(learnedWords[0]?.italian).toBe('Ciao')

    const unlearnedWords = words.filter(word => !word.learned)
    expect(unlearnedWords.length).toBe(1)
    expect(unlearnedWords[0]?.italian).toBe('Grazie')
  })
})