# Planazo

Planazo es una aplicación mobile construida con Expo (React Native) y un backend en Spring Boot, orquestados mediante Docker Compose.

## Table of Contents

- [Arquitectura](#arquitectura)
  - [Servicios y puertos](#servicios-y-puertos)
- [Requisitos previos](#requisitos-previos)
- [Instalación de ngrok](#instalación-de-ngrok)
- [Configuración del entorno](#configuración-del-entorno)
  - [Variables globales](#1-variables-globales-raíz-del-proyecto)
  - [Variables del backend](#2-variables-del-backend)
  - [Variables del frontend](#3-variables-del-frontend)
  - [Variables de web-auth](#4-variables-de-web-auth)
- [Configuración del servicio de email](#configuración-del-servicio-de-email)
- [Configuración de JWT](#configuración-de-jwt)
- [Levantar el entorno de desarrollo](#levantar-el-entorno-de-desarrollo)
- [Bajar el entorno](#bajar-el-entorno)
- [Ver logs](#ver-logs)
- [Git hooks](#git-hooks)
- [Solución de problemas](#solución-de-problemas)

---

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

**3.** Este proyecto requiere **dos túneles con dominios estáticos simultáneos**: uno para el `backend` y otro para el servicio `web-auth`. El plan gratuito de ngrok incluye un único dominio estático por cuenta, por lo que es necesario crear **dos cuentas** distintas.

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
| `FRONTEND_EXTERNAL_PORT` | Puerto externo del contenedor del frontend                | `8081`            |
| `VOLUME_DIR`             | Directorio base para los volúmenes persistentes de Docker | `.docker`         |

### 2. Variables del backend

```bash
cp backend/.env.example backend/.env
```

| Variable                 | Descripción                                                                               |
|--------------------------|-------------------------------------------------------------------------------------------|
| `JWT_ACCESS_SECRET`      | Clave secreta para firmar y verificar access tokens (ver [Configuración de JWT](#configuración-de-jwt)) |
| `JWT_ACCESS_EXPIRATION`  | Duración de los access tokens en milisegundos. Por defecto: `1800000` (30 minutos)        |
| `JWT_REFRESH_BYTES`      | Bytes aleatorios usados para generar refresh tokens. Por defecto: `20`                    |
| `JWT_REFRESH_EXPIRATION` | Duración de los refresh tokens en milisegundos. Por defecto: `2592000000` (30 días)       |
| `SMTP_USERNAME`          | Dirección Gmail desde la que se envían los emails                                         |
| `SMTP_PASSWORD`          | App Password generado por Google (ver [Configuración del servicio de email](#configuración-del-servicio-de-email)) |
| `WEB_AUTH_URL`           | URL pública de `web-auth` provista por el túnel ngrok de la Cuenta B (ej: `https://tu-dominio-webauth.ngrok-free.app`) |

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

## Configuración del servicio de email

El backend utiliza Gmail como proveedor SMTP para el envío de emails (confirmación de cuenta, recupero de contraseña, etc.). La configuración requiere dos pasos: tener una cuenta Gmail real y generar una **App Password**, ya que Google no permite autenticación SMTP con la contraseña normal de la cuenta.

### Variables involucradas

| Variable        | Descripción                                                                 |
|-----------------|-----------------------------------------------------------------------------|
| `SMTP_USERNAME` | Dirección de una cuenta Gmail real (ej: `planazo.app@gmail.com`)            |
| `SMTP_PASSWORD` | App Password generado por Google. **No es la contraseña normal de Gmail**   |

### Por qué se necesita un App Password

Google deshabilitó la autenticación SMTP con contraseña convencional para cuentas con doble factor de autenticación activo (que es el caso requerido). En su lugar, Google permite generar **App Passwords**: credenciales de 16 caracteres de un solo propósito que se pueden revocar en cualquier momento sin afectar la contraseña principal de la cuenta.

### Cómo generar el App Password

**1.** Accedé a la configuración de seguridad de tu cuenta Google:
[myaccount.google.com/security](https://myaccount.google.com/security)

**2.** Activá la **Verificación en dos pasos** si todavía no está habilitada. Es un requisito previo para poder generar App Passwords.

**3.** Una vez habilitada la verificación en dos pasos, accedé a:
[myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

**4.** En el campo de nombre, ingresá una descripción identificatoria (por ejemplo, `Planazo Docker Backend`) y hacé clic en **Crear**.

**5.** Google generará una clave de 16 caracteres con el siguiente formato:

```
abcd efgh ijkl mnop
```

Copiala inmediatamente: Google no vuelve a mostrarla una vez que cerrás el modal.

### Configuración en `backend/.env`

Con la cuenta y la App Password listas, tu `backend/.env` para el servicio de email debe quedar así:

```dotenv
SMTP_USERNAME=planazo.app@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
```

> **Nota:** los espacios en la App Password son parte del formato que muestra Google, pero pueden omitirse al pegarla. Ambas formas (`abcdefghijklmnop` y `abcd efgh ijkl mnop`) son válidas.

---

## Configuración de JWT

El backend implementa autenticación basada en dos tipos de tokens: **access tokens** (de vida corta, usados para autenticar requests) y **refresh tokens** (de vida larga, usados para obtener nuevos access tokens sin requerir login). Las siguientes variables controlan su comportamiento.

### Referencia de variables

| Variable                 | Valor por defecto          | Descripción                                               |
|--------------------------|----------------------------|-----------------------------------------------------------|
| `JWT_ACCESS_SECRET`      | *(sin valor — obligatorio)*| Clave secreta para firmar y verificar access tokens       |
| `JWT_ACCESS_EXPIRATION`  | `1800000` (30 min)         | Duración de los access tokens en milisegundos             |
| `JWT_REFRESH_BYTES`      | `20`                       | Bytes aleatorios usados para generar cada refresh token   |
| `JWT_REFRESH_EXPIRATION` | `2592000000` (30 días)     | Duración de los refresh tokens en milisegundos            |

### JWT_ACCESS_SECRET

`JWT_ACCESS_SECRET` es la clave secreta que el backend usa para **firmar** los access tokens al autenticar usuarios y para **verificarlos** en cada request protegido. Quien posea esta clave puede generar tokens válidos arbitrarios y suplantar cualquier usuario del sistema, incluyendo administradores. Su compromiso equivale a una brecha total del sistema de autenticación.

**Requisitos:**

- **Nunca hardcodear el secret en el código fuente.** No debe aparecer en ningún archivo Java, ni en `application.properties` con un valor fijo.
- **Nunca commitearlo a GitHub**, ni en el historial. Si ya fue commiteado, debe rotarse inmediatamente y considerarse comprometido.
- **Nunca usar valores débiles** como `secret`, `123456`, `myapp-secret` o cualquier string predecible.
- Debe ser **aleatorio criptográficamente**, con un mínimo de 256 bits de entropía. En la práctica, generá al menos 64 bytes en hexadecimal (128 caracteres).

**Cómo generar un secret seguro:**

Con OpenSSL (Linux y macOS):

```bash
openssl rand -hex 64
```

Con Python (cualquier sistema con Python 3.6+):

```bash
python3 -c "import secrets; print(secrets.token_hex(64))"
```

Ambos producen un string similar a:

```
a3f1c2e94b07d6821f45cc98e230b174d9a5f0381e6c72b4d8091af53e2c760d4b9a3e7f28c1054d6e832b97f410ca5e2b73d904f61a8c5e0d2f37a489b1e6c30
```

**Configuración segura en producción:**

En producción, el secret debe inyectarse mediante variables de entorno del servidor o plataforma (Railway, Render, AWS, etc.), nunca desde un archivo `.env` commiteado. La configuración de Spring Boot debe leer la variable sin ningún valor de fallback:

```properties
# ✅ Correcto: la aplicación falla al arrancar si la variable no está definida
jwt.access.secret=${JWT_ACCESS_SECRET}
```

```properties
# ❌ Peligroso: si JWT_ACCESS_SECRET no está definida, la aplicación arranca
# con un secret conocido y potencialmente público
jwt.access.secret=${JWT_ACCESS_SECRET:000000000000}
```

Un fallback inseguro es especialmente riesgoso porque el error es silencioso: la aplicación arranca sin advertencias y opera con un secret débil hasta que alguien lo detecta.

### JWT_ACCESS_EXPIRATION

Tiempo de vida de los access tokens, expresado en **milisegundos**. El valor por defecto es `1800000`, que equivale a **30 minutos**.

| Duración | Milisegundos  |
|----------|---------------|
| 15 min   | `900000`      |
| 30 min   | `1800000`     |
| 1 hora   | `3600000`     |
| 24 horas | `86400000`    |

Expirations cortas reducen la ventana de exposición si un access token es comprometido: un atacante que obtenga un token solo puede usarlo hasta que expire, sin posibilidad de renovarlo. El contrapunto es que el cliente debe renovar tokens más frecuentemente usando el refresh token. Para la mayoría de los casos, 15–60 minutos es un equilibrio razonable.

### JWT_REFRESH_BYTES

Cantidad de bytes aleatorios usados para generar cada refresh token. El valor por defecto es `20`, lo que produce tokens de 40 caracteres hexadecimales (160 bits de entropía), suficiente para uso en producción.

Aumentar este valor genera tokens más largos y con mayor entropía, a costa de un tamaño ligeramente mayor en base de datos y cookies. Reducirlo por debajo de `16` no se recomienda.

### JWT_REFRESH_EXPIRATION

Tiempo de vida de los refresh tokens, expresado en **milisegundos**. El valor por defecto es `2592000000`, que equivale a **30 días**.

A diferencia del access token —que se envía en cada request y tiene vida corta—, el refresh token se almacena de forma segura en el cliente y solo se usa para obtener nuevos access tokens cuando el anterior expira. Su vida larga permite que el usuario permanezca autenticado sin necesidad de hacer login repetidamente, siempre que siga usando la aplicación dentro del período configurado.

### Qué ocurre al rotar el secret

Cambiar `JWT_ACCESS_SECRET` invalida **todos los access tokens existentes** de forma inmediata. Los usuarios con sesión activa recibirán errores de autenticación en su próximo request y deberán volver a iniciar sesión. Esto es el comportamiento esperado y correcto ante una rotación de emergencia.

### Recomendaciones finales

- Asegurate de que `backend/.env` esté en `.gitignore` y nunca sea commiteado.
- El archivo `backend/.env.example` debe existir en el repositorio con los nombres de variables pero **sin valores reales**: `JWT_ACCESS_SECRET=`.
- En producción, usá un secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.) en lugar de archivos `.env`.
- Rotá `JWT_ACCESS_SECRET` inmediatamente si sospechás que fue expuesto o comprometido.

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

### Paso 3 — Configurá las variables JWT del backend

Abrí `backend/.env` y completá las variables de JWT. Como mínimo, `JWT_ACCESS_SECRET` es obligatoria; el resto tiene valores por defecto razonables que podés dejar como están para desarrollo local. Si todavía no generaste el secret, seguí los pasos en [Configuración de JWT](#configuración-de-jwt).

```dotenv
JWT_ACCESS_SECRET=a3f1c2e94b07d6821f45cc98e230b174d9a5f0381e6c72b4d8091af53e2c760d4b9a3e7f28c1054d6e832b97f410ca5e2b73d904f61a8c5e0d2f37a489b1e6c30
JWT_ACCESS_EXPIRATION=1800000
JWT_REFRESH_BYTES=20
JWT_REFRESH_EXPIRATION=2592000000
```

### Paso 4 — Configurá las credenciales de email del backend

Abrí `backend/.env` y completá las variables del servicio SMTP:

```dotenv
SMTP_USERNAME=planazo.app@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
```

> Si todavía no generaste el App Password de Google, seguí los pasos en [Configuración del servicio de email](#configuración-del-servicio-de-email) antes de continuar. El backend no levantará correctamente si estas variables están vacías o tienen valores inválidos.

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
| El backend falla al iniciar con error de autenticación SMTP | `SMTP_PASSWORD` contiene la contraseña normal de Gmail en lugar de un App Password | Generá un App Password siguiendo los pasos en [Configuración del servicio de email](#configuración-del-servicio-de-email) y actualizá `backend/.env` |
| Los emails no llegan o hay error `535 Authentication failed` | App Password inválido o cuenta sin verificación en dos pasos activa | Verificá que la cuenta tenga 2FA activado y que el App Password se haya copiado correctamente (sin caracteres extra) |
