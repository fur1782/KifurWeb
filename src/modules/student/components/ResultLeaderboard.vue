<template>
  <div class="bg-white/90 backdrop-blur border border-white/30 rounded-2xl shadow-xl">
    <div class="p-5 border-b border-slate-200/60">
      <h2 class="text-xl font-semibold">Classificació</h2>
    </div>
    <div class="p-2">
      <ol v-if="board.length" class="divide-y">
        <li
          v-for="(u, index) in board"
          :key="u.userId"
          class="flex items-center justify-between py-3 px-3"
        >
          <div class="flex items-center gap-3">
            <span
              :class="rankBadgeClass(index + 1)"
              class="w-8 h-8 shrink-0 rounded-full grid place-items-center font-bold tabular-nums text-sm"
              >{{ index + 1 }}</span
            >
            <div>
              <div class="font-medium leading-tight">{{ u.username }}</div>
              <div class="text-xs text-slate-500">id: {{ u.userId.slice(0, 6) }}…</div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-semibold tabular-nums">{{ u.puntuation?.toFixed(2) ?? 0 }}</div>
            <div class="text-xs text-slate-500">punts</div>
          </div>
        </li>
      </ol>
      <div v-else class="text-center py-8 text-slate-500">
        <p class="font-semibold">Sense classificació</p>
        <p class="text-sm">Apareixerà aquí en acabar la partida.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface BoardEntry {
  userId: string
  username: string
  puntuation?: number
}

interface Props {
  board: BoardEntry[]
}

defineProps<Props>()

function rankBadgeClass(rank: number) {
  if (rank === 1) return 'bg-amber-400 text-white'
  if (rank === 2) return 'bg-slate-300 text-slate-800'
  if (rank === 3) return 'bg-orange-300 text-orange-900'
  return 'bg-slate-100 text-slate-700'
}
</script>
