# Planazo

Planazo es una aplicación mobile construida con Expo (React Native) y un backend en Spring Boot, orquestados mediante Docker Compose.

## Arquitectura

Todos los servicios corren en contenedores Docker. El dispositivo móvil se conecta al backend a través de un túnel HTTPS provisto por **ngrok**, ya que iOS bloquea conexiones HTTP no seguras por defecto (App Transport Security). El servicio `web-auth` también se expone mediante un segundo túnel ngrok independiente, necesario para que el backend pueda redirigir al usuario a la pantalla de autenticación desde cualquier dispositivo.

> TODO: insertar un grafico de la arquitectura


### Servicios y puertos

| Servicio   | URL local                                         | Descripción                         |
|------------|---------------------------------------------------|-------------------------------------|
| `backend`  | `http://localhost:8080`                           | API REST (Spring Boot)              |
| `swagger`  | `http://localhost:8080/swagger-ui/index.html`     | Documentación interactiva de la API |
| `frontend` | túnel Expo (ver QR en consola)                    | App mobile (Expo / React Native)    |
| `web-auth` | `http://localhost:5173`                           | Frontend web de autenticación       |
| `adminer`  | `http://localhost:8082`                           | Cliente web para PostgreSQL         |
| `postgres` | `localhost:5432`                                  | Base de datos                       |

---

## Requisitos previos

Asegurate de tener instalado lo siguiente antes de continuar:

