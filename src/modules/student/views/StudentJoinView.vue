<template>
  <section class="join-view w-screen">
    <form class="card" @submit.prevent="handleSubmit">
      <h1>Unir-me a una sala</h1>
      s
      <p>Introdueix el codi de la sala i el teu nom per participar-hi.</p>

      <label>
        <span>Codi de sala</span>
        <input v-model="roomId" type="text" placeholder="Ex. ABCD" required />
      </label>

      <label>
        <span>Nom d'usuari</span>
        <input v-model="userName" type="text" placeholder="El teu nom" required />
      </label>

      <button type="submit" class="primary">Unir-me</button>

      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useStudentSessionStore } from '@/modules/student/stores/session.store'

const router = useRouter()
const studentStore = useStudentSessionStore()

const roomId = ref('')
const userName = ref('')
const error = computed(() => studentStore.error)

const handleSubmit = () => {
  if (!roomId.value || !userName.value) return
  const room = roomId.value.trim().toUpperCase()
  const user = userName.value.trim()
  studentStore.joinClassroom(room, user)
  router.push({ name: 'student-play', params: { roomId: room } })
}
</script>

<style scoped>
.join-view {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem 1rem;
}

.card {
  width: min(460px, 100%);
  background: white;
  padding: clamp(2rem, 5vw, 2.75rem);
  border-radius: 28px;
  box-shadow: 0 25px 55px rgba(15, 23, 42, 0.15);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.card h1 {
  margin: 0;
  font-size: clamp(1.9rem, 4vw, 2.4rem);
  color: #4c1d95;
}

.card p {
  margin: 0;
  color: #475569;
  line-height: 1.5;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  font-weight: 600;
  color: #334155;
}

input {
  border-radius: 14px;
  border: 1px solid #cbd5f5;
  padding: 0.85rem 1rem;
  font-size: 1rem;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #4c1d95;
  box-shadow: 0 0 0 4px rgba(76, 29, 149, 0.2);
}

.primary {
  margin-top: 0.5rem;
  border: none;
  border-radius: 999px;
  padding: 0.85rem 1.6rem;
  background: linear-gradient(135deg, #1d4ed8, #2563eb);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 30px rgba(37, 99, 235, 0.25);
}

.error {
  margin: 0;
  color: #dc2626;
  font-weight: 600;
}
</style>
