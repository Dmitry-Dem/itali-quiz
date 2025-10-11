<template>
  <div class="search-section" :class="{ 'animate-slide-up': animate }">
    <div class="search-container">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input 
          :value="modelValue"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          type="text" 
          class="search-input"
          :placeholder="placeholder"
        >
        <button 
          v-if="modelValue"
          @click="$emit('update:modelValue', '')"
          class="clear-search"
        >
          ✕
        </button>
      </div>
      
      <div v-if="showLearnedFilter" class="filter-wrapper">
        <select 
          :value="learnedFilter" 
          @change="$emit('update:learnedFilter', ($event.target as HTMLSelectElement).value)"
          class="learned-filter"
        >
          <option value="all">All Words</option>
          <option value="learned">Learned Only</option>
          <option value="unlearned">Not Learned</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
  showLearnedFilter?: boolean
  learnedFilter?: string
  animate?: boolean
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Search words...',
  showLearnedFilter: false,
  learnedFilter: 'all',
  animate: false
})

defineEmits<{
  'update:modelValue': [value: string]
  'update:learnedFilter': [value: string]
}>()
</script>

<style scoped>
.search-section {
  margin-bottom: 2rem;
}

.search-container {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  min-width: 250px;
  max-width: none;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: var(--text-muted);
  pointer-events: none;
  z-index: 1;
  font-size: 1.1rem;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 1rem;
  background-color: var(--bg-card);
  color: var(--text-primary);
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.search-input:focus {
  outline: none;
  border-color: var(--border-color-focus);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
}

.search-input:hover {
  border-color: var(--border-color-focus);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.clear-search {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.clear-search:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.filter-wrapper {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.learned-filter {
  padding: 1rem 2.5rem 1rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background-color: var(--bg-card);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
  box-shadow: var(--shadow-sm);
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1rem;
}

.learned-filter:focus {
  outline: none;
  border-color: var(--border-color-focus);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
}

.learned-filter:hover {
  border-color: var(--border-color-focus);
}

/* Animation classes */
.animate-slide-up {
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile styles */
@media (max-width: 768px) {
  .search-container {
    flex-direction: column;
    gap: 0.75rem;
  }

  .search-input-wrapper {
    min-width: 100%;
  }

  .filter-wrapper {
    width: 100%;
  }

  .learned-filter {
    width: 100%;
  }
}
</style>