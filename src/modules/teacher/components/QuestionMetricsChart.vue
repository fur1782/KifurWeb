<template>
  <div class="questions">
    <ul class="question-list">
      <li
        v-for="metric in metrics"
        :key="metric.qId ?? metric.idx"
        :class="['question-item', `question-item--${metric.trend}`]"
      >
        <span class="question-item__id">{{ metric.label }}</span>
        <div class="question-item__bar">
          <span
            class="question-item__fill"
            :style="{ width: `${Math.max(metric.fillPercent, 0.18) * 100}%` }"
          ></span>
          <div class="question-item__value">
            <span class="trend-icon" aria-hidden="true">
              <svg
                v-if="metric.trend === 'up'"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8 3l5 6H3z" fill="currentColor" />
              </svg>
              <svg
                v-else-if="metric.trend === 'down'"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8 13l-5-6h10z" fill="currentColor" />
              </svg>
              <svg v-else viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="7.25" width="10" height="1.5" rx="0.75" fill="currentColor" />
              </svg>
            </span>
            <span class="question-item__points">{{ metric.displayValue }}</span>
          </div>
        </div>
      </li>
      <li v-if="!metrics.length" class="question-item question-item--empty">
        Encara no hi ha puntuacions disponibles.
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export type RawEntry = {
  qId?: string | number
  value?: number
  [k: string]: any
}

export type Metric = RawEntry & {
  idx: number
  label: string
  trend: 'up' | 'down' | 'flat'
  fillPercent: number
  displayValue: string
  value: number
}

interface Props {
  data: RawEntry[]
}

const props = defineProps<Props>()

const metrics = computed<Metric[]>(() => {
  const entries = props.data ?? []
  if (!entries.length) return []

  const maxAbs = Math.max(...entries.map((entry) => Math.abs(entry.value ?? 0)), 1)

  return entries.map((entry, index) => {
    const value = entry.value ?? 0
    const trend = value > 0 ? 'up' : value < 0 ? 'down' : 'flat'
    const label = entry.qId ? `Q${entry.qId}` : `Q${index + 1}`
    const fillPercent = Math.abs(value) / maxAbs

    return {
      ...entry,
      idx: index + 1,
      label,
      value,
      trend,
      fillPercent,
      displayValue: Math.abs(value) >= 10 ? Math.abs(value).toFixed(0) : Math.abs(value).toFixed(1),
    } as Metric
  })
})
</script>

<style scoped>
.questions {
  background: rgba(255, 255, 255, 0.9);
  border-radius: clamp(1.2rem, 4vw, 1.6rem);
  padding: clamp(1.3rem, 3vw, 1.8rem);
  color: #0f172a;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}

.question-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 2vw, 1rem);
}

.question-item {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: clamp(0.75rem, 2vw, 1rem);
  background: rgba(241, 245, 249, 0.8);
  padding: clamp(0.7rem, 2vw, 1rem);
  border-radius: clamp(0.9rem, 3vw, 1.2rem);
  position: relative;
  overflow: hidden;
}

.question-item__id {
  font-weight: 700;
  font-size: clamp(1rem, 3vw, 1.3rem);
  color: #0f172a;
}

.question-item__bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: clamp(0.7rem, 2vw, 1rem);
  padding: clamp(0.4rem, 1.5vw, 0.6rem) clamp(0.6rem, 2vw, 0.9rem);
  overflow: hidden;
}

.question-item__fill {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 0;
  background: linear-gradient(90deg, rgba(34, 197, 94, 0.18), rgba(34, 197, 94, 0.65));
  border-radius: inherit;
  transition: width 0.4s ease;
}

.question-item--down .question-item__fill {
  background: linear-gradient(90deg, rgba(248, 113, 113, 0.2), rgba(239, 68, 68, 0.75));
}

.question-item--flat .question-item__fill {
  background: linear-gradient(90deg, rgba(148, 163, 184, 0.2), rgba(148, 163, 184, 0.55));
}

.question-item__value {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 700;
  color: #0f172a;
}

.trend-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.question-item__value svg {
  width: clamp(1rem, 3vw, 1.2rem);
  height: clamp(1rem, 3vw, 1.2rem);
}

.question-item__points {
  position: relative;
  z-index: 1;
}

.question-item--up .question-item__value {
  color: #22c55e;
}

.question-item--down .question-item__value {
  color: #ef4444;
}

.question-item--flat .question-item__value {
  color: #475569;
}

.question-item--empty {
  justify-content: center;
  text-align: center;
  grid-template-columns: 1fr;
  color: #475569;
  font-style: italic;
}
</style>
