<template>
  <section v-if="roomId" class="play-view w-screen" style="grid-column: 1 / -1">
    <div aria-hidden="true" class="decor">
      <span class="shape shape--dot shape--dot-green"></span>
      <span class="shape shape--dot shape--dot-orange"></span>
      <span class="shape shape--spark"></span>
      <span class="shape shape--bubble"></span>
    </div>

    <header class="brand">
      <h1 class="brand__title">QuiFur</h1>
      <p class="brand__meta">
        <span class="brand__label">Sala</span>
        <span class="brand__badge">{{ roomId }}</span>
      </p>
    </header>

    <p v-if="errorMessage" class="error-banner">{{ errorMessage }}</p>

    <article v-if="question" class="play-card">
      <header class="play-card__header">
        <span class="play-card__badge">Pregunta {{ question.indexDisplay }}</span>
        <span class="play-card__status" :class="status">{{ statusLabel }}</span>
      </header>

      <div class="prompt">
        <h2>{{ question.question }}</h2>
      </div>

      <footer v-if="question.total > 0" class="progress" aria-label="Progres de preguntes">
        <button class="progress__button progress__button--back" type="button" disabled>
          <span aria-hidden="true">&lt;</span>
        </button>
        <ol class="progress__steps">
          <li v-for="item in progressSteps" :key="item.qId" class="progress__item">
            <button
              type="button"
              class="progress__step"
              :class="{
                'progress__step--current': item.step === question.indexDisplay,
                'progress__step--answered': item.answered && item.step !== question.indexDisplay,
              }"
              :disabled="item.answered && item.step !== question.indexDisplay"
              :aria-pressed="item.step === question.indexDisplay"
              @click="handleSelectStep(item)"
            >
              {{ item.step }}
            </button>
          </li>
        </ol>
        <button class="progress__button progress__button--forward" type="button" disabled>
          <span aria-hidden="true">&gt;</span>
        </button>
      </footer>

      <form class="answer-zones" @submit.prevent="handleSubmit">
        <template v-if="question.type === 'text'">
          <label class="answer-field">
            <span class="answer-field__label">Introdueix la resposta</span>
            <input v-model="textAnswer" type="text" placeholder="Escriu la resposta" required />
          </label>
        </template>

        <template v-else-if="question.type === 'boolean'">
          <button
            v-for="option in booleanOptions"
            :key="option.value"
            type="button"
            class="answer-pill"
            :class="{ 'answer-pill--selected': booleanAnswer === option.value }"
            @click="booleanAnswer = option.value"
          >
            <span class="answer-pill__prefix">{{ option.prefix }}.</span>
            <span class="answer-pill__label">{{ option.label }}</span>
          </button>
        </template>

        <template v-else>
          <button
            v-for="(option, index) in question.options ?? []"
            :key="`${option}-${index}`"
            type="button"
            class="answer-pill"
            :class="{ 'answer-pill--selected': choiceAnswer === option }"
            @click="choiceAnswer = option"
          >
            <span class="answer-pill__prefix"
              >{{ answerPrefixes[index] ?? String.fromCharCode(97 + index) }}.</span
            >
            <span class="answer-pill__label">{{ option }}</span>
          </button>
        </template>

        <button class="submit" type="submit">Enviar resposta</button>
      </form>

      <p v-if="lastAnswerStatus" :class="['feedback', lastAnswerStatus]">
        {{ lastAnswerStatus === 'correct' ? 'Resposta correcta!' : 'Resposta incorrecta' }}
      </p>
    </article>

    <article v-else class="waiting-card">
      <p v-if="status === 'waiting'">Esperant que el professorat comenci el quiz...</p>
      <p v-else>Has completat el quiz. Bona feina!</p>
    </article>
  </section>
  <section v-else class="missing" style="grid-column: 1 / -1">
    <p>Cap sala seleccionada. Torna enrere per unir-te.</p>
    <RouterLink class="back" to="/join">Tornar a unir-me</RouterLink>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useStudentSessionStore } from '@/modules/student/stores/session.store'

const router = useRouter()
const route = useRoute()
const studentStore = useStudentSessionStore()

const roomId = computed(() => (route.params.roomId as string) ?? studentStore.roomId)
const question = computed(() => {
  const current = studentStore.currentQuestion
  if (!current) return null
  const indexDisplay = (studentStore.currentIndex ?? 0) + 1
  const total = studentStore.questions.length
  return {
    ...current,
    indexDisplay,
    total,
  }
})
const status = computed(() => studentStore.status)
const statusLabel = computed(() => {
  switch (studentStore.status) {
    case 'waiting':
      return 'Esperant'
    case 'playing':
      return 'En curs'
    case 'completed':
      return 'Completat'
    default:
      return 'Sense sessio'
  }
})
const lastAnswerStatus = computed(() => studentStore.lastAnswerStatus)
const errorMessage = computed(() => studentStore.error)
interface ProgressStep {
  step: number
  qId: string
  answered: boolean
}

