# Simulador Mundial 2026

Miniweb estática para capturar marcadores del Mundial 2026, calcular tablas de grupos, mejores terceros y una primera fase final.

## Cómo publicarlo en GitHub Pages

1. Crea un repositorio nuevo en GitHub, por ejemplo: `simulador-mundial-2026`.
2. Sube estos archivos a la raíz del repositorio:
   - `index.html`
   - `style.css`
   - `script.js`
   - `data.js`
   - `manifest.json`
3. En GitHub entra a **Settings > Pages**.
4. En **Build and deployment**, selecciona:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Guarda.
6. GitHub te dará una liga parecida a:
   `https://TU-USUARIO.github.io/simulador-mundial-2026/`

## Uso

- Captura goles.
- Marca el checkbox cuando el partido ya se jugó.
- Las tablas se actualizan solas.
- Los datos se guardan automáticamente en el teléfono/computadora usando `localStorage`.

## Nota

El cuadro de fase final es una aproximación inicial para simular avances. Si quieres emparejamientos oficiales exactos por combinaciones de mejores terceros, se puede mejorar después.
