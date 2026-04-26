<template>
  <div class="arithmetic-container">
    <div class="container">
      <ArithmeticPresets
        v-if="screen === 'presets'"
        :presets="presets"
        @new-game="onNewGame"
        @load="onLoadPreset"
        @delete="onDeletePreset"
      />

      <ArithmeticSetup
        v-else-if="screen === 'setup'"
        :initial="initialSetup"
        @back="screen = 'presets'"
        @start="onStart"
      />

      <ArithmeticPractice
        v-else-if="screen === 'practice' && activeSetup"
        :setup="activeSetup"
        @back-to-setup="screen = 'setup'"
        @quit="screen = 'presets'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  type ArithmeticPreset,
  type GameSetup,
  loadPresets,
  savePresets,
  defaultSetup,
  setupFromPreset,
  presetFromSetup,
} from '../composables/useArithmeticEngine'
import ArithmeticPresets from '../components/arithmetic/ArithmeticPresets.vue'
import ArithmeticSetup from '../components/arithmetic/ArithmeticSetup.vue'
import ArithmeticPractice from '../components/arithmetic/ArithmeticPractice.vue'

const screen = ref<'presets' | 'setup' | 'practice'>('presets')
const presets = ref<ArithmeticPreset[]>(loadPresets())
const initialSetup = ref<GameSetup | undefined>(undefined)
const activeSetup = ref<GameSetup | null>(null)

function onNewGame() {
  initialSetup.value = undefined
  screen.value = 'setup'
}

function onLoadPreset(preset: ArithmeticPreset) {
  initialSetup.value = setupFromPreset(preset)
  screen.value = 'setup'
}

function onDeletePreset(id: string) {
  presets.value = presets.value.filter(p => p.id !== id)
  savePresets(presets.value)
}

function onStart(setup: GameSetup) {
  if (setup.presetName.trim()) {
    const preset = presetFromSetup(setup)
    const existing = presets.value.findIndex(p => p.name === preset.name)
    if (existing >= 0) {
      presets.value.splice(existing, 1, preset)
    } else {
      presets.value.push(preset)
    }
    savePresets(presets.value)
  }
  activeSetup.value = { ...setup, presetName: '' }
  initialSetup.value = { ...setup, presetName: '' }
  screen.value = 'practice'
}
</script>

<style scoped>
.arithmetic-container {
  padding: 2rem 0;
}

.container {
  max-width: 640px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
</style>
