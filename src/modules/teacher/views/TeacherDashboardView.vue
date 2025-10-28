<template>
  <section class="teacher-dashboard w-screen">
    <header class="hero">
      <div>
        <h1>Gestió de quizzes</h1>
        <p>Selecciona un quiz per obrir una sala i controlar la partida en directe.</p>
      </div>
      <RouterLink
        v-if="currentRoomId"
        class="session-link"
        :to="{ name: 'teacher-session', params: { roomId: currentRoomId } }"
      >
        Anar a la sessió activa →
      </RouterLink>
    </header>

    <p v-if="loading" class="state">Carregant quizzes…</p>
    <p v-else-if="error" class="state error">{{ error }}</p>

    <div v-else class="grid">
      <article v-for="quiz in quizzes" :key="quiz.id" class="quiz-card">
        <h2>{{ quiz.title ?? `Quiz ${quiz.id}` }}</h2>
        <p class="meta">Autor/a: {{ quiz.author ?? '—' }}</p>
        <p class="description">{{ quiz.description ?? 'Sense descripció' }}</p>
        <button type="button" class="primary" @click="handleStart(quiz.id)">Iniciar sala</button>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useTeacherSessionStore } from '@/modules/teacher/stores/session.store'

const router = useRouter()
const sessionStore = useTeacherSessionStore()

const quizzes = computed(() => sessionStore.quizzes)
const loading = computed(() => sessionStore.loadingQuizzes)
const error = computed(() => sessionStore.quizzesError)
const currentRoomId = computed(() => sessionStore.currentRoomId)

onMounted(() => {
  if (!sessionStore.quizzes.length) {
    sessionStore.loadQuizzes()
  }
})

const handleStart = async (quizId: string) => {
  await sessionStore.startSession(quizId)
  if (sessionStore.currentRoomId) {
    router.push({ name: 'teacher-session', params: { roomId: sessionStore.currentRoomId } })
  }
}
</script>

<style scoped>
.teacher-dashboard {
  min-height: 100vh;
  padding: clamp(2rem, 5vw, 3rem) clamp(1.5rem, 6vw, 4rem);
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
  color: #0f172a;
}

.hero {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  background: white;
  padding: clamp(1.5rem, 4vw, 2.5rem);
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
}

.hero h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  color: #4c1d95;
}

.hero p {
  margin: 0.25rem 0 0;
  max-width: 40ch;
  color: #334155;
}

.session-link {
  align-self: center;
  text-decoration: none;
  font-weight: 600;
  color: #1d4ed8;
  background: rgba(37, 99, 235, 0.08);
  padding: 0.65rem 1.2rem;
  border-radius: 999px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.session-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.2);
}

.state {
  margin-top: 2rem;
  text-align: center;
  font-weight: 500;
  color: #475569;
}

.state.error {
  color: #dc2626;
}

.grid {
  margin-top: 2.5rem;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.quiz-card {
  background: white;
  border-radius: 22px;
  padding: 1.75rem;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quiz-card h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #4338ca;
}

.meta {
  margin: 0;
  font-size: 0.95rem;
  color: #64748b;
}

.description {
  flex: 1;
  margin: 0;
  color: #475569;
}

.primary {
  align-self: flex-start;
  border: none;
  border-radius: 999px;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #4c1d95, #6d28d9);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(76, 29, 149, 0.35);
}
</style>
