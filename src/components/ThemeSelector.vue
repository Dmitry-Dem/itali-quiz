<template>
  <div class="theme-selector">
    <select @change="handleThemeChange" :value="theme" class="theme-select">
      <option value="light">☀️ Light</option>
      <option value="dark">🌙 Dark</option>
      <option value="ocean">🌊 Ocean</option>
      <option value="forest">🌲 Forest</option>
      <option value="sunset">🌅 Sunset</option>
      <option value="purple">🔮 Deep Purple</option>
      <option value="rose">🍷 Dark Burgundy</option>
      <option value="midnight">🌃 Midnight</option>
      <option value="cream">☕ Dark Coffee</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '../composables/useAppStore'
import { nextTick } from 'vue'

const { theme, setTheme } = useAppStore()

const handleThemeChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newTheme = target.value as any
  
  // Update the store first
  setTheme(newTheme)
  
  // Wait for Vue reactivity to process
  await nextTick()
  
  // Force immediate theme application as backup
  document.documentElement.setAttribute('data-theme', newTheme)
  document.body.setAttribute('data-theme', newTheme)
}
</script>

<style scoped>
.theme-selector {
  position: relative;
}

.theme-select {
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 0.75rem;
  min-width: 120px;
}

.theme-select:focus {
  outline: none;
  border-color: var(--border-color-focus);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
}

.theme-select:hover {
  border-color: var(--border-color-focus);
}
</style>