# Imágenes en el seed — Diseño y decisión

> **Estado:** propuesta de diseño para implementación futura.
> No urgente. Documenta cómo agregar fotos coherentes a los planes y lugares
> turísticos del seed, el problema de fondo, las opciones evaluadas (con ventajas
> y desventajas) y la recomendación para este proyecto.

---

## 1. Contexto

El seed (`DemoDataInitializer` + `SeedData`, ver también `seed_data_lote_impl.md`)
crea, entre otras cosas, **100 lugares turísticos** y **100 planes**. Hoy ambos se
crean **sin fotos**: el constructor recibe `List.of()` para el campo `images`.

Cómo se modelan las imágenes:

- `TouristPlace.images` → `List<String>` (`@ElementCollection`, columna `TEXT`).
- `Plan.images` → `List<String>` (`@ElementCollection`, columna `TEXT`).
- El frontend (Expo/React Native) renderiza tanto **URLs `http(s)`** como
  **data-URIs base64** (ver `normalizePhotoValue` y el avatar/cards). Cuando un
  lugar/plan no trae imagen, el home cae a un fallback temático por categoría
  (`FALLBACK_IMAGES` en `home-screen`), usando URLs de Unsplash del tipo
  `https://images.unsplash.com/photo-<id>` — un patrón ya verificado y funcionando
  en el repo.

---

## 2. Objetivo

Agregar fotos **coherentes** a cada lugar y a cada plan, según su información:

- **Planes:** una foto **representativa de la actividad** (gastronomía, trekking,
  museo, playa, vida nocturna, etc.).
- **Lugares turísticos:** para los lugares **reales**, una **foto real del sitio**
  (el Obelisco, la Torre Eiffel, Machu Picchu, etc.).

---

## 3. El problema

Hay dos problemas distintos a resolver.

### 3.1. Fuente de las fotos reales por sitio (el problema principal)

Para los planes, "representativa de la actividad" es **temático por categoría** y se
resuelve fácil con un pool curado (igual que `FALLBACK_IMAGES`).

Para los lugares, "foto real del **sitio exacto**" requiere **URLs verificadas
específicas de cada uno de los ~100 lugares**. El obstáculo: al momento de escribir
el seed **no hay acceso a internet** para buscar/verificar esas URLs. Si se generan
URLs "a ojo" (por ejemplo armando nombres de archivo de Wikimedia), una parte
saldría **rota**. No es aceptable cargar 100 URLs sin verificar.

### 3.2. Idempotencia: el seed ya aplicado no actualiza filas existentes

El seed usa lotes versionados (`seed_log`) y es **insert-only**. El lote `v2`
(expansión) **ya está marcado como aplicado** en los entornos que ya levantaron. Por
lo tanto, **si solo se editan los datos del seed para incluir fotos, las filas ya
sembradas NO se actualizan** (el lote no vuelve a correr y, por diseño, no se
modifican filas existentes). Hay que decidir cómo "aterrizar" las fotos sobre datos
que quizás ya existen.

---

## 4. Restricciones y consideraciones transversales

- **URL vs base64:** guardar **URLs** (no base64). Embeber base64 de 100+ fotos
  infla la base y los payloads de la API enormemente.
- **Internet en runtime:** las URLs externas requieren que la app/el dispositivo
  tengan internet al renderizar. La app ya carga imágenes remotas (vía los túneles
  ngrok), así que en la práctica sí — pero conviene confirmarlo, porque si se
  apuntara a un servicio caído las imágenes no cargan.
- **Licencias:** para un trabajo de la facultad / demo, casi cualquier URL pública
  sirve; si el proyecto se distribuyera, conviene preferir fuentes con licencia
  clara (Wikimedia Commons / Unsplash License).
- **Cantidad de fotos por entidad:** el modelo soporta varias (galería). Decidir si
  1 sola o 2–3.
- **Reproducibilidad:** un seed de demo idealmente "funciona solo"; depender de un
  servicio de terceros que puede estar caído resta robustez frente a URLs fijas y
  estables.

