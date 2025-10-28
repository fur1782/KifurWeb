<template>
  <div class="home-container">
    <!-- Formas animadas -->
    <div class="shapes">
      <div class="shape circle"></div>
      <div class="shape circle small"></div>
      <div class="shape plus"></div>
      <div class="shape triangle"></div>
      <div class="shape circle medium"></div>
    </div>

    <!-- Contenido principal -->
    <div class="content">
      <div class="logo">
        <div class="icon">?</div>
        <h1 class="title">QuiFur</h1>
        <div class="icondos">!</div>
      </div>
      <div class="buttons">
        <RouterLink to="/join" class="btn join">Join</RouterLink>
        <RouterLink to="/create" class="btn create">Create</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
/* Fondo principal */
.home-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #5E2B97;
  position: relative;
  overflow: hidden;
  transform: translateZ(0);
}

/* CONTENIDO CENTRAL */
.content {
  text-align: center;
  position: relative;
  z-index: 2;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin-bottom: 2rem;
}

.icon {
  background-color: #1be2e9;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 0.4rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
}

.icondos {
  background-color: #1be2e9;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 0.4rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.btn {
  padding: 0.8rem 2rem;
  border-radius: 0.6rem;
  font-size: 1.2rem;
  font-weight: 600;
  text-decoration: none;
  color: white;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.btn:hover {
  transform: scale(1.05);
  opacity: 0.9;
}

.join {
  background-color: #22c55e;
}

.create {
  background-color: #ff8c32;
}

/* FORMAS DE FONDO */
.shapes {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 1;
  will-change: transform;
}

.shape {
  position: absolute;
  opacity: 0.15;
  animation: float 12s infinite ease-in-out alternate;
  will-change: transform;
  transform-origin: center;
}

/* CÍRCULOS */
.circle {
  width: 120px;
  height: 120px;
  background: #ff02cc;
  border-radius: 50%;
  top: 10%;
  left: 26%;
  animation-delay: 0s;
}

.circle.small {
  width: 60px;
  height: 60px;
  background: #00eaff;
  top: 70%;
  left: 15%;
  animation-delay: 5s;
}

.circle.medium {
  width: 90px;
  height: 90px;
  background: #50045b;
  top: 50%;
  left: 65%;
  animation-delay: 2s;
}

/* TRIÁNGULO */
.triangle {
  width: 0;
  height: 0;
  border-left: 40px solid transparent;
  border-right: 40px solid transparent;
  border-bottom: 70px solid #ff7c17;
  top: 27%;
  left: 60%;
  opacity: 0.3;
  animation: rotate 20s linear infinite;
}

/* CRUZ (+) ULTRA-DESCARADA */
.plus {
  width: 50px;
  height: 50px;
  background: transparent;
  top: 80%;
  left: 50%;
  opacity: 0.35;
  animation: plusPulse 4s infinite ease-in-out;
}

.plus::before,
.plus::after {
  content: "";
  position: absolute;
  background: #00ff88;
  border-radius: 2px;
}

.plus::before {
  width: 100%;
  height: 5px;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  animation: horizontalPulse 5s infinite ease-in-out;
}

.plus::after {
  width: 5px;
  height: 100%;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  animation: verticalFollow 5s infinite ease-in-out;
}

/* ANIMACIONES */
@keyframes float {
  0% { transform: translateY(0px) translateX(0px) scale(1); }
  50% { transform: translateY(-40px) translateX(20px) scale(1.05); }
  100% { transform: translateY(40px) translateX(-20px) scale(0.95); }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes plusPulse {
  0%, 100% { transform: scale(1) translateX(0); }
  25% { transform: scale(1.8) translateX(-10%); }
  50% { transform: scale(2) translateX(10%); }
  75% { transform: scale(1.7) translateX(-10%); }
}

@keyframes horizontalPulse {
  0%, 100% { width: 100%; left: 0; }
  25% { width: 190%; left: -10%; }
  50% { width: 210%; left: -5%; }
  75% { width: 180%; left: -8%; }
}

@keyframes verticalFollow {
  0%, 100% { left: 50%; }
  10% { left: 60%; }
  30% { left: 40%; }
  50% { left: 75%; }
  70% { left: 35%; }
  90% { left: 65%; }
}
</style>
