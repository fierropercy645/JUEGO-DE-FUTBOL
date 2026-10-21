# FOOTBALL LEGENDS ⚽🏆

Simulador web de fútbol 2D, modular, con partidos en tiempo real, inteligencia artificial reactiva, competición de liga a doble vuelta, estadísticas oficiales y persistencia en LocalStorage.

---

## 1. ¿Qué es FOOTBALL LEGENDS?

**FOOTBALL LEGENDS** es un videojuego de fútbol en 2D desarrollado en HTML5 Canvas y JavaScript ES Modules. Permite disputar partidos rápidos o dirigir a un club a través de una temporada completa de liga de 14 jornadas frente a rivales controlados por IA, con estadísticas verificadas y almacenamiento de progreso en el navegador.

---

## 2. Tecnologías Utilizadas

- **HTML5 & CSS3**: Estructura e interfaz deportiva con paleta moderna, diseño responsive y temas de contraste.
- **JavaScript Moderno (ES6+)**: Arquitectura modular orientada a objetos (POO) con separación estricta de responsabilidades.
- **Canvas 2D**: Renderizado fluido del terreno de juego con franjas de césped, líneas reglamentarias, porterías y dinámicas físicas.
- **Vite**: Entorno de desarrollo ultrarrápido y empaquetador de producción.
- **Vitest**: Suite de pruebas unitarias automatizadas para clasificación, calendario, persistencia, estadísticas y reglas.
- **LocalStorage**: Persistencia versionada para configuraciones, progreso de liga e historial de partidos.

---

## 3. Características Implementadas

1. **Motor de Partido en Tiempo Real**:
   - Perspectiva cenital 2D con adaptación de resolución.
   - Bucle `requestAnimationFrame` con paso temporal seguro (prevención de saltos por inactividad de pestaña).
   - Físicas para el balón (inercia, fricción, rebotes de banda y postes).
   - Movimiento fluido con velocidad diagonal normalizada y aceleración/desaceleración.
   - Pases inteligentes dirigidos a compañeros y disparos con potencia/precisión según atributos del futbolista.
   - Detección precisa de goles: cruce exclusivo dentro del marco de la portería (sin falsos goles por línea de fondo).
   - Sistema de celebraciones de gol y saque de centro reglamentario.
2. **Inteligencia Artificial Diferenciada**:
   - Porteros con posicionamiento dinámico sobre la línea, salidas al balón y desvíos de remates.
   - Comportamientos tácticos: apoyo ofensivo, presión al portador y repliegue defensivo.
   - Tres niveles de dificultad reales (**Fácil**, **Normal**, **Difícil**).
3. **8 Clubes Originales con Plantillas**:
   - Atlético Capital, Deportivo Caribe, Real Montaña, Unión del Pacífico, Sporting Central, Independiente del Norte, Deportivo Aurora y Estrella del Sur.
   - Atributos fijos por jugador (Velocidad, Pase, Tiro, Defensa, Control de Balón, Resistencia).
4. **Modo Liga Completo**:
   - Doble vuelta (todos contra todos local y visitante): 14 jornadas y 56 partidos en total.
   - Algoritmo de rotación (mesas de Berger) que garantiza que ningún club juegue dos veces en la misma jornada.
   - Tabla de posiciones oficial construida dinámicamente como fuente única de verdad (PTS, PJ, PG, PE, PP, GF, GC, DG).
   - Posibilidad de disputar el encuentro asignado al usuario o simular partidos restantes de la jornada.
5. **Estadísticas Oficiales**:
   - Goleadores por minuto, tiros totales, tiros a puerta, pases completados, intercepciones, paradas de portero y cálculo real del porcentaje de posesión.
6. **Persistencia y Resiliencia**:
   - Guardado automático en `LocalStorage`. Manejo seguro de datos corruptos con valores por defecto.

---

## 4. Requisitos y Comandos de Ejecución

### Requisitos:
- Node.js (versión 18+ o superior)
- npm

### Instalación de dependencias:
```bash
npm install
```

### Iniciar servidor de desarrollo:
```bash
npm run dev
```
Abre en tu navegador la URL local indicada (habitualmente `http://localhost:5173`).

### Ejecutar pruebas automatizadas:
```bash
npm run test
```

### Compilar para producción:
```bash
npm run build
```

---

## 5. Controles del Juego

| Tecla | Acción |
| :--- | :--- |
| **W, A, S, D** o **Flechas** | Movimiento del futbolista en todas las direcciones |
| **J** | Pase orientado hacia un compañero |
| **Espacio** | Disparo hacia la portería rival |
| **K** | Carrera / Sprint |
| **Tab** | Cambiar manualmente de jugador controlado |
| **Escape** | Pausar o reanudar el partido |

---

## 6. Persistencia de Datos

Los datos se gestionan mediante el servicio `SaveManager` bajo los siguientes identificadores en el almacenamiento local:
- `fl_settings_v1`: Preferencias (duración del partido, nivel de dificultad, ayudas).
- `fl_league_v1`: Estado actual de la temporada (jornada, calendario, resultados oficiales).
- `fl_stats_v1`: Historial de los últimos 50 partidos disputados.
