# Frontend (Expo)

App mobile con Expo Router y estructura organizada en `app/` + `src/`.

## Comandos

```bash
npm install
npm run start
npm run android
npm run ios
npm run web
npm run lint
```

## Estructura

- `app/`: rutas (wrappers). Cada archivo exporta la pantalla de `src/screens/*`.
- `src/screens/`: pantallas, cada una en carpeta con `index.tsx` + `styles.ts`.
- `src/components/`: componentes encapsulados (carpeta por componente).
- `src/components/auth/`: piezas de autenticacion reutilizables.
- `src/components/ui/`: componentes UI base.
- `src/services/`: llamadas a API.
- `src/models/`: tipos y validaciones.
- `src/hooks/`: hooks compartidos.
- `src/constants/`: temas y constantes.

## Convenciones

- Cada pantalla vive en `src/screens/<nombre>/index.tsx` con `styles.ts`.
- Cada componente vive en `src/components/<Nombre>/` con `index.ts` y/o `styles.ts`.
- Los wrappers en `app/` solo exportan la pantalla (sin logica).
- Usar alias `@/` para importar desde `src/`.
