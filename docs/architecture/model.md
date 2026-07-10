# Modelados de las vistas del diagrama de arquitectura C4

Este documento describe el **diseño conceptual** del modelo de arquitectura de **Planazo**: los actores, sistemas, contenedores y relaciones que luego se materializan en [`workspace.dsl`](./workspace.dsl).

El modelo **C4** organiza la arquitectura en cuatro niveles de detalle progresivo:

| Nivel | Vista | Pregunta que responde | ¿Modelada? |
| ----- | ----- | --------------------- | ---------- |
| 1 | **Context** | ¿Cómo encaja el sistema en su entorno? ¿Quién lo usa y con qué sistemas externos interactúa? | ✅ Sí |
| 2 | **Container** | ¿Cuáles son las unidades desplegables y cómo se comunican entre sí? | ✅ Sí |
| 3 | **Component** | ¿Cómo se descompone internamente cada contenedor? | ❌ No solicitada |
| 4 | **Code** | ¿Cómo se implementa cada componente a nivel de clases? | ❌ No solicitada |

> El diseño aquí documentado es la referencia para editar el DSL. Antes de modificar `workspace.dsl`, conviene revisar y actualizar este archivo para mantener la coherencia entre el modelo conceptual y el modelo ejecutable.

Convención de idioma: la **prosa explicativa** se escribe en español, mientras que los **nombres y descripciones de los elementos** se mantienen en inglés, tal como aparecen en `workspace.dsl` y en los diagramas exportados.

---

#### Context View

> Tip: Simon Brown recomienda modelar únicamente los actores que interactúan de forma diferente con el sistema.

La **vista de contexto** presenta a **Planazo** como una única caja negra y muestra los actores que lo utilizan y los sistemas externos de los que depende. Es el nivel de mayor abstracción y está pensado para una audiencia amplia (técnica y no técnica).

Partes/Actores del modelado:
* `Planazo system`
    * > Desc: Platform that connects tourists and locals through activities and tourist places.
    * Sistema de software central (interno). Reúne toda la lógica de negocio del dominio: planes, lugares turísticos y usuarios.
* `User`
    * > Desc: Registered user who interacts with the platform through the mobile application, acting as a tourist or local.
    * Interactúa con el sistema a través de la aplicación móvil.
* `Administrator`
    * > Desc: Administrator responsible for moderating and managing the platform through the web administration panel.
    * Interactúa con el sistema a través del panel web de administración. Se modela como un actor separado porque su forma de uso es distinta a la del `User`.
* `Google Maps Platform`
    * > Desc: Provides maps, geocoding and location-related services.
    * Sistema externo. Proporciona mapas, geocodificación y servicios relacionados con la ubicación.
* `Email server (SMTP)` — modelado en el DSL como `Email Service`
    * > Desc: External email delivery service used to send verification and notification emails.
    * Sistema externo. Servicio de entrega de correos utilizado para el envío de emails de verificación y notificación.

**Relaciones de la vista de contexto:**

| Origen | Destino | Descripción |
| ------ | ------- | ----------- |
| `User` | `Planazo` | Uses |
| `Administrator` | `Planazo` | Manages |
| `Planazo` | `Google Maps Platform` | Retrieves maps and geolocation data |
| `Planazo` | `Email Service` | Sends verification and notification emails |

> Diagrama exportado: [`exports/context_view.png`](./exports/context_view.png) (con su leyenda en [`exports/context_view_key.png`](./exports/context_view_key.png)).

#### Container View

> Un **Container** es una unidad ejecutable o desplegable que tiene una responsabilidad clara y puede ejecutarse de manera independiente.

La **vista de contenedores** abre la caja negra de `Planazo` y muestra sus unidades desplegables, la tecnología con la que están construidas y cómo se comunican entre sí, con los actores y con los sistemas externos.

Contenedores que componen el sistema `Planazo`:

* `Mobile App`
    * **Tecnología:** React Native + Expo + TypeScript
    * Aplicación móvil utilizada por el `User`. Es el punto de entrada principal para turistas y locales. Consume la API del backend mediante HTTPS.
* `Web Panel UI`
    * **Tecnología:** HTML + CSS + TypeScript
    * Panel web de administración utilizado por el `Administrator` para moderar y gestionar la plataforma. Consume la API del backend mediante HTTPS.
* `Backend API`
    * **Tecnología:** Java 21 + Spring Boot
    * > Desc: Implements the business logic and exposes a REST API.
    * Núcleo del sistema. Concentra la lógica de negocio, expone la API REST y orquesta el acceso a la base de datos y a los servicios externos.
* `Database`
    * **Tecnología:** PostgreSQL
    * Almacenamiento persistente del sistema. El `Backend API` lee y escribe sobre ella.

**Relaciones de la vista de contenedores:**

| Origen | Destino | Descripción |
| ------ | ------- | ----------- |
| `User` | `Mobile App` | Uses |
| `Administrator` | `Web Panel UI` | Uses |
| `Mobile App` | `Backend API` | HTTPS |
| `Web Panel UI` | `Backend API` | HTTPS |
| `Backend API` | `Database` | Reads from and writes to [TCP] |
| `Backend API` | `Google Maps Platform` | Retrieves maps and geolocation data [HTTPS] |
| `Backend API` | `Email Service` | Sends verification and notification emails [HTTPS] |

> Diagrama exportado: [`exports/container_view.png`](./exports/container_view.png) (con su leyenda en [`exports/container_view_key.png`](./exports/container_view_key.png)).

> **Nota de modelado:** el servicio `web-auth` (SPA de autenticación web) todavía no está representado como un contenedor independiente en el modelo. Queda pendiente decidir si se modela como un contenedor aparte o si se considera parte del `Web Panel UI`. Ver el comentario correspondiente en `workspace.dsl`.

#### Component View

> No fue pedida por los profesores

#### Code View

> No fue pedida por los profesores