const progressSteps = computed<ProgressStep[]>(() =>
  studentStore.questions.map((item, index) => {
    const qIdStr = String(item.qId)
    return {
      step: index + 1,
      qId: qIdStr,
      answered: studentStore.answeredQuestions.includes(qIdStr),
    }
  })
)

const booleanOptions = [
  { value: 'true' as const, prefix: 'A', label: 'Cert' },
  { value: 'false' as const, prefix: 'B', label: 'Fals' },
]
const answerPrefixes = ['a', 'b', 'c', 'd', 'e', 'f']

const textAnswer = ref('')
const booleanAnswer = ref<'true' | 'false' | ''>('')
const choiceAnswer = ref('')

const resetLocalAnswer = () => {
  textAnswer.value = ''
  booleanAnswer.value = ''
  choiceAnswer.value = ''
}

watch(question, () => {
  resetLocalAnswer()
})

onMounted(() => {
  studentStore.ensureSocket()
  if (!roomId.value || !studentStore.userName) {
    router.replace({ name: 'join' })
  }
})

const resolveAnswer = () => {
  if (!question.value) return ''
  if (question.value.type === 'text') return textAnswer.value.trim()
  if (question.value.type === 'boolean') return booleanAnswer.value
  return choiceAnswer.value
}

const handleSubmit = () => {
  const answer = resolveAnswer()
  if (!answer) return
  studentStore.submitAnswer(answer)
}

const handleSelectStep = (item: ProgressStep) => {
  if (!question.value) return
  if (item.step === question.value.indexDisplay) return
  if (item.answered && String(question.value.qId) !== item.qId) return
  const previousIndex = studentStore.currentIndex
  studentStore.goToQuestion(item.step - 1)
  if (studentStore.currentIndex !== previousIndex) {
    studentStore.lastAnswerStatus = null
  }
}
studentStore.lastAnswerStatus = null

// Redirecció immediata a resultats quan la sessió acaba
watch(
  () => studentStore.status,
  (newStatus) => {
    if (newStatus === 'finished') {
      router.replace({ name: 'result', params: { roomId: studentStore.roomId } })
    }
  }
)
</script>

<style scoped>
.play-view {
  min-height: 100vh;
  padding: clamp(2.2rem, 6vw, 3rem) clamp(1.5rem, 6vw, 4rem);
  /* removed decorative blue/purple background so the view appears neutral */
  background: radial-gradient(
    185% 120% at 50% 10%,
    #60a5fa 0%,
    #3b82f6 22%,
    #2563eb 40%,
    #1d4ed8 70%
  );
  color: var(--color-text);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 4vw, 2.5rem);
  align-items: center;
  justify-content: center;
}

.decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
  /* hide the decorative shapes for a cleaner centered layout */
  display: none;
}

.shape {
  position: absolute;
  display: block;
  border-radius: 50%;
  opacity: 0.85;
}

.shape--dot {
  width: clamp(14px, 3vw, 24px);
  height: clamp(14px, 3vw, 24px);
}

.shape--dot-green {
  background: #22c55e;
  top: clamp(2rem, 12vw, 5rem);
  right: clamp(2rem, 12vw, 6rem);
}

.shape--dot-orange {
  background: #f97316;
  bottom: clamp(3rem, 12vw, 8rem);
  right: clamp(1.5rem, 8vw, 4rem);
}

.shape--spark {
  width: clamp(20px, 4vw, 32px);
  height: clamp(20px, 4vw, 32px);
  border-radius: 0;
  border: 3px solid #ffffff;
  transform: rotate(45deg);
  left: clamp(3rem, 14vw, 10rem);
  top: clamp(4rem, 14vw, 10rem);
  opacity: 0.6;
}

.shape--bubble {
  width: clamp(60px, 15vw, 110px);
  height: clamp(60px, 15vw, 110px);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  left: clamp(1.5rem, 10vw, 6rem);
  bottom: clamp(2rem, 10vw, 6rem);
}

.brand {
  position: relative;
  z-index: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.brand__title {
  margin: 0;
  font-size: clamp(3.2rem, 10vw, 4.4rem);
  font-weight: 700;
  letter-spacing: 0.04em;
}

.brand__meta {
  margin: 0;
  font-size: clamp(0.95rem, 3vw, 1.2rem);
  color: rgba(248, 250, 252, 0.85);
}

.brand__label {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-right: 0.4rem;
}

.brand__badge {
  background: rgba(255, 255, 255, 0.16);
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-weight: 600;
  color: #ffffff;
}

.error-banner {
  position: relative;
  z-index: 1;
  background: rgba(248, 113, 113, 0.95);
  border-radius: clamp(1.2rem, 4vw, 1.6rem);
  padding: 0.75rem 1.4rem;
  font-weight: 600;
  color: #0f172a;
}

.play-card {
  position: relative;
  z-index: 1;
  width: min(900px, 100%);
  background: rgba(255, 255, 255, 0.96);
  border-radius: clamp(2rem, 5vw, 2.6rem);
  padding: clamp(1.8rem, 5vw, 2.6rem);
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.3);
  display: flex;
  flex-direction: column;
  gap: clamp(1.2rem, 4vw, 1.8rem);
  color: #0f172a;
}

