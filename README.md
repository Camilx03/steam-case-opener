# 🎰 Steam Case Opener (CS2 Edition)

Aplicación web interactiva inspirada en la apertura de cajas de **Counter-Strike 2 (CS:GO / CS2)** para elegir al azar a qué juego de tu biblioteca de **Steam** jugar hoy.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwind-css&logoColor=white)
![Steam API](https://img.shields.io/badge/Steam_Web_API-Integrated-000000?logo=steam&logoColor=white)

## ✨ Características principales

- **Física de apertura estilo CS2:** Animaciones a 60 FPS con desaceleración realista (`cubic-bezier`) y aterrizaje aleatorio milimétrico dentro de la tarjeta.
- **Audio Sintetizado (Web Audio API):** Efectos de sonido mecánicos (*ticks*) generados en tiempo real al cruzar la aguja central y acordes de victoria según la rareza obtenida, sin depender de archivos `.mp3` externos.
- **Rarezas dinámicas basadas en tu Backlog:**
  - 🟨 **★ Especial (Dorado):** Juegos con `0 horas` jugadas (comprados y nunca abiertos).
  - 🟥 **Covert (Rojo):** Juegos con menos de `2 horas`.
  - 🟪 **Classified (Rosa):** Entre `2h y 10h` jugadas.
  - 🟪 **Restricted (Morado):** Entre `10h y 40h` jugadas.
  - 🟦 **Mil-Spec (Azul):** Juegos veteranos con más de `40h`.
- **Conexión directa con Steam (`steam://run/<appid>`):** Botón para lanzar o instalar el juego ganador directamente en tu cliente de Steam de escritorio.

## 🚀 Instalación y uso en local

1. Clona este repositorio:
   ```bash
   git clone https://github.com/TU_USUARIO/steam-case-opener.git
   cd steam-case-opener