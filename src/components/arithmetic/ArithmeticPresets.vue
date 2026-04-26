<template>
  <div>
    <div class="page-header">
      <h1>🧮 Arithmetic</h1>
      <button @click="$emit('new-game')" class="btn btn-primary">New Game</button>
    </div>

    <div v-if="presets.length === 0" class="empty-state">
      <div class="empty-icon">🧮</div>
      <h3>No saved presets yet</h3>
      <p>Create a game and optionally save it as a preset for quick access.</p>
      <button @click="$emit('new-game')" class="btn btn-primary">Create First Game</button>
    </div>

    <div v-else class="presets-list">
      <div
        v-for="preset in presets"
        :key="preset.id"
        class="preset-card"
        @click="$emit('load', preset)"
      >
        <div class="preset-info">
          <div class="preset-name">{{ preset.name }}</div>
          <div class="preset-summary">{{ presetSummary(preset) }}</div>
        </div>
        <button @click.stop="$emit('delete', preset.id)" class="btn-icon-del" title="Delete">🗑️</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type ArithmeticPreset, presetSummary } from '../../composables/useArithmeticEngine'

defineProps<{ presets: ArithmeticPreset[] }>()
defineEmits<{
  'new-game': []
  'load': [preset: ArithmeticPreset]
  'delete': [id: string]
}>()
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
}

.presets-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.preset-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-card:hover {
  border-color: var(--primary-color);
  background: var(--bg-tertiary);
}

.preset-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.preset-summary {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.btn-icon-del {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.4rem;
  border-radius: 0.4rem;
  transition: background 0.2s;
  line-height: 1;
  flex-shrink: 0;
}

.btn-icon-del:hover {
  background: rgba(239, 68, 68, 0.15);
}
</style>