- [Docker](https://docs.docker.com/get-docker/) y Docker Compose
- [ngrok](https://ngrok.com/) con **dos cuentas** configuradas (ver [Instalación de ngrok](#instalación-de-ngrok))
- [Expo Go](https://expo.dev/go) instalado en el dispositivo móvil

---

## Instalación de ngrok

> Estos pasos aplican a **Ubuntu 24.04 LTS**. Para otros sistemas operativos consultá la [documentación oficial](https://ngrok.com/docs/getting-started/).

**1.** Agregá el repositorio e instalá ngrok:

```bash
curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc \
  | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null

echo "deb https://ngrok-agent.s3.amazonaws.com buster main" \
  | sudo tee /etc/apt/sources.list.d/ngrok.list

sudo apt update && sudo apt install ngrok
```

**2.** Verificá que se instaló correctamente:

```bash
ngrok version
```

**3.** Este proyecto requiere **dos túneles con dominios estáticos simultáneos**: uno para el backend y otro para el servicio `web-auth`. El plan gratuito de ngrok incluye un único dominio estático por cuenta, por lo que es necesario crear **dos cuentas** distintas.

   - Cuenta A → dominio estático para el **backend** (`puerto 8080`)
   - Cuenta B → dominio estático para **web-auth** (`puerto 5173`)

   Creá ambas cuentas en [dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup).

**4.** Registrá los authtokens de ambas cuentas. ngrok permite configurar múltiples authtokens mediante perfiles:

```bash
# Perfil para el backend (Cuenta A)
ngrok config add-authtoken TU_AUTHTOKEN_CUENTA_A --config ~/.config/ngrok/backend.yml

# Perfil para web-auth (Cuenta B)
ngrok config add-authtoken TU_AUTHTOKEN_CUENTA_B --config ~/.config/ngrok/web-auth.yml
```

**5.** Creá un dominio estático gratuito en cada cuenta desde [dashboard.ngrok.com/domains](https://dashboard.ngrok.com/domains). Esto evita tener que actualizar los archivos `.env` cada vez que se reinician los túneles.

---

## Configuración del entorno

Cada módulo del proyecto tiene su propio archivo `.env` con variables de entorno. Los archivos `.env.example` incluidos en el repositorio sirven como plantilla. **Nunca commitees los archivos `.env` reales.**

### 1. Variables globales (raíz del proyecto)

```bash
cp .env.example .env
```

| Variable                 | Descripción                                               | Valor por defecto |
|--------------------------|-----------------------------------------------------------|-------------------|
| `DB_NAME`                | Nombre de la base de datos PostgreSQL                     | `planazo`         |
| `DB_USERNAME`            | Usuario de PostgreSQL                                     | `postgres`        |
| `DB_PASSWORD`            | Contraseña de PostgreSQL. **Cambiala en entornos reales** | `change_me`       |
| `DB_EXTERNAL_PORT`       | Puerto externo del contenedor de PostgreSQL               | `5432`            |
| `BACKEND_EXTERNAL_PORT`  | Puerto externo del contenedor del backend                 | `8080`            |
| `WEB_AUTH_EXTERNAL_PORT` | Puerto externo del contenedor de web-auth                 | `5173`            |
| `ADMINER_EXTERNAL_PORT`  | Puerto externo del contenedor de Adminer                  | `8082`            |
| `VOLUME_DIR`             | Directorio base para los volúmenes persistentes de Docker | `.docker`         |

### 2. Variables del backend

```bash
cp backend/.env.example backend/.env
```

| Variable            | Descripción                                                         |
|---------------------|---------------------------------------------------------------------|
| `JWT_ACCESS_SECRET` | Secreto para firmar los JWT. Usá un valor aleatorio y seguro        |
| `SMTP_USERNAME`     | Correo de emails                                                    |
| `SMTP_PASSWORD`     | "App password" que provee Gmail                                     |
| `WEB_AUTH_URL`      | URL pública de `web-auth` provista por el túnel ngrok de la Cuenta B (ej: `https://tu-dominio-webauth.ngrok-free.app`) |
| `ADMIN_EMAIL`       | Email fijo de la cuenta administradora                              |
| `ADMIN_PASSWORD`    | Contraseña fija de la cuenta administradora                         |
| `ADMIN_NAME`        | Nombre visible del admin                                            |
| `ADMIN_LASTNAME`    | Apellido visible del admin                                          |
| `ADMIN_GENDER`      | Género del admin                                                    |
| `ADMIN_PHOTO`       | Foto o avatar del admin                                             |
| `ADMIN_BIRTH_DATE`  | Fecha de nacimiento del admin en formato `YYYY-MM-DD`              |

### 3. Variables del frontend

```bash
cp frontend/.env.example frontend/.env
```

| Variable                  | Descripción                                                                  |
|---------------------------|------------------------------------------------------------------------------|
| `EXPO_PUBLIC_BACKEND_URL` | URL pública del backend provista por el túnel ngrok de la Cuenta A (ej: `https://tu-dominio-backend.ngrok-free.app`) |

> **Importante:** esta URL debe ser la proporcionada por ngrok, no `localhost`. El dispositivo móvil no puede resolver el `localhost` de la máquina de desarrollo.

### 4. Variables de web-auth

```bash
cp web-auth/.env.example web-auth/.env
```

| Variable           | Descripción                                   |
|--------------------|-----------------------------------------------|
| `VITE_BACKEND_URL` | URL del backend accesible desde el navegador. Puede ser `http://localhost:8080` si accedés desde la misma máquina, o la URL ngrok de la Cuenta A si accedés desde otro dispositivo. |

---

## Levantar el entorno de desarrollo

Seguí estos pasos en orden cada vez que quieras iniciar el entorno.

### Paso 1 — Iniciá los túneles ngrok

Este proyecto requiere dos túneles simultáneos, uno por cuenta. Abrí **dos terminales separadas** y ejecutá cada comando en una:

```bash
# Terminal 1 — Cuenta A: expone el backend (puerto 8080)
ngrok http --domain=tu-dominio-backend.ngrok-free.app 8080 --config ~/.config/ngrok/backend.yml

# Terminal 2 — Cuenta B: expone web-auth (puerto 5173)
ngrok http --domain=tu-dominio-webauth.ngrok-free.app 5173 --config ~/.config/ngrok/web-auth.yml
```

Cada instancia mostrará en consola la URL pública activa:

```
Forwarding    https://tu-dominio-backend.ngrok-free.app -> http://localhost:8080
Forwarding    https://tu-dominio-webauth.ngrok-free.app -> http://localhost:5173
```

### Paso 2 — Actualizá las URLs en los archivos `.env`

Si **usás dominios estáticos**, este paso solo es necesario la primera vez. Si **no usás dominios estáticos**, copiá las URLs que aparecen en consola y actualizá los archivos correspondientes:

```dotenv
# frontend/.env
EXPO_PUBLIC_BACKEND_URL=https://tu-dominio-backend.ngrok-free.app
```

```dotenv
# backend/.env
WEB_AUTH_URL=https://tu-dominio-webauth.ngrok-free.app
```

```dotenv
# web-auth/.env
VITE_BACKEND_URL=https://tu-dominio-backend.ngrok-free.app
```

### Paso 3 — Configurá el secreto JWT del backend

Abrí `backend/.env` y definí `JWT_ACCESS_SECRET` con un valor base64 de al menos 32 bytes. Ejemplo:

```dotenv
JWT_ACCESS_SECRET=z4+HANbXJmq3HqLAmEWBBVWeSAZ8jXES3eCbXtMiHOY=
```

Si no usás `.env` local (por ejemplo, al ejecutar el backend fuera de Docker), también podés definirlo en `backend/src/main/resources/application.properties` con `jwt.access.secret`.

### Paso 4 — Configurá la cuenta admin inicial

Definí las variables `ADMIN_*` en `backend/.env`. Al arrancar el backend, esa cuenta se crea o actualiza automáticamente con rol `ADMIN` y estado verificado, así queda lista para iniciar sesión desde el primer arranque.

### Paso 5 — Levantá todos los servicios con Docker Compose

En otra terminal, desde la raíz del repositorio:

```bash
docker compose up --build
```

Esto construye y levanta todos los contenedores: `db`, `backend`, `frontend`, `web-auth` y `adminer`.

Una vez que el contenedor del frontend esté listo, la consola de Metro mostrará un código QR.

### Paso 6 — Conectá el dispositivo móvil

Escaneá el código QR con la cámara de tu iPhone o desde la app Expo Go. La aplicación se abrirá automáticamente en Expo Go.

---

## Bajar el entorno

```bash
docker compose down
```

Si también querés eliminar los volúmenes de datos locales y resetear la base de datos:

```bash
docker compose down -v
sudo rm -rf "$(git rev-parse --show-toplevel)/.docker/data/postgres"
```

---

## Ver logs

```bash
docker compose logs -f db
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f web-auth
```

---

## Git hooks

Para activar los hooks del repositorio ejecutá una vez al clonar el proyecto:

```bash
git config --local --add core.hookspath git-hooks
```

---

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| `Network request failed` al hacer login o registro | La URL en `frontend/.env` no coincide con la URL activa del túnel ngrok del backend | Verificá que el túnel de la Cuenta A esté corriendo y que `EXPO_PUBLIC_BACKEND_URL` tenga la URL correcta. Reiniciá el contenedor del frontend tras cualquier cambio en `.env` con `docker compose up --build frontend` |
| El flujo de autenticación no redirige correctamente | La URL en `backend/.env` (`WEB_AUTH_URL`) no coincide con la URL activa del túnel ngrok de web-auth | Verificá que el túnel de la Cuenta B esté corriendo y que `WEB_AUTH_URL` tenga la URL correcta. Reiniciá el backend con `docker compose up --build backend` |
| Las requests devuelven HTML en lugar de JSON | ngrok muestra una página de advertencia interstitial | Asegurate de enviar el header `Content-Type: application/json` en los requests (ya configurado por defecto en el código) |
| `There was a problem running the requested app` al escanear el QR | Problema de conectividad entre el dispositivo y el servidor de Expo | Verificá que el contenedor del frontend esté corriendo con `docker compose logs -f frontend` y que Expo esté usando `--tunnel` |
| El contenedor del frontend reinicia en loop | Error en la configuración de Expo o variable de entorno faltante | Revisá `docker compose logs -f frontend` y verificá que `frontend/.env` exista y tenga todas las variables requeridas |
| El backend no responde | El contenedor no terminó de iniciar o falló al conectarse a la DB | Esperá unos segundos y revisá `docker compose logs -f backend`. La DB puede tardar en estar lista al primer arranque |
