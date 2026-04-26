<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Session Complete!</h3>
        <button @click="$emit('close')" class="close-btn">×</button>
      </div>
      
      <div class="modal-body">
        <div class="grade-display">
          <div class="grade-letter" :class="gradeClass">{{ grade }}</div>
          <div class="grade-description">{{ gradeDescription }}</div>
        </div>
        
        <div class="score-formats">
          <div class="score-item">
            <span class="score-label">Score:</span>
            <span class="score-value">{{ correctAnswers }}/{{ totalQuestions }}</span>
          </div>
          <div class="score-item">
            <span class="score-label">Percentage:</span>
            <span class="score-value">{{ percentage }}%</span>
          </div>
          <div class="score-item">
            <span class="score-label">Words Known:</span>
            <span class="score-value">{{ correctAnswers }}/{{ totalQuestions }} words</span>
          </div>
        </div>
        
        <div class="detailed-stats">
          <div class="stat-grid">
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-number">{{ correctAnswers }}</div>
              <div class="stat-label">Correct</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">❌</div>
              <div class="stat-number">{{ incorrectAnswers }}</div>
              <div class="stat-label">Incorrect</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-number">{{ totalQuestions }}</div>
              <div class="stat-label">Total</div>
            </div>
            <div v-if="timeTaken" class="stat-card">
              <div class="stat-icon">⏱</div>
              <div class="stat-number">{{ formatTime(timeTaken) }}</div>
              <div class="stat-label">Time</div>
            </div>
          </div>
        </div>
        
        <div class="encouragement">
          <p>{{ encouragementMessage }}</p>
        </div>
      </div>
      
      <div class="modal-actions">
        <button @click="$emit('restart')" class="btn btn-primary">Study Again</button>
        <button @click="$emit('close')" class="btn btn-secondary">Done</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  correctAnswers: number
  incorrectAnswers: number
  totalQuestions: number
  timeTaken?: number
}

const props = defineProps<Props>()

defineEmits<{
  close: []
  restart: []
}>()

const percentage = computed(() => {
  if (props.totalQuestions === 0) return 0
  return Math.round((props.correctAnswers / props.totalQuestions) * 100)
})

const grade = computed(() => {
  const pct = percentage.value
  if (pct >= 97) return 'A+'
  if (pct >= 93) return 'A'
  if (pct >= 90) return 'A-'
  if (pct >= 87) return 'B+'
  if (pct >= 83) return 'B'
  if (pct >= 80) return 'B-'
  if (pct >= 77) return 'C+'
  if (pct >= 73) return 'C'
  if (pct >= 70) return 'C-'
  if (pct >= 67) return 'D+'
  if (pct >= 65) return 'D'
  return 'F'
})

const gradeClass = computed(() => {
  const g = grade.value
  if (g.startsWith('A')) return 'grade-a'
  if (g.startsWith('B')) return 'grade-b'
  if (g.startsWith('C')) return 'grade-c'
  if (g.startsWith('D')) return 'grade-d'
  return 'grade-f'
})

const gradeDescription = computed(() => {
  const g = grade.value
  if (g === 'A+' || g === 'A') return 'Excellent!'
  if (g === 'A-') return 'Great work!'
  if (g.startsWith('B')) return 'Good job!'
  if (g.startsWith('C')) return 'Keep practicing!'
  if (g.startsWith('D')) return 'Room for improvement'
  return 'More study needed'
})

const encouragementMessage = computed(() => {
  const pct = percentage.value
  if (pct >= 95) return "Outstanding! You've mastered these words! 🎉"
  if (pct >= 85) return "Excellent work! You're really getting the hang of this! 👏"
  if (pct >= 75) return "Good job! Keep up the consistent practice! 💪"
  if (pct >= 65) return "Nice progress! A bit more practice and you'll nail it! 📚"
  if (pct >= 50) return "You're improving! Keep studying and you'll get there! 🌟"
  return "Don't give up! Every expert was once a beginner! 🚀"
})

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? m + 'm ' + s + 's' : s + 's'
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0 1.5rem;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.grade-display {
  text-align: center;
  margin-bottom: 2rem;
}

.grade-letter {
  font-size: 4rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.grade-a { color: #10b981; }
.grade-b { color: #3b82f6; }
.grade-c { color: #f59e0b; }
.grade-d { color: #ef4444; }
.grade-f { color: #dc2626; }

.grade-description {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.score-formats {
  background: var(--bg-tertiary);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.score-item:last-child {
  border-bottom: none;
}

.score-label {
  font-weight: 500;
  color: var(--text-secondary);
}

.score-value {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.detailed-stats {
  margin-bottom: 1.5rem;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  border: 1px solid var(--border-color);
}

.stat-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.encouragement {
  text-align: center;
  padding: 1rem;
  background: linear-gradient(135deg, var(--bg-accent)20, var(--bg-accent)10);
  border-radius: 12px;
  border: 1px solid var(--bg-accent)30;
}

.encouragement p {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-primary);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--bg-accent);
  color: var(--text-accent);
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-primary);
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

@media (max-width: 768px) {
  .modal-content {
    margin: 1rem;
    max-width: none;
  }
  
  .grade-letter {
    font-size: 3rem;
  }
  
  .stat-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>