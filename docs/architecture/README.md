# Arquitectura del Sistema — Structurizr DSL

Guía para **crear, mantener y colaborar** en la documentación de la arquitectura del proyecto usando el modelo **C4** y **Structurizr DSL**.

## Tabla de contenidos

- [Introducción](#introducción)
- [Estructura del directorio](#estructura-del-directorio)
- [Requisitos](#requisitos)
- [Ejecutar Structurizr Lite con Docker](#ejecutar-structurizr-lite-con-docker)
  - [1. Validar el DSL](#1-validar-el-dsl)
  - [2. Levantar Structurizr Lite](#2-levantar-structurizr-lite)
  - [3. Detener Structurizr](#3-detener-structurizr)
- [Flujo de trabajo recomendado](#flujo-de-trabajo-recomendado)
- [Buenas prácticas de modelado](#buenas-prácticas-de-modelado)
- [Exportación de diagramas](#exportación-de-diagramas)
- [Versionado](#versionado)
- [Troubleshooting](#troubleshooting)

---

## Introducción

La arquitectura del proyecto se documenta utilizando el **modelo C4** y **Structurizr DSL**.

En lugar de mantener diagramas dibujados manualmente (que rápidamente quedan desactualizados), la arquitectura se define **como código** en un archivo DSL (_Domain Specific Language_). A partir de ese archivo, Structurizr genera automáticamente los distintos diagramas.

Este enfoque ofrece las siguientes ventajas:

- La arquitectura queda **versionada** junto con el código fuente.
- Los diagramas son **consistentes** entre sí.
- Es sencillo **mantener la documentación actualizada**.
- Se pueden generar las distintas vistas (Context, Container, Component, Code) a partir de **un único modelo**.
- **Facilita la colaboración** entre los miembros del equipo.

> El diseño conceptual del modelo (actores, sistemas, contenedores y componentes) se documenta en [`model.md`](./model.md). Conviene revisarlo antes de modificar el DSL.

---

## Estructura del directorio

El directorio de arquitectura sigue esta estructura:

```text
docs/
└── architecture/
    ├── README.md          # Esta guía
    ├── model.md           # Diseño conceptual del modelo C4 (actores, sistemas, etc.)
    ├── workspace.dsl      # Fuente de verdad: modelo de arquitectura en Structurizr DSL
    ├── workspace.json     # Generado por Structurizr (no editar manualmente)
    ├── images/            # Recursos gráficos usados por los diagramas (íconos, logos)
    ├── exports/           # Diagramas exportados (PNG, SVG, PDF) cuando sea necesario
    └── .structurizr/      # Caché/estado interno de Structurizr (generado, ignorado por git)
```

| Archivo / Directorio | Descripción                                                             | ¿Se edita a mano? |
| -------------------- | ----------------------------------------------------------------------- | ----------------- |
| `README.md`          | Documentación para trabajar con la arquitectura.                        | Sí                |
| `model.md`           | Diseño conceptual del modelo (personas, sistemas, contenedores).        | Sí                |
| `workspace.dsl`      | Modelo completo de la arquitectura en Structurizr DSL.                  | Sí (fuente única) |
| `images/`            | Recursos gráficos utilizados por los diagramas (íconos, logos, etc.).   | Sí                |
| `exports/`           | Diagramas exportados en PNG, SVG o PDF cuando sea necesario.            | Sí                |
| `workspace.json`     | Representación del modelo generada por Structurizr.                     | No (generado)     |
| `.structurizr/`      | Estado interno de Structurizr Lite.                                     | No (generado)     |

> **Fuente única de verdad:** solo `workspace.dsl` (y su diseño conceptual en `model.md`) debe editarse a mano. Los archivos generados (`workspace.json`, `.structurizr/`) no se modifican manualmente.

---

## Requisitos

Antes de comenzar es necesario tener instalado:

- **Docker**
- **Docker Compose** (opcional)
- **Visual Studio Code** (recomendado)

Se recomienda instalar también la **extensión de Structurizr DSL para Visual Studio Code**, que proporciona:

- resaltado de sintaxis,
- autocompletado,
- validación del DSL,
- navegación,
- y en general una mejor experiencia de edición.

---

## Ejecutar Structurizr Lite con Docker

Todos los comandos se ejecutan desde el directorio que contiene el archivo `workspace.dsl`:

```bash
cd docs/architecture
```

### 1. Validar el DSL

Luego de introducir cambios en `workspace.dsl`, validar que la sintaxis sea correcta y que no haya errores estáticos:

```bash
docker run --rm \
  -v "$(pwd):/usr/local/structurizr" \
  structurizr/structurizr validate \
  -workspace /usr/local/structurizr/workspace.dsl
```

### 2. Levantar Structurizr Lite

```bash
docker run -it --rm \
  -p 9000:8080 \
  -v "$(pwd):/usr/local/structurizr" \
  --name grupo-3-gestion-architecture-diagram \
  structurizr/structurizr local
```

> **Atención:** si aparece el error `Data directory /usr/local/structurizr is not writable` o similar, ver la sección [Troubleshooting](#troubleshooting).

Una vez iniciado el contenedor, abrir en el navegador:

```text
http://localhost:9000
```

Structurizr detectará automáticamente el archivo `workspace.dsl`. **Cada vez que se modifique y guarde ese archivo, la página se actualizará automáticamente** mostrando los cambios; no es necesario reiniciar el contenedor.

### 3. Detener Structurizr

Para detener Structurizr, presionar en la terminal:

```text
CTRL + C
```

Como el contenedor se ejecutó con `--rm`, se eliminará automáticamente.

---

## Flujo de trabajo recomendado

Para contribuir al diagrama de arquitectura, seguir siempre este flujo:

1. Modificar el archivo `workspace.dsl`.
2. Guardar los cambios.
3. Validar el DSL (ver [paso 1](#1-validar-el-dsl)).
4. Verificar el resultado en el navegador.
5. Corregir errores si fuera necesario.
6. Confirmar que el diagrama representa correctamente la arquitectura.
7. Realizar el commit correspondiente.

> **Nunca** modificar los diagramas manualmente. La única fuente de verdad es el archivo `workspace.dsl`.

---

## Buenas prácticas de modelado

- Mantener nombres **consistentes**.
- Utilizar **descripciones claras**.
- Evitar diagramas **sobrecargados**.
- Mostrar únicamente el **nivel de detalle** correspondiente a cada diagrama.
- **No mezclar niveles** del modelo C4.
- Evitar relaciones innecesarias.
- Mantener una **única definición** de cada elemento dentro del modelo.
- **Reutilizar** elementos existentes siempre que sea posible.
- Expresar en las relaciones el **propósito** de la interacción, no el protocolo.

---

## Exportación de diagramas

Structurizr permite exportar los diagramas a distintos formatos. Los diagramas exportados se almacenan dentro de:

```text
docs/architecture/exports/
```

Por ejemplo:

```text
exports/
├── system-context.png
├── containers.png
├── backend-components.png
└── frontend-components.png
```

Estos archivos pueden utilizarse posteriormente en informes, presentaciones o documentación técnica.

---

## Versionado

- Toda modificación de la arquitectura debe realizarse mediante cambios sobre el archivo `workspace.dsl`.
- **Nunca** deben modificarse manualmente los diagramas exportados ni los archivos generados.
- El archivo DSL constituye la **fuente oficial** de la arquitectura del sistema.

---

## Troubleshooting

### Error: `Data directory /usr/local/structurizr is not writable`

Si Structurizr no arranca y muestra el siguiente error:

```text
Data directory /usr/local/structurizr is not writable
```

asegurarse de que el directorio `docs/architecture` tenga permisos de escritura para el usuario que ejecuta el contenedor Docker. Por ejemplo:

```bash
chmod -R 777 docs/architecture
```

Luego de actualizar los permisos, reiniciar el contenedor.
