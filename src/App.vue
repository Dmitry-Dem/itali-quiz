<template>
  <div id="app" :data-theme="theme">
    <nav class="nav-header safe-area-top">
      <div class="container">
        <div class="flex justify-between items-center">
          <router-link to="/" class="logo">
            <h2 class="text-xl font-bold">🇮🇹 Vocab</h2>
          </router-link>
          
          <button @click="toggleTheme" class="btn btn-icon btn-secondary">
            <span v-if="theme === 'light'">🌙</span>
            <span v-else>☀️</span>
          </button>
        </div>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from './composables/useAppStore'
import { watch, onMounted } from 'vue'

const { theme, setTheme } = useAppStore()

const toggleTheme = () => {
  setTheme(theme.value === 'light' ? 'dark' : 'light')
}

const applyTheme = (currentTheme: string) => {
  document.documentElement.setAttribute('data-theme', currentTheme)
  document.body.setAttribute('data-theme', currentTheme)
}

watch(theme, (newTheme) => {
  applyTheme(newTheme)
}, { immediate: true })

onMounted(() => {
  applyTheme(theme.value)
})
</script>

<style scoped>
#app {
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.nav-header {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.logo {
  text-decoration: none;
  color: var(--text-primary);
}

.main-content {
  flex: 1;
  padding: 2rem 0;
  min-height: calc(100vh - 80px);
  background-color: var(--bg-primary);
}

@media (max-width: 768px) {
  .nav-header {
    padding: 0.75rem 0;
  }
  
  .main-content {
    padding: 1rem 0;
  }
}
</style>
