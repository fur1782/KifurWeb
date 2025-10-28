<template>
  <section v-if="roomId" class="play-view">
    <header class="top">
      <div>
        <p class="label">Sala</p>
        <h1>{{ roomId }}</h1>
      </div>
      <div class="status-pill" :class="status">
        {{ statusLabel }}
      </div>
    </header>

    <article v-if="question" class="question-card">
      <h2>{{ question.question }}</h2>
      <form class="answer-form" @submit.prevent="handleSubmit">
        <template v-if="question.type === 'text'">
          <input v-model="textAnswer" type="text" placeholder="Escriu la teva resposta" required />
        </template>
        <template v-else-if="question.type === 'boolean'">
          <div class="option" :class="{ selected: booleanAnswer === 'true' }" @click="booleanAnswer = 'true'">True</div>
          <div class="option" :class="{ selected: booleanAnswer === 'false' }" @click="booleanAnswer = 'false'">
            False
          </div>
        </template>
        <template v-else>
          <div
            v-for="option in question.options ?? []"
            :key="option"
            class="option"
            :class="{ selected: choiceAnswer === option }"
            @click="choiceAnswer = option"
          >
            {{ option }}
          </div>
        </template>

        <button class="primary" type="submit">Enviar resposta</button>
      </form>

      <p v-if="lastAnswerStatus" :class="['feedback', lastAnswerStatus]">
        {{ lastAnswerStatus === 'correct' ? 'Resposta correcta!' : 'Resposta incorrecta' }}
      </p>
    </article>

    <article v-else class="waiting">
      <p v-if="status === 'waiting'">Esperant que el professorat iniciï el quiz…</p>
      <p v-else>Has completat el quiz. Bona feina!</p>
    </article>

    <aside class="scoreboard">
      <h3>Classificació</h3>
      <ol>
        <li v-for="user in sortedUserPool" :key="user.userId">
          <span>{{ user.username }}</span>
          <span>{{ user.puntuation }} pts</span>
        </li>
        <li v-if="!sortedUserPool.length" class="empty">Encara no hi ha puntuacions.</li>
      </ol>
    </aside>
  </section>
  <section v-else class="missing">
    <p>Cap sala seleccionada. Torna enrere per unir-te.</p>
    <RouterLink class="back" to="/join">Tornar a unir-me</RouterLink>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useStudentSessionStore } from '@/modules/student/stores/session.store';

const router = useRouter();
const route = useRoute();
const studentStore = useStudentSessionStore();

const roomId = computed(() => (route.params.roomId as string) ?? studentStore.roomId);
const question = computed(() => studentStore.currentQuestion);
const status = computed(() => studentStore.status);
const statusLabel = computed(() => {
  switch (studentStore.status) {
    case 'waiting':
      return 'Esperant';
    case 'playing':
      return 'En curs';
    case 'completed':
      return 'Completat';
    default:
      return 'Sense sessió';
  }
});
const sortedUserPool = computed(() =>
  [...studentStore.userPool].sort((a, b) => b.puntuation - a.puntuation),
);
const lastAnswerStatus = computed(() => studentStore.lastAnswerStatus);

const textAnswer = ref('');
const booleanAnswer = ref<'true' | 'false' | ''>('');
const choiceAnswer = ref('');

const resetLocalAnswer = () => {
  textAnswer.value = '';
  booleanAnswer.value = '';
  choiceAnswer.value = '';
};

watch(question, () => {
  resetLocalAnswer();
});

onMounted(() => {
  studentStore.ensureSocket();
  if (!roomId.value || !studentStore.userName) {
    router.replace({ name: 'join' });
  }
});

const resolveAnswer = () => {
  if (!question.value) return '';
  if (question.value.type === 'text') return textAnswer.value.trim();
  if (question.value.type === 'boolean') return booleanAnswer.value;
  return choiceAnswer.value;
};

const handleSubmit = () => {
  const answer = resolveAnswer();
  if (!answer) return;
  studentStore.submitAnswer(answer);
};
</script>

<style scoped>
.play-view {
  min-height: 100vh;
  display: grid;
  gap: 1.75rem;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
  padding: clamp(2rem, 5vw, 3rem);
  color: #0f172a;
}

.top {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: clamp(1.5rem, 4vw, 2.4rem);
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
}

.label {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.8rem;
  color: #64748b;
}

.top h1 {
  margin: 0.3rem 0 0;
  font-size: clamp(2.2rem, 5vw, 3rem);
  color: #1d4ed8;
}

.status-pill {
  padding: 0.55rem 1.25rem;
  border-radius: 999px;
  font-weight: 600;
  color: white;
}

.status-pill.waiting {
  background: #f59e0b;
}

.status-pill.playing {
  background: #22c55e;
}

.status-pill.completed {
  background: #6366f1;
}

.question-card {
  background: white;
  border-radius: 24px;
  padding: clamp(1.8rem, 4vw, 2.6rem);
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.12);
}

.question-card h2 {
  margin-top: 0;
  color: #111827;
}

.answer-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.answer-form input {
  border-radius: 14px;
  border: 1px solid #cbd5f5;
  padding: 0.9rem 1rem;
  font-size: 1rem;
}

.answer-form input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
}

.option {
  background: rgba(241, 245, 249, 0.9);
  border-radius: 16px;
  padding: 0.9rem 1rem;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.option:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 25px rgba(15, 23, 42, 0.12);
}

.option.selected {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
}

.primary {
  align-self: flex-start;
  border: none;
  border-radius: 999px;
  padding: 0.8rem 1.6rem;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 30px rgba(37, 99, 235, 0.25);
}

.feedback {
  margin-top: 1rem;
  font-weight: 600;
}

.feedback.correct {
  color: #16a34a;
}

.feedback.incorrect {
  color: #dc2626;
}

.waiting,
.missing {
  background: white;
  border-radius: 24px;
  padding: clamp(2rem, 4vw, 2.75rem);
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.12);
  text-align: center;
  display: grid;
  place-items: center;
}

.scoreboard {
  background: white;
  border-radius: 24px;
  padding: clamp(1.5rem, 4vw, 2.3rem);
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.12);
  height: fit-content;
}

.scoreboard h3 {
  margin-top: 0;
  color: #4338ca;
}

.scoreboard ol {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.scoreboard li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(241, 245, 249, 0.85);
  padding: 0.85rem 1rem;
  border-radius: 16px;
}

.scoreboard li.empty {
  justify-content: center;
  color: #64748b;
  font-style: italic;
}

.missing .back {
  display: inline-block;
  margin-top: 1rem;
  text-decoration: none;
  font-weight: 600;
  color: #1d4ed8;
}

@media (max-width: 900px) {
  .play-view {
    grid-template-columns: 1fr;
  }

  .scoreboard {
    order: -1;
  }
}
</style>
