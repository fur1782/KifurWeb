<template>
  <section v-if="roomId" class="teacher-session w-screen">
    <div aria-hidden="true" class="decorations">
      <span class="shape shape--dot shape--dot-green"></span>
      <span class="shape shape--dot shape--dot-orange"></span>
      <span class="shape shape--spark"></span>
      <span class="shape shape--arc"></span>
    </div>

    <header class="brand">
      <h1 class="brand__title">QuiFur</h1>
      <p class="brand__room">
        Sala <span>{{ roomId }}</span>
      </p>
    </header>

    <p v-if="error" class="error">{{ error }}</p>

    <section class="board w-max-80">
      <header class="board__header">
        <div class="board__meta">
          <p class="board__label">Rendiment per pregunta</p>
          <p class="board__code">Codi {{ roomId }}</p>
        </div>
        <span class="board__heading">Valor</span>
      </header>

      <div class="board__content">
        <QuestionMetricsChart :data="puntuation" />

        <aside class="sidebar">
          <div class="sidebar-card">
            <h3>Rankings</h3>
            <ol class="leaderboard">
              <li v-for="(player, index) in topThree" :key="player.userId">
                <span class="leaderboard__position">{{ index + 1 }}.</span>
                <span class="leaderboard__name">{{ player.username }}</span>
                <span class="leaderboard__score">{{ player.puntuation ?? 0 }} pts</span>
              </li>
              <li v-if="!topThree.length" class="leaderboard leaderboard--empty">
                Encara no hi ha alumnat connectat.
              </li>
            </ol>
          </div>

          <div class="sidebar-card">
            <h3>Pregunta mes valuosa</h3>
            <p v-if="mostValuableQuestion" class="mvp-tag">{{ mostValuableQuestion.qId }}</p>
            <p v-else class="leaderboard--empty">Encara no hi ha dades.</p>
          </div>

          <div class="sidebar-actions">
            <button class="btn btn-primary" type="button" @click="handleStartQuiz">
              Iniciar quiz
            </button>
            <button class="btn btn-ghost" type="button" @click="handleClose">Tancar sessio</button>
          </div>
        </aside>
      </div>
    </section>
  </section>
  <section v-else class="empty-state">
    <p>
      No hi ha cap sessio activa. Torna a <RouterLink to="/create">seleccionar un quiz</RouterLink>.
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useTeacherSessionStore } from '@/modules/teacher/stores/session.store'
import QuestionMetricsChart from '@/modules/teacher/components/QuestionMetricsChart.vue'

type RawEntry = {
  qId?: string | number
  value?: number
  [k: string]: any
}

const route = useRoute()
const router = useRouter()
const sessionStore = useTeacherSessionStore()

const roomIdParam = computed(() => route.params.roomId as string | undefined)
const roomId = computed(() => sessionStore.currentRoomId ?? roomIdParam.value ?? null)
const userPool = computed(() => sessionStore.userPool ?? [])
const puntuation = computed<RawEntry[]>(() => sessionStore.puntuation ?? [])
const error = computed(() => sessionStore.sessionError)

const leaderboard = computed(() =>
  [...userPool.value].sort((a, b) => (b.puntuation ?? 0) - (a.puntuation ?? 0))
)

const topThree = computed(() => leaderboard.value.slice(0, 3))

const mostValuableQuestion = computed(() => {
  const entries = puntuation.value ?? []
  if (!entries.length) return null

  let maxValue = -Infinity
  let bestEntry: RawEntry | null = null

  entries.forEach((entry) => {
    const val = entry.value ?? 0
    if (val > maxValue) {
      maxValue = val
      bestEntry = entry
    }
  })

  return bestEntry
})

const ensureJoined = (targetRoomId: string | null) => {
  if (!targetRoomId) return
  sessionStore.ensureSocket()
  sessionStore.socket?.emit('join-control-room', { roomId: targetRoomId })
  sessionStore.currentRoomId = targetRoomId
}

onMounted(() => {
  ensureJoined(roomId.value)
})

watch(roomIdParam, (newRoomId) => {
  if (newRoomId) {
    ensureJoined(newRoomId)
  }
})

watch(
  () => sessionStore.status,
  (newStatus) => {
    if (newStatus === 'finished') {
      router.replace({ name: 'result', params: { roomId: sessionStore.currentRoomId } })
    }
  }
)

const handleStartQuiz = () => {
  sessionStore.startQuiz()
}

const handleClose = () => {
  sessionStore.resetSession()
}

onBeforeUnmount(() => {
  sessionStore.socket?.off('user-joined')
  sessionStore.socket?.off('update-puntuation')
})
</script>

<style scoped>
.teacher-session {
  min-height: 100vh;
  padding: clamp(2rem, 5vw, 3rem) clamp(1.5rem, 6vw, 4rem);
  background: radial-gradient(
    185% 120% at 50% 10%,
    #60a5fa 0%,
    #3b82f6 22%,
    #2563eb 40%,
    #1d4ed8 70%
  );
  color: #f8fafc;
  position: relative;
  overflow: hidden;
}

