<template>
  <div
    class="min-h-screen w-screen bg-linear-to-br from-indigo-600 via-sky-600 to-blue-600 p-6 md:p-10 text-slate-900 flex items-center justify-center"
  >
    <div v-if="result" class="max-w-6xl w-full">
      <!-- Capçalera -->
      <header class="mb-6 flex items-center justify-between">
        <h1 class="text-white text-4xl md:text-5xl font-black tracking-tight drop-shadow">
          Resultats · <span class="opacity-90">QuiFur</span>
        </h1>
        <div class="flex items-center gap-3 text-white/90">
          <span class="rounded-full px-3 py-1 bg-white/15 border border-white/20 text-sm"
            >Sala {{ result.roomId }}</span
          >
        </div>
      </header>

      <div class="mb-6" style="margin-bottom: 6px">
        <!-- Guanyador -->
        <ResultWinner :winner="winner" />
      </div>

      <!-- Cos: Rànquing + Gràfic -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <!-- Rànquing -->
        <ResultLeaderboard :board="board" />

        <!-- Estadístiques -->
        <ResultQuestionStats :stats="questionStats" />
      </div>
    </div>
    <div v-else class="max-w-2xl mx-auto text-center text-white">
      <p class="text-2xl font-bold mb-2">No hi ha resultats disponibles</p>
      <RouterLink to="/join" class="text-white/80 hover:text-white underline"
        >Torna a unir-te a una sala</RouterLink
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import ResultWinner from '@/modules/student/components/ResultWinner.vue'
import ResultLeaderboard from '@/modules/student/components/ResultLeaderboard.vue'
import ResultQuestionStats from '@/modules/student/components/ResultQuestionStats.vue'
import { getResult } from '../actions/get-results.action'
import { useRoute } from 'vue-router'

const route = useRoute()

const result = ref<any>(null)

onMounted(async () => {
  result.value = await getResult(route.params.roomId as string)
})

const board = computed(() => {
  if (!result.value?.leaderboard) return []
  return [...result.value.leaderboard].sort((a, b) => (b.puntuation ?? 0) - (a.puntuation ?? 0))
})

const winner = computed(() => board.value[0] ?? null)

const questionStats = computed(() => result.value?.questionStats ?? [])
</script>