.play-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.play-card__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.15);
  color: #1d4ed8;
  font-weight: 600;
}

.play-card__status {
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.18);
  color: #1d4ed8;
  font-weight: 600;
}

.play-card__status.waiting {
  background: rgba(234, 179, 8, 0.2);
  color: #b45309;
}

.play-card__status.completed {
  background: rgba(22, 163, 74, 0.2);
  color: #15803d;
}

.prompt h2 {
  margin: 0;
  font-size: clamp(1.8rem, 4.5vw, 2.5rem);
  text-align: center;
  color: #0f172a;
}

.progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.75rem, 2vw, 1.25rem);
}

.progress__button {
  border: none;
  background: rgba(37, 99, 235, 0.25);
  color: #1d4ed8;
  width: clamp(44px, 8vw, 52px);
  height: clamp(44px, 8vw, 52px);
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: clamp(1.2rem, 3vw, 1.4rem);
  cursor: not-allowed;
}

.progress__steps {
  list-style: none;
  display: flex;
  gap: clamp(0.4rem, 1.5vw, 0.75rem);
  padding: 0;
  margin: 0;
}

.progress__item {
  margin: 0;
}

.progress__step {
  width: clamp(42px, 7vw, 48px);
  height: clamp(42px, 7vw, 48px);
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(30, 64, 175, 0.85);
  color: #f8fafc;
  font-weight: 600;
  font-size: clamp(1rem, 3vw, 1.2rem);
  border: none;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.progress__step:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.25);
}

.progress__step--current {
  background: #22c55e;
  color: #ffffff;
  cursor: default;
  box-shadow: 0 12px 28px rgba(34, 197, 94, 0.35);
}

.progress__step--answered {
  background: rgba(148, 163, 184, 0.35);
  color: rgba(15, 23, 42, 0.65);
}

.progress__step:disabled {
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
  opacity: 0.7;
}

.answer-zones {
  display: grid;
  gap: clamp(0.8rem, 2.2vw, 1.1rem);
}

.answer-field {
  display: grid;
  gap: 0.45rem;
}

.answer-field__label {
  font-weight: 600;
  color: #334155;
}

.answer-field input {
  border-radius: 18px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  padding: 0.85rem 1rem;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.answer-field input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.25);
}

.answer-pill {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: none;
  border-radius: clamp(1rem, 3vw, 1.4rem);
  padding: clamp(0.8rem, 2.2vw, 1rem) clamp(1rem, 3vw, 1.4rem);
  background: rgba(248, 250, 252, 0.95);
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  text-align: left;
}

.answer-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 32px rgba(15, 23, 42, 0.2);
}

.answer-pill__prefix {
  text-transform: uppercase;
  font-weight: 700;
}

.answer-pill--selected {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #ffffff;
  box-shadow: 0 22px 45px rgba(34, 197, 94, 0.35);
}

.submit {
  justify-self: center;
  margin-top: clamp(0.4rem, 1vw, 0.7rem);
  border: none;
  border-radius: 999px;
  padding: 0.85rem 1.9rem;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 36px rgba(79, 70, 229, 0.35);
}

.feedback {
  margin: 0;
  text-align: center;
  font-weight: 600;
}

.feedback.correct {
  color: #16a34a;
}

.feedback.incorrect {
  color: #dc2626;
}

.waiting-card {
  position: relative;
  z-index: 1;
  width: min(720px, 100%);
  background: rgba(255, 255, 255, 0.96);
  border-radius: clamp(1.8rem, 4vw, 2.4rem);
  padding: clamp(2rem, 5vw, 2.6rem);
  box-shadow: 0 25px 55px rgba(15, 23, 42, 0.3);
  text-align: center;
  color: #0f172a;
  font-size: clamp(1.1rem, 3.5vw, 1.3rem);
}

.missing {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
  color: #334155;
  text-align: center;
  padding: 2rem;
}

.missing .back {
  display: inline-block;
  margin-top: 1rem;
  text-decoration: none;
  font-weight: 600;
  color: #1d4ed8;
}

@media (max-width: 640px) {
  .progress__button {
    display: none;
  }

  .progress__steps {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .answer-pill {
    gap: 0.5rem;
  }
}
</style>
