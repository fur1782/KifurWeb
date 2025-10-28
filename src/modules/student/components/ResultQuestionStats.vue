<template>
  <div class="lg:col-span-2 bg-white/90 backdrop-blur border border-white/30 rounded-2xl shadow-xl">
    <div class="p-5 border-b border-slate-200/60">
      <h2 class="text-xl font-semibold">Estadístiques de preguntes</h2>
    </div>
    <div class="p-5">
      <div v-if="stats.length" class="space-y-3">
        <div
          v-for="q in stats"
          :key="q.qId"
          class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
        >
          <div>
            <div class="font-semibold">Pregunta {{ q.qId }}</div>
            <div class="text-sm text-slate-600">
              Correctes: {{ q.correct }} · Incorrectes: {{ q.incorrect }}
            </div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold tabular-nums">{{ q.value?.toFixed(2) }}</div>
            <div class="text-xs text-slate-500">Valor</div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8 text-slate-500">
        <p class="font-semibold">Encara no hi ha estadístiques de preguntes</p>
        <p class="text-sm">Quan hi hagi respostes veurem si el valor puja o baixa.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface QuestionStat {
  qId: number
  value?: number
  correct: number
  incorrect: number
}

interface Props {
  stats: QuestionStat[]
}

defineProps<Props>()
</script>
