<template>
  <div v-if="showInstallPrompt" class="install-prompt">
    <div class="install-content">
      <div class="install-icon">📱</div>
      <h3>Install Italian Vocab</h3>
      <p v-if="instructions.isIOS" class="install-text">
        Add this app to your home screen for the best experience!
      </p>
      <p v-else class="install-text">
        Install this app on your device for offline access and a native experience.
      </p>
      
      <div class="install-actions">
        <!-- Always show install button for testing -->
        <button 
          @click="handleInstall"
          class="btn btn-primary install-btn"
        >
          📲 Install App {{ isInstallable ? '(Ready)' : '(Testing)' }}
        </button>
        
        <button 
          v-if="instructions.isIOS"
          @click="showIOSInstructions"
          class="btn btn-primary install-btn"
        >
          📋 iOS Instructions
        </button>
        
        <button @click="hideInstallPrompt" class="btn btn-secondary">
          Maybe Later
        </button>
      </div>
    </div>
  </div>

  <!-- iOS Instructions Modal -->
  <div v-if="showInstructions" class="modal-overlay" @click="showInstructions = false">
    <div class="modal-content instructions-modal" @click.stop>
      <div class="modal-header">
        <h3>Install on iPhone</h3>
        <button @click="showInstructions = false" class="btn btn-icon btn-secondary">
          ✕
        </button>
      </div>
      
      <div class="modal-body">
        <div class="instruction-steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <strong>Tap the Share button</strong>
              <p>Look for the share icon (⬆️) at the bottom of Safari</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <strong>Find "Add to Home Screen"</strong>
              <p>Scroll down in the share menu and tap this option</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <strong>Tap "Add"</strong>
              <p>Confirm by tapping "Add" in the top right corner</p>
            </div>
          </div>
        </div>
        
        <div class="instruction-note">
          <p>💡 Once installed, the app will work offline and feel like a native iPhone app!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { usePWA } from '../composables/usePWA'

const { isInstallable, isInstalled, installPWA, checkInstallStatus, showInstallInstructions } = usePWA()

const showInstallPrompt = ref(false)
const showInstructions = ref(false)
const instructions = ref({ isIOS: false, message: '' })

onMounted(() => {
  console.log('PWAInstall component mounted')
  checkInstallStatus()
  instructions.value = showInstallInstructions()
  
  // Enhanced debugging
  console.log('PWA Debug on mount:', {
    isInstalled: isInstalled.value,
    isInstallable: isInstallable.value,
    isIOS: instructions.value.isIOS,
    userAgent: navigator.userAgent,
    standalone: (window.navigator as any).standalone,
    displayMode: window.matchMedia('(display-mode: standalone)').matches
  })
  
  // Always show the install prompt for testing (ignore dismissal)
  setTimeout(() => {
    console.log('Showing install prompt for testing')
    showInstallPrompt.value = true
  }, 1000)
})

// Watch for changes in install status
watch([isInstallable, isInstalled], ([installable, installed]) => {
  console.log('PWA Status changed:', { installable, installed })
})

const handleInstall = async () => {
  console.log('Install button clicked - attempting installation')
  try {
    const success = await installPWA()
    console.log('Install result:', success)
    if (success) {
      showInstallPrompt.value = false
    }
  } catch (error) {
    console.error('Install error:', error)
  }
}

const showIOSInstructions = () => {
  console.log('Showing iOS instructions')
  showInstructions.value = true
  showInstallPrompt.value = false
}

const hideInstallPrompt = () => {
  console.log('Hiding install prompt')
  showInstallPrompt.value = false
  sessionStorage.setItem('install-prompt-dismissed', 'true')
}
</script>

<style scoped>
.install-prompt {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--gradient-primary);
  color: white;
  padding: 1rem;
  z-index: 1000;
  animation: slideUpFromBottom 0.4s ease-out;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  box-shadow: var(--shadow-lg);
}

.install-content {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.install-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.install-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.install-text {
  font-size: 0.95rem;
  opacity: 0.9;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.install-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.install-btn {
  background-color: white;
  color: var(--bg-accent);
  border: none;
  font-weight: 600;
}

.install-btn:hover {
  background-color: #f8fafc;
  transform: translateY(-1px);
}

.instructions-modal {
  max-width: 500px;
}

.instruction-steps {
  margin-bottom: 1.5rem;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-radius: 12px;
}

.step-number {
  background: var(--bg-accent);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.step-content strong {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.step-content p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.instruction-note {
  background-color: var(--bg-tertiary);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.instruction-note p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

@keyframes slideUpFromBottom {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .install-actions {
    flex-direction: column;
  }
  
  .install-actions .btn {
    width: 100%;
  }
  
  .step {
    padding: 0.75rem;
  }
}
</style>