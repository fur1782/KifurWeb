<template>
  <div class="bg-white/90 backdrop-blur border border-white/30 rounded-2xl shadow-xl">
    <div class="p-5 border-b border-slate-200/60">
      <h2 class="text-xl font-semibold">Accions</h2>
    </div>
    <div class="p-5 space-y-3">
      <RouterLink
        to="/join"
        class="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow transition-colors"
      >
        Tornar a jugar
      </RouterLink>
      <p v-if="!hasScores" class="text-xs text-slate-600">
        Sembla que ningú ha sumat punts. Revisa la configuració del qüestionari (temps,
        penalitzacions i puntuació per resposta).
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  hasScores: boolean
}

defineProps<Props>()
</script>
