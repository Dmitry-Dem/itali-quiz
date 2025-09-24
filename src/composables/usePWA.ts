import { ref, onMounted } from 'vue'

export const usePWA = () => {
  const deferredPrompt = ref<any>(null)
  const isInstallable = ref(false)
  const isInstalled = ref(false)

  // Check if app is already installed
  const checkInstallStatus = () => {
    // Check if running in standalone mode (installed PWA)
    isInstalled.value = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true

    console.log('Install status check:', {
      standalone: window.matchMedia('(display-mode: standalone)').matches,
      navigatorStandalone: (window.navigator as any).standalone,
      isInstalled: isInstalled.value
    })

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      console.log('beforeinstallprompt event fired')
      e.preventDefault()
      deferredPrompt.value = e
      isInstallable.value = true
    }

    // Remove existing listener if any
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    // Add listener
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // For testing - simulate installable state on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('192.168')) {
      setTimeout(() => {
        if (!isInstalled.value) {
          isInstallable.value = true
          console.log('Simulating installable state for local development')
        }
      }, 1000)
    }
  }

  const installPWA = async () => {
    console.log('Install PWA called, deferredPrompt:', deferredPrompt.value)
    
    if (!deferredPrompt.value) {
      console.log('No deferred prompt available')
      return false
    }

    try {
      // Show the install prompt
      deferredPrompt.value.prompt()

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.value.userChoice
      console.log('User choice:', outcome)

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
        isInstalled.value = true
        isInstallable.value = false
      }

      // Clear the deferredPrompt
      deferredPrompt.value = null
      return outcome === 'accepted'
    } catch (error) {
      console.error('Error during install:', error)
      return false
    }
  }

  const showInstallInstructions = () => {
    // For iOS Safari users who can't use the install prompt
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isStandalone = (window.navigator as any).standalone

    console.log('Device detection:', { isIOS, isStandalone, userAgent: navigator.userAgent })

    if (isIOS && !isStandalone) {
      return {
        isIOS: true,
        message: 'To install this app on your iPhone:\n1. Tap the Share button (⬆️)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" in the top right'
      }
    }

    return {
      isIOS: false,
      message: 'Click the install button to add this app to your device'
    }
  }

  // Auto-initialize when composable is used
  onMounted(() => {
    checkInstallStatus()
  })

  return {
    isInstallable,
    isInstalled,
    installPWA,
    checkInstallStatus,
    showInstallInstructions
  }
}