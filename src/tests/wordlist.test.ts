import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import WordList from '../views/WordList.vue'

// Mock the router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useRoute: () => ({
    params: { id: 'test-group' },
  }),
}))

// Mock the store
vi.mock('../composables/useAppStore', () => ({
  useAppStore: () => ({
    words: { value: [] },
    wordGroups: { value: [] },
    addWord: vi.fn(),
    removeWord: vi.fn(),
    updateWord: vi.fn(),
    searchWords: vi.fn(() => []),
    toggleWordLearned: vi.fn(),
  }),
}))

// Mock window methods
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})

describe('WordList Component', () => {
  it('should render without crashing', () => {
    const wrapper = mount(WordList)
    expect(wrapper.exists()).toBe(true)
  })

  it('should display the learned filter dropdown', () => {
    const wrapper = mount(WordList)
    const filterSelect = wrapper.find('.learned-filter')
    expect(filterSelect.exists()).toBe(true)
  })

  it('should have correct filter options', () => {
    const wrapper = mount(WordList)
    const options = wrapper.findAll('.learned-filter option')
    
    expect(options.length).toBe(3)
    expect(options[0]?.text()).toBe('All Words')
    expect(options[1]?.text()).toBe('Learned Only')
    expect(options[2]?.text()).toBe('Not Learned')
  })

  it('should have search and filter functionality', () => {
    const wrapper = mount(WordList)
    
    const searchInput = wrapper.find('.search-input')
    expect(searchInput.exists()).toBe(true)
    
    const filterSelect = wrapper.find('.learned-filter')
    expect(filterSelect.exists()).toBe(true)
    
    expect(wrapper.vm).toBeTruthy()
  })
})