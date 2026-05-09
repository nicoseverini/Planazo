# Planazo

Stack local con Docker Compose:
- `frontend` en `http://localhost:3000`
- `backend` en `http://localhost:8080`
- `swagger` en `http://localhost:8080/swagger-ui/index.html#/`
- `adminer` en `http://localhost:8081`
- `postgres` en `localhost:5435`

## Levantar la app

Desde la raiz del repo (donde esta el archivo `docker-compose.yml`):

```bash
sudo ./scripts/up-dev.sh
```

Ver logs si algo falla:

```bash
docker compose logs -f db
docker compose logs -f backend
docker compose logs -f frontend
```

## Bajar la app

```bash
docker compose down
```

Si tambien queres borrar volumenes de datos locales:

```bash
docker compose down -v
```

## Git hooks


```bash
git config --local --add core.hookspath git-hooks
```
