# FOOTBALL LEGENDS — PLAN DE IMPLEMENTACIÓN: FASE 4 (SUSTITUCIONES Y GESTIÓN DE PLANTILLA)

## 1. AUDITORÍA DEL ESTADO ACTUAL DE PLANTILLA Y EQUIPO

### A. Estructura de Datos de Equipos (`src/data/teams.js`):
- Cada equipo en `DEFAULT_TEAMS` contiene exactamente 5 futbolistas:
  - 1 Portero (`GK`)
  - 1 Defensor (`DEF`)
  - 1 o 2 Mediocampistas (`MID`)
  - 1 o 2 Delanteros (`FWD`)
- **Oportunidad de Evolución**: Para contar con suplentes reales, cada equipo debe contar con un banquillo de 3 a 5 jugadores adicionales (un portero suplente, un defensor, un centrocampista y un delantero).

### B. Arquitectura de `Team.js`:
- Actualmente, `Team.initializePlayers` corta la lista a los primeros 5: `this.players = rawPlayers.slice(0, 5)`.
- No existe el concepto explícito de `this.substitutes` (banquillo) ni de `this.startingLineup`.
- **Evolución Limpia y No Disruptiva**:
  - `this.players`: Mantener como el array de los 5 jugadores activos en cancha (preserva compatibilidad al 100% con `Match.js`, `CollisionSystem.js`, rendering, loop del juego y PlayerAI).
  - `this.bench`: Array de instancias de `Player` o datos de suplentes disponibles en el banquillo.
  - `this.substitutionsRemaining`: Contador de sustituciones (reglamentario, por ejemplo 3 cambios por partido).
  - `this.substitutionsMade`: Historial o contador de cambios realizados.

### C. Mecánica de la Sustitución (`substitutePlayer(outPlayerId, inPlayerId)`):
1. Verificar que el partido esté detenido o en pausa (`state === GAME_STATES.PAUSED` o saque detenido).
2. Validar que queden sustituciones disponibles (`substitutionsRemaining > 0`).
3. Validar que el jugador entrante esté en el banquillo y que el saliente esté en el campo.
4. Heredar las coordenadas espaciales `(x, y, homeX, homeY, facingX, facingY)` del jugador saliente al entrante para evitar teletransportaciones o desajustes de formación.
5. El jugador que ingresa entra con su resistencia completa (`currentStamina = 100`), premiando la gestión táctica.
6. El jugador saliente pasa al banquillo con su fatiga acumulada y ya no puede reingresar.
7. Si el jugador saliente era el controlado por el usuario (`userControlledPlayer`), transferir el control (`isControlled = true`) inmediatamente al nuevo ingresante.
8. Si el jugador saliente poseía el balón, transferir el balón limpiamente al jugador ingresante sin soltarlo ni dejarlo en un estado corrupto.

### D. Interfaz Gráfica de Sustituciones y Táctica (`MatchScreen.js` / Modal de Pausa):
- En el modal de pausa, agregar un botón y pestaña de **"⚙️ Táctica y Sustituciones"**.
- Selector de formación: cambiar entre `4-3-3`, `4-4-2`, y `3-5-2` en tiempo real.
- Panel de alineación visual:
  - Lista de los 5 titulares con su barra de estamina coloreada (verde si > 70%, amarilla si > 40%, roja si < 40%).
  - Lista del banquillo disponible con sus estadísticas (Velocidad, Tiro, Pase, Defensa, Media).
  - Botón interactivo "Hacer Cambio" (seleccionar saliente y entrante con feedback inmediato).
  - Contador claro: *"Sustituciones restantes: X/3"*.

---

## 2. REGLAMENTO Y SEGURIDAD ANTIDUPLICADOS
- Ningún jugador puede estar en la cancha y en el banquillo al mismo tiempo.
- El ID del jugador entrante debe ser único en el terreno de juego.
- Si se alcanza el límite de cambios (3), se bloquea la acción.
- El arquero puede ser sustituido por el arquero suplente respetando la posición `GK`.
