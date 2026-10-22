# FOOTBALL LEGENDS — AUDITORÍA FORENSE DE IA TÁCTICA AVANZADA (FASE 3)

## 1. ESTADO BASE DEL PROYECTO
- **Rama activa**: `main`
- **Commit base verificado**: `a6a4446` (*fix: conexion integral del torneo Leyendas Cup con resultados, penales, fatiga reactiva y navegacion de llaves*)
- **Estado de tests iniciales**: 25/25 tests aprobados en Vitest (`standings`, `tournament`, `schedule`, `statistics`, `match`, `persistence`).
- **Estado de compilación Vite**: 100% exitosa sin errores de bundle.

---

## 2. DIAGNÓSTICO FORENSE DE LA INTELIGENCIA ARTIFICIAL ACTUAL

Al auditar `src/game/PlayerAI.js`, `src/game/Team.js`, `src/game/GoalkeeperAI.js` y `src/game/Match.js`, se detectaron las siguientes limitaciones que impiden que los partidos se sientan con táctica de fútbol real:

### A. Ataque estático y predecible de los compañeros sin balón (Falta de desmarques reales)
- En `PlayerAI.js`, el cálculo cuando el equipo tiene posesión se limitaba a un desplazamiento fijo `targetX = player.homeX + delta` con un `shiftY` puramente vertical hacia el balón.
- **Defecto**: Los extremos y delanteros se estancaban en un punto geométrico rígido en vez de atacar la espalda de los defensores rivales o abrirse a las bandas para recibir un pase en profundidad (desmarque de ruptura).

### B. Criterio de pase rudimentario sin filtrados ni centros al área
- En `Match.js` (`executePass`), la selección del receptor se basaba únicamente en el ángulo de mirada y proximidad (`dot * 2 - dist / PITCH.WIDTH`), lanzando el balón a los pies del compañero (`bestMate.x, bestMate.y`).
- **Defecto**: Si el receptor estaba en carrera hacia el área rival, el pase se le enviaba atrás o al cuerpo, facilitando intercepciones. No existía la noción de pase en profundidad (*through ball*) hacia el espacio libre ni centros al área.

### C. Defensa zonal con nula cobertura de desmarques rivales
- En `PlayerAI.js`, el defensa (`DEF`) solo se ubicaba en un punto fijo entre el arco y el balón (`blockX = ownGoalX + (ball.x - ownGoalX) * 0.35`).
- **Defecto**: Si un delantero rival se desmarcaba o picaba hacia el punto penal, el defensor ignoraba al atacante desmarcado, permitiendo remates en soledad al segundo palo.

### D. IA ajena al contexto del partido (Marcador y Tiempo)
- `PlayerAI.update` recibía parámetros estáticos y no tomaba en cuenta si el equipo iba ganando o perdiendo ni los minutos restantes.
- **Defecto**: Un equipo rival perdiendo por un gol en los últimos segundos jugaba con la misma cadencia pasiva que en el minuto 1, y un equipo ganando no protegía el resultado ni replegaba líneas defensivas.

---

## 3. PLAN DE IMPLEMENTACIÓN — FASE 3

1. **Desmarques de Ruptura y Apoyo en Ataque (`PlayerAI.js`)**:
   - Algoritmo dinámico de desmarque para FWD y MID: si su equipo tiene posesión, calcular carreras en diagonal hacia zonas libres desguarnecidas por la defensa rival.
   - Apertura a las bandas si el carril central está congestionado.

2. **Pases Filtrados al Espacio y Asistencia Ofensiva (`Match.js` & `PlayerAI.js`)**:
   - Cálculo de vector de avance del compañero: enviar el pase 30-55px por delante de la trayectoria de carrera si el receptor está picando.
   - Ponderación de líneas limpias de pase (ausencia de defensores en el cono de trayectoria).

3. **Defensa Táctica y Cobertura de Desmarques (`PlayerAI.js`)**:
   - El defensa central o lateral no solo vigila el balón: si detecta un atacante rival infiltrándose en el área, reduce distancia y cubre su línea de remate (marcaje zonal inteligente).
   - Basculación colectiva de repliegue cuando el equipo pierde la posesión en campo contrario.

4. **Consciencia Contextual del Marcador y Minutos (`Match.js` -> `PlayerAI.js`)**:
   - Inyección de contexto de partido (`matchScore`, `isTrailing`, `isLeading`, `isLateGame`).
   - Táctica de urgencia al ir perdiendo: mayor velocidad de transición, más atacantes pisando el área.
   - Táctica de conservación al ir ganando en los minutos finales: repliegue más compacto y pases seguros.

5. **Suite de Pruebas Automatizadas (`tests/ai_tactics.test.js`)**:
   - Tests específicos que verifiquen desmarques, cobertura de atacantes libres, y pases al espacio.