---

## 5. Opciones consideradas

### Para los LUGARES turísticos (foto del sitio)

#### Opción A — Servicio de imágenes por palabra clave (p. ej. LoremFlickr)
URLs del tipo `https://loremflickr.com/800/600/<keywords>` usando nombre del sitio +
ciudad. Devuelve una foto **real** (Creative Commons de Flickr) que matchea las
keywords, generada al vuelo.

- **Ventajas:** cero lista manual; fotos reales; sin verificación de mi parte;
  funciona para los 100 lugares automáticamente.
- **Desventajas:** **no garantiza** que sea el landmark exacto (para sitios muy
  famosos suele acertar; para spots chicos de CABA puede fallar); depende de un
  tercero (si está caído, no hay imagen); calidad/encuadre variables; control de
  licencia menos estricto.

#### Opción B — Lista curada de URLs reales por lugar (provista/verificada)
Un mapeo fijo `lugar → URL real` (idealmente Wikimedia Commons o similar),
verificado una vez.

- **Ventajas:** **máxima fidelidad** (la foto exacta del sitio); estable y
  reproducible; sin dependencia de servicios dinámicos; licencia controlable.
- **Desventajas:** requiere **esfuerzo manual** de curaduría/verificación para ~100
  lugares; no lo puedo verificar yo sin internet (habría que revisarlo del lado del
  equipo, aunque sea una vez).

#### Opción C — Temático por categoría (Unsplash curado)
Reusar el patrón de `FALLBACK_IMAGES`: una foto por **categoría/Interest**, no por
sitio.

- **Ventajas:** real, alta calidad, estable, patrón ya probado en el repo; cero
  riesgo de URL rota; trivial de mantener.
