<template>
  <div class="bg-white/90 backdrop-blur border border-white/30 rounded-2xl shadow-xl">
    <div class="p-5 border-b border-slate-200/60">
      <h2 class="text-xl font-semibold flex items-center gap-2">🏆 Guanyador/a</h2>
    </div>
    <div class="p-5">
      <div
        v-if="winner"
        class="flex items-center justify-between p-4 rounded-2xl bg-linear-to-r from-yellow-100 to-amber-50 border border-amber-200"
      >
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-amber-400/30 grid place-items-center">🥇</div>
          <div>
            <div class="text-xl font-bold leading-tight">{{ winner.username }}</div>
            <div class="text-slate-600">Posició #1</div>
          </div>
        </div>
        <div class="text-right">
          <div class="text-3xl font-black tabular-nums">
            {{ winner.puntuation?.toFixed(2) ?? 0 }}
          </div>
          <div class="text-xs uppercase tracking-wider text-slate-500">Punts</div>
        </div>
      </div>
      <div v-else class="text-center py-8 text-slate-500">
        <p class="font-semibold">Encara no hi ha dades de classificació</p>
        <p class="text-sm">Es mostraran aquí quan acabi un joc.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Winner {
  userId: string
  username: string
  puntuation?: number
}

interface Props {
  winner: Winner | null
}

defineProps<Props>()
</script>
