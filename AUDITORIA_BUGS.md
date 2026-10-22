# 🛡️ CATÁLOGO FORENSE DE DEFECTOS — FOOTBALL LEGENDS (AUDITORIA_BUGS.md)

Este documento registra los hallazgos técnicos, condiciones de reproducción, causas raíz identificadas y el estado de verificación de cada defecto en el motor de juego de **FOOTBALL LEGENDS**.

---

## 1. Clasificación de Severidad

- **P0**: Bloqueo total, pérdida de control, bucles infinitos o corrupción de estado.
- **P1**: Defectos que rompen goles, posesión compartida, colisiones, reinicios o reglas esenciales.
- **P2**: Defectos importantes de IA, balance, controles o transiciones de máquina de estados.
- **P3**: Problemas visuales menores, ajustes de ergonomía y mejoras no esenciales.

---

## 2. Inventario de Defectos y Estado de Resolución

### 🔴 [P1-PHYS-001] Separación Física en Punto Cero (Jugadores Trabados)
- **Subsistema afectado:** Físicas y Colisiones (`src/game/CollisionSystem.js`).
- **Comportamiento observado:** Cuando dos jugadores disputaban el balón y quedaban a distancia 0, el vector de normalización daba `NaN` o división por cero, provocando que Batman y Robin o compañeros quedaran congelados en el mismo píxel.
- **Causa raíz:** `separatePlayers` no manejaba distancias `< 0.001`, saltándose la separación y dejando las posiciones solapadas.
- **Corrección aplicada:** Inserción de perturbación infinitesimal determinista y adición de vector de impulso repulsivo `repelForce` (1.2px) que despega activamente a los dos atletas.
- **Prueba de verificación:** `tests/match.test.js` y simulación de colisión frontal.
- **Estado:** ✅ **RESUELTO**.

---

### 🔴 [P1-RULE-002] Multi-Disparo de Eventos Fuera del Estado PLAYING
- **Subsistema afectado:** Ciclo del Partido (`src/game/Match.js`).
- **Comportamiento observado:** Durante el estado de falta o gol (`stateTimer > 0`), comprobaciones secundarias de arquero o límites podían sobreescribir el evento actual reiniciando estados concurrentes.
- **Causa raíz:** Falta de guarda estricta `if (this.state === GAME_STATES.PLAYING)` antes de invocar `MatchRules.checkGoal` y `MatchRules.checkOutOfBounds`.
- **Corrección aplicada:** Agrupación estricta de detección de reglas y atajadas exclusivamente dentro del estado `GAME_STATES.PLAYING` con salidas tempranas `return`.
- **Prueba de verificación:** `tests/match.test.js` (20 pruebas unitarias totales).
- **Estado:** ✅ **RESUELTO**.

---

### 🟡 [P2-AI-003] Efecto Enjambre en Dificultad Difícil (Desprotección del Arco)
- **Subsistema afectado:** Inteligencia Artificial (`src/game/PlayerAI.js`).
- **Comportamiento observado:** Al activar dificultad difícil, todos los futbolistas del equipo contrario salían corriendo simultáneamente detrás del balón, permitiendo que el usuario avanzara en línea recta y anotara 20 goles seguidos sin oposición.
- **Causa raíz:** Regla de presión permisiva `(isDesignatedPresser || (difficulty === HARD && minBallDist < 250))` que activaba múltiples marcadores a la vez y sacaba al defensor central de su retaguardia.
- **Corrección aplicada:** Restricción a un **único jugador asignado (single presser)** para presionar. El defensor central (DEF) se planta en cobertura posicional frente a la portería para bloquear tiros frontales.
- **Prueba de verificación:** Verificación táctica de cobertura y `npm run test`.
- **Estado:** ✅ **RESUELTO**.

---

### 🟡 [P2-PHYS-004] Escape de Jugadores Fuera del Terreno de Juego
- **Subsistema afectado:** Movimiento de Jugadores (`src/game/Player.js`).
- **Comportamiento observado:** Jugadores podían correr fuera de la cancha hacia la zona de graderías debido a que el `clamp` utilizaba el tamaño total del canvas (`pitchWidth` = 1040) en lugar de las líneas de demarcación (`fieldLeft` = 60, `fieldRight` = 980).
- **Causa raíz:** Desconexión entre los márgenes visuales del campo y los límites físicos en la clase `Player`.
- **Corrección aplicada:** `clamp` estricto en `Player.update` con respecto a las líneas de cal reglamentarias (excepto el portero en su arco).
- **Prueba de verificación:** Límites verificados en `Player.update`.
- **Estado:** ✅ **RESUELTO**.

---

### 🟡 [P2-MOB-005] Pantalla y Orientación en Teléfonos Móviles
- **Subsistema afectado:** Interfaz Móvil (`src/ui/MatchScreen.js`, `src/styles/game.css`).
- **Comportamiento observado:** En celulares el juego se mostraba recortado ("mocho") en vertical y los botones táctiles aparecían en PC.
- **Causa raíz:** Ausencia de bloqueo de orientación horizontal, `object-fit` no adaptativo y falta de media queries `pointer: coarse`.
- **Corrección aplicada:** Detección de dispositivo táctil, ocultación 100% de botones en PC, aviso modal de rotación de teléfono y canvas a pantalla completa horizontal.
- **Estado:** ✅ **RESUELTO**.

---

## 3. Resumen de Calidad de la Suite

- **Total de pruebas automatizadas:** 20 pruebas (Vitest).
- **Fallos activos:** 0.
- **Compilación de producción (Vite):** Exit Code 0 (Exitosa).
- **Sincronización:** Rama `main` en GitHub (`origin/main`).
