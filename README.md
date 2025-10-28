# Kifur Web

Client web en Vue 3 per a la plataforma de qüestionaris **Kifur**. Consumeix l'API Node/Socket.IO (veure repositori kifur) per gestionar quizzes, iniciar partides i permetre que l'alumnat respongui en temps real.

## Requisits

- Node.js ≥ 18
- API de Kifur en funcionament (
  pm run dev dins del repositori del backend)

## Instal·lació

`bash
npm install
cp .env.example .env
`

Actualitza les variables d'entorn segons el teu backend:

- VITE_API_BASE_URL: URL base de l'API REST (p. ex. http://localhost:3000)
- VITE_SOCKET_URL: URL del servidor de sockets
- VITE_SOCKET_TOKEN: token que coincideixi amb SOCKET_ACCESS_TOKEN del backend

## Scripts

`bash
npm run dev        # arrenca el client en mode desenvolupament
npm run build      # genera la versió per producció
npm run preview    # serveix la build en local
npm run type-check # comprova els tipus amb vue-tsc
`

## Arquitectura

- src/modules/home — landing actual (no modificada).
- src/modules/teacher — gestió de quizzes i sala en directe (llistat, inici de sala, monitorització).
- src/modules/student — formulari d'accés i visualització/resposta de preguntes en temps real.
- src/api — clients compartits (axios + socket.io-client).
- src/router — rutes principals (/, /join, /play/:roomId, /create, /session/:roomId).
- src/assets — estils globals (base del projecte Vite).

## Flux principal

1. **Professor/a** accedeix a /create, selecciona un quiz i obre una sala. Automàticament es crea el codi i es pot monitoritzar a /session/:roomId.
2. **Alumnat** entra a /join, introdueix el codi i el seu nom. Quan el professorat inicia el quiz, apareixen les preguntes en temps real i es poden enviar respostes.
3. Tant professorat com alumnat reben actualitzacions via WebSocket (user-joined, quiz-started, update-puntuation). El client mostra la classificació i el valor de cada pregunta.

## Notes

- No s'ha modificat l'estil del HomeView.vue; les pàgines noves fan servir el seu propi layout.
- Si canvies el token de sockets al backend, recorda actualitzar VITE_SOCKET_TOKEN i reiniciar el client (
  pm run dev).
- El projecte utilitza Pinia per gestionar l'estat de les sessions i mantenir la connexió amb Socket.IO.