.decorations {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.shape {
  position: absolute;
  display: block;
  border-radius: 50%;
  opacity: 0.8;
}

.shape--dot {
  width: clamp(14px, 2vw, 20px);
  height: clamp(14px, 2vw, 20px);
}

.shape--dot-green {
  background: #22c55e;
  top: clamp(2.5rem, 12vw, 6rem);
  right: clamp(2rem, 10vw, 6rem);
}

.shape--dot-orange {
  background: #f97316;
  top: clamp(10rem, 30vw, 18rem);
  left: clamp(1.5rem, 10vw, 5rem);
}

.shape--spark {
  width: clamp(16px, 3vw, 24px);
  height: clamp(16px, 3vw, 24px);
  border-radius: 0;
  border: 3px solid #ffffff;
  transform: rotate(45deg);
  left: clamp(3rem, 12vw, 7rem);
  top: clamp(5rem, 15vw, 8rem);
  opacity: 0.6;
}

.shape--arc {
  width: clamp(48px, 10vw, 80px);
  height: clamp(48px, 10vw, 80px);
  border: 8px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  border-bottom-color: transparent;
  border-left-color: transparent;
  bottom: clamp(3rem, 8vw, 5rem);
  left: clamp(2rem, 8vw, 5rem);
  transform: rotate(-30deg);
  opacity: 0.4;
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.35rem;
  position: relative;
  z-index: 1;
}

.brand__title {
  margin: 0;
  font-size: clamp(3rem, 8vw, 4.75rem);
  letter-spacing: 0.04em;
  font-weight: 700;
}

.brand__room {
  margin: 0;
  font-size: clamp(1rem, 3vw, 1.25rem);
  color: rgba(248, 250, 252, 0.8);
}

.brand__room span {
  font-weight: 700;
  color: #ffffff;
}

.board {
  position: relative;
  margin-top: clamp(2.5rem, 6vw, 3.5rem);
  background: linear-gradient(145deg, rgba(76, 29, 149, 0.9), rgba(37, 99, 235, 0.9));
  border-radius: clamp(1.8rem, 5vw, 2.4rem);
  padding: clamp(1.5rem, 3vw, 2.2rem);
  box-shadow: 0 30px 70px rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(20px);
  z-index: 1;
}

.board__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: clamp(1rem, 3vw, 1.4rem) clamp(1.2rem, 4vw, 1.8rem);
  background: rgba(255, 255, 255, 0.12);
  border-radius: clamp(1.4rem, 4vw, 1.8rem);
  position: relative;
  overflow: hidden;
}

.board__meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.board__label {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(248, 250, 252, 0.7);
  font-size: 0.75rem;
}

.board__code {
  margin: 0;
  font-size: clamp(1.2rem, 3vw, 1.6rem);
  font-weight: 600;
}

.board__heading {
  font-weight: 700;
  font-size: clamp(1rem, 3vw, 1.4rem);
  color: #fef9c3;
}

.board__content {
  display: grid;
  gap: clamp(1.5rem, 4vw, 2.5rem);
  grid-template-columns: minmax(0, 2.2fr) minmax(0, 1fr);
  margin-top: clamp(1.5rem, 4vw, 2.25rem);
  align-items: stretch;
}

@media (max-width: 900px) {
  .board__content {
    grid-template-columns: 1fr;
  }
}

.error {
  margin-top: 1rem;
  text-align: center;
  color: #fee2e2;
  font-weight: 600;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 3vw, 1.5rem);
}

.sidebar-card {
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
  border-radius: clamp(1rem, 3vw, 1.4rem);
  padding: clamp(1rem, 3vw, 1.4rem);
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.05);
}

.sidebar-card h3 {
  margin: 0 0 clamp(0.6rem, 2vw, 0.9rem);
  font-size: clamp(1rem, 3vw, 1.2rem);
  font-weight: 700;
}

.leaderboard {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(0.5rem, 1.5vw, 0.75rem);
}

.leaderboard li {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.5rem;
  align-items: center;
  font-weight: 600;
}

.leaderboard__position {
  color: #6366f1;
}

.leaderboard__name {
  color: #0f172a;
}

.leaderboard__score {
  color: #38bdf8;
}

.leaderboard--empty {
  font-weight: 500;
  color: #475569;
  font-style: italic;
}

.mvp-tag {
  margin: 0;
  font-size: clamp(2rem, 6vw, 2.8rem);
  font-weight: 700;
  color: #1d4ed8;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.3));
  border-radius: clamp(0.9rem, 3vw, 1.2rem);
  padding: clamp(0.6rem, 2vw, 0.9rem);
  text-align: center;
}

.sidebar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.btn {
  border-radius: 999px;
  padding: 0.75rem 1.6rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  box-shadow: 0 12px 24px rgba(79, 70, 229, 0.4);
}

.btn-ghost {
  background: rgba(79, 70, 229, 0.12);
  color: #4338ca;
  box-shadow: 0 0 0 1px rgba(79, 70, 229, 0.2);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.18);
}

.empty-state {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
  color: #334155;
  text-align: center;
  padding: 2rem;
}
</style>
