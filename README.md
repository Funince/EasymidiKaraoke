La página es una herramienta diseñada para músicos, compositores y productores que trabajan con archivos MIDI. Permite visualizar y editar notas MIDI en un canvas interactivo, agregar letras sincronizadas a la melodía, y exportar el resultado en formatos como SRT, ASS y MIDI. Además, incluye funcionalidades para sincronizar un archivo de audio con el MIDI, lo que facilita la detección de errores de sincronización.

Funcionalidades Principales
Visualización de Notas MIDI en el Canvas

El canvas es el núcleo de la aplicación. Muestra las notas MIDI como bloques o barras que representan la duración y el tono de cada nota.

Las notas se pueden editar haciendo clic derecho sobre ellas, lo que permite realizar acciones básicas como mover, eliminar o ajustar su duración.

El tiempo de duración del proyecto está determinado por la longitud del archivo MIDI cargado, y no se puede extender manualmente.

Agregar Letras Sincronizadas

La página permite agregar letras a la melodía MIDI, divididas en sílabas y separadas por guiones (-) y saltos de línea.

Las sílabas se sincronizan con las notas MIDI, lo que facilita la creación de karaokes o subtítulos musicales.

Las letras se muestran en el canvas junto a las notas correspondientes.

Exportación en Diferentes Formatos

SRT: Formato de subtítulos compatible con la mayoría de editores de video.

ASS: Formato avanzado de subtítulos utilizado en programas como Aegisub, que permite personalizar estilos y animaciones.

MIDI: Permite guardar las modificaciones realizadas en el archivo MIDI original.

Sincronización de Audio

En la parte inferior de la página, se puede cargar un archivo de audio (por ejemplo, una grabación de la melodía).

Si el audio está sincronizado con el MIDI, la herramienta ayuda a identificar errores de timing o desfases entre las notas MIDI y el audio.

Edición Básica de Notas

Con clic derecho sobre una nota en el canvas, se pueden realizar acciones como:

Mover la nota en el tiempo o cambiar su tono.

Eliminar la nota.

Ajustar la duración de la nota (dentro de los límites del proyecto).

Tecnologías Utilizadas
Vue.js: Framework de JavaScript utilizado para construir la interfaz de usuario de manera reactiva y modular.

TypeScript: Lenguaje que añade tipado estático a JavaScript, mejorando la calidad y mantenibilidad del código.

Canvas: Elemento HTML5 utilizado para renderizar las notas MIDI de manera gráfica e interactiva.

Librerías MIDI: Posiblemente se utilizó alguna librería como tone.js o midi-parser para manejar la lectura y manipulación de archivos MIDI.

Flujo de Trabajo
Cargar un Archivo MIDI: El usuario carga un archivo MIDI, que se visualiza en el canvas.

Agregar Letras: El usuario introduce la letra de la canción, dividida en sílabas y sincronizada con las notas MIDI.

Sincronizar Audio (Opcional): El usuario carga un archivo de audio para verificar la sincronización con el MIDI.

Editar Notas: El usuario puede realizar ajustes en las notas MIDI directamente en el canvas.

Exportar: El usuario exporta el proyecto en los formatos deseados (SRT, ASS, MIDI).

Limitaciones
Duración del Proyecto: La duración total del proyecto está determinada por el archivo MIDI cargado y no se puede extender manualmente.

Edición Avanzada: La herramienta no permite realizar ediciones complejas como cambiar el tempo o agregar nuevas pistas MIDI.
# vue_midi

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
