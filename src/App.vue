<template>
  <div id="app" :data-theme="theme">
    <nav class="nav-header safe-area-top">
      <div class="container">
        <div class="nav-content">
          <router-link to="/" class="logo">
            <h2 class="text-xl font-bold">🇮🇹 Vocab</h2>
          </router-link>
          
          <div class="nav-links desktop-nav">
            <router-link to="/" class="nav-link">Home</router-link>
            <router-link to="/groups" class="nav-link">Categories</router-link>
            <router-link to="/words" class="nav-link">All Words</router-link>
            <router-link to="/duplicates" class="nav-link">Duplicates</router-link>
            <router-link to="/notes" class="nav-link">Notes</router-link>
            <router-link to="/text-import" class="nav-link">Text Import</router-link>
            <router-link to="/import-queue" class="nav-link">Import Queue</router-link>
          </div>
          
          <div class="mobile-nav-controls">
            <ThemeSelector class="mobile-theme" />
            <button @click="showMobileMenu = !showMobileMenu" class="btn btn-icon btn-secondary mobile-menu-toggle">
              <span v-if="!showMobileMenu">☰</span>
              <span v-else>✕</span>
            </button>
          </div>
          
          <ThemeSelector class="desktop-theme" />
        </div>
        
        <div class="mobile-nav" :class="{ 'mobile-nav-open': showMobileMenu }">
          <router-link to="/" class="nav-link mobile-nav-link" @click="showMobileMenu = false">
            <span class="nav-icon">🏠</span>
            Home
          </router-link>
          <router-link to="/groups" class="nav-link mobile-nav-link" @click="showMobileMenu = false">
            <span class="nav-icon">📚</span>
            Categories
          </router-link>
          <router-link to="/words" class="nav-link mobile-nav-link" @click="showMobileMenu = false">
            <span class="nav-icon">📝</span>
            All Words
          </router-link>
          <router-link to="/duplicates" class="nav-link mobile-nav-link" @click="showMobileMenu = false">
            <span class="nav-icon">🔍</span>
            Duplicates
          </router-link>
          <router-link to="/notes" class="nav-link mobile-nav-link" @click="showMobileMenu = false">
            <span class="nav-icon">📓</span>
            Notes
          </router-link>
          <router-link to="/text-import" class="nav-link mobile-nav-link" @click="showMobileMenu = false">
            <span class="nav-icon">📄</span>
            Text Import
          </router-link>
          <router-link to="/import-queue" class="nav-link mobile-nav-link" @click="showMobileMenu = false">
            <span class="nav-icon">📋</span>
            Import Queue
          </router-link>
        </div>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view />
    </main>
    
    <footer class="app-footer">
      <div class="container">
        <div class="footer-content">
          <button @click="refreshPage" class="btn btn-icon btn-secondary refresh-btn" title="Refresh to apply updates">
            <span>🔄</span>
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from './composables/useAppStore'
import { watch, onMounted, ref } from 'vue'
import ThemeSelector from './components/ThemeSelector.vue'

const { theme } = useAppStore()
const showMobileMenu = ref(false)

const refreshPage = () => {
  window.location.reload()
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

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  width: 100%;
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 2rem;
}

.logo {
  text-decoration: none;
  color: var(--text-primary);
  flex-shrink: 0;
}

.nav-links {
  display: flex;
  gap: 3rem;
  align-items: center;
  flex-shrink: 0;
  flex: 1;
  justify-content: center;
}

.desktop-nav {
  display: flex;
}

.nav-link {
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  font-size: 1rem;
  white-space: nowrap;
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.nav-link.router-link-active {
  color: var(--primary-color);
  background: var(--primary-color)20;
}

.mobile-nav-controls {
  display: none;
  align-items: center;
  gap: 0.5rem;
}

.mobile-menu-toggle {
  font-size: 1.25rem;
}

.desktop-nav {
  display: flex;
}

.desktop-theme {
  display: block;
}

.mobile-nav {
  display: none;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.mobile-nav-open {
  display: flex;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border-radius: 0.5rem;
}

.nav-icon {
  font-size: 1.25rem;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
  min-height: calc(100vh - 120px);
  background-color: var(--bg-primary);
}

.app-footer {
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: 1rem 0;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
}

.refresh-btn {
  font-size: 1.1rem;
  transition: transform 0.2s ease;
}

.refresh-btn:hover {
  transform: rotate(90deg);
}

.refresh-btn:active {
  transform: rotate(180deg);
}

@media (max-width: 768px) {
  .nav-header {
    padding: 0.75rem 0;
  }
  
  .desktop-nav {
    display: none;
  }
  
  .desktop-theme-toggle {
    display: none;
  }
  
  .mobile-nav-controls {
    display: flex;
  }
  
  .mobile-nav {
    display: flex;
  }
  
  .mobile-nav:not(.mobile-nav-open) {
    display: none;
  }
  
  .main-content {
    padding: 1rem 0;
    min-height: calc(100vh - 100px);
  }
  
  .app-footer {
    padding: 0.75rem 0;
  }
  
  .logo h2 {
    font-size: 1.25rem;
  }
  
  .desktop-theme {
    display: none;
  }
  
  .mobile-theme {
    display: block;
  }
}

@media (min-width: 769px) {
  .desktop-nav {
    display: flex;
  }
  
  .mobile-nav-controls {
    display: none;
  }
  
  .mobile-nav {
    display: none;
  }
  
  .desktop-theme {
    display: block;
  }
  
  .mobile-theme {
    display: none;
  }
}
</style>