- **Desventajas:** **no es la foto del sitio exacto** (no cumple "foto real del
  sitio"); varios lugares de la misma categoría compartirían foto.

#### Opción D — Wikimedia Commons `Special:FilePath/<archivo>` redactado por landmark
URLs tipo `https://commons.wikimedia.org/wiki/Special:FilePath/<NombreArchivo>` que
redirigen a la imagen real. Yo redactaría el nombre de archivo por landmark.

- **Ventajas:** real, específico del sitio y con licencia clara **cuando el nombre
  de archivo es correcto**; URL estable.
- **Desventajas:** **no puedo verificar los nombres** sin internet → una parte
  quedaría rota y habría que revisarlas igual; el nombre de archivo "correcto" no es
  adivinable de forma confiable.

### Para los PLANES (foto de la actividad)

Enfoque único razonable: **pool curado por categoría** (Unsplash, patrón
`FALLBACK_IMAGES`). Mapea el `Interest` principal del plan (o del lugar asociado) a
una foto representativa de la actividad. Real, estable, coherente y de bajo
mantenimiento. (Las "desventajas" de C no aplican acá, porque para planes lo que se
pide **es** una foto representativa del tipo de actividad.)

### Para APLICAR las fotos sobre datos ya sembrados

#### Opción (i) — Reseed limpio
`docker compose down -v` y volver a levantar: el seed nuevo ya trae fotos.

- **Ventajas:** simple; mantiene el seed estrictamente insert-only.
- **Desventajas:** se pierde el estado actual de la base (datos de prueba que se
  hayan generado a mano).

#### Opción (ii) — Lote `v3` de backfill
Un lote nuevo que hace `UPDATE` de `images` **solo** sobre las filas que el seed
creó (identificables por ser sus lugares/planes conocidos).

- **Ventajas:** agrega fotos sin perder el volumen actual.
- **Desventajas:** introduce un `UPDATE` sobre filas existentes (acotado a datos
  propios del seed), lo que matiza el principio "insert-only"; hay que identificar
  con cuidado qué filas tocar para no pisar nada ajeno.

---

## 6. Conclusión — la mejor opción para este caso

Dado que el seed ya tiene un **catálogo fijo y conocido de 100 lugares** y el
objetivo explícito es **"foto real del sitio"**, la mejor relación
fidelidad/robustez/mantenibilidad es:

- **Lugares turísticos → Opción B (lista curada de URLs reales), priorizando
  Wikimedia Commons (`Special:FilePath`) o Unsplash con licencia clara.**
  Es un esfuerzo **único y finito** (el catálogo no cambia seguido), queda en el
  código (versionado, revisable, corregible), no depende de servicios dinámicos y es
  100% reproducible en runtime. Es la única que cumple de verdad "foto del sitio
  exacto". La curaduría se puede hacer incremental: empezar por los **más famosos**
  (los 40 del mundo + base + landmarks de CABA) y completar el resto.
  - *Alternativa pragmática si se quiere cero curaduría:* **Opción A** (keyword
    service) como **fallback** para los lugares menos famosos, aceptando menor
    fidelidad. Es decir, un **híbrido B+A**: URLs reales curadas donde importa, y
    keyword automático para el resto.
- **Planes → pool curado por categoría (Unsplash).** Cumple "representativa de la
  actividad", es estable y de bajo mantenimiento.
- **Aplicación → Opción (i), reseed limpio**, salvo que en ese momento haya datos
  manuales que valga la pena conservar; en ese caso, **lote `v3` de backfill** acotado
  a las filas del seed.

**Por qué B y no A como opción principal:** A es tentadora por el "cero trabajo",
pero (1) no garantiza la foto del sitio correcto —que es justamente el requisito— y
(2) mete una dependencia de un tercero que puede caerse, lo que va en contra de un
seed de demo que debe "funcionar solo". El costo de B (curaduría manual) es acotado
y se paga una sola vez sobre un catálogo que ya está fijo.

**Por qué descartar C y D como principales:** C no cumple "foto del sitio exacto"
(sirve solo como último fallback). D tiene la fidelidad de B pero sin su garantía:
sin poder verificar los nombres de archivo, termina exigiendo la misma revisión
manual que B pero con más URLs rotas en el camino.

---

## 7. Bosquejo de implementación futura

> Solo orientativo.

1. **Modelo de datos del catálogo.** Extender `SeedData.PlaceSpec` con un campo
   `List<String> images` (o un mapa `nombre → url`), y agregar a los planes una
   resolución `Interest → url` (pool por categoría).
2. **Pool de planes por categoría.** Un `static final Map<Interest, String>` (o
   `String[]` con `pick` aleatorio determinístico, como ya se hace con los textos de
   reviews) con URLs de Unsplash representativas por actividad.
3. **Curaduría de lugares.** Completar las URLs reales por lugar en `SeedData`
   (incremental: famosos primero). Donde no haya curada, decidir entre fallback por
   categoría (C) o keyword (A).
4. **Wiring en `DemoDataInitializer`.** En `createPlace(...)` pasar `s.images()` en
   vez de `List.of()`; en `seedExpansionPlans(...)` pasar la lista de imágenes del
   plan según su `Interest`/lugar. Hacer lo mismo en el lote base (`v1`) para los 10
   lugares y 10 planes existentes.
5. **Aplicación.** Reseed limpio (i) para verlo; o, si se necesita sobre el volumen
   actual, agregar lote `v3` que haga el `UPDATE` de `images` acotado a las filas del
   seed.
6. **Validación.** Verificar en la app que cada lugar/plan muestra su foto, y que no
   haya URLs rotas (spot-check de las curadas).

---

## 8. Lo que falta definir (preguntas abiertas)

1. **Fuente para lugares:** ¿B (curada), híbrido B+A, A (keyword) o C (categoría)?
2. **Internet en runtime:** confirmar que la app puede cargar URLs externas (se
   asume que sí).
3. **Cantidad de fotos por entidad:** ¿1 o 2–3?
4. **Aplicación sobre datos existentes:** ¿reseed limpio (i) o backfill `v3` (ii)?
5. **Licencias:** ¿hay alguna restricción (solo CC/Unsplash) o cualquier URL pública
   sirve para la demo?

Con esas respuestas, la implementación es directa y se puede hacer de forma segura,
consistente y reproducible.
