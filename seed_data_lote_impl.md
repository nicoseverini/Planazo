# Seed de datos por lotes (versionado) — Diseño y decisión

> **Estado:** propuesta de diseño para implementación futura.
> No urgente. Documenta el problema detectado en el seed actual, las opciones
> evaluadas y la decisión tomada (**Opción A: marcador por versión / lotes**).

---

## 1. Contexto

El backend (Spring Boot + PostgreSQL) **no usa Flyway ni Liquibase**. El esquema
se crea/actualiza en runtime con Hibernate:

```properties
spring.jpa.hibernate.ddl-auto=update
```

Por eso el seeding **no puede** hacerse con SQL puro en
`docker-entrypoint-initdb.d` de Postgres: esos scripts corren **antes** de que la
app exista y, por lo tanto, antes de que Hibernate cree las tablas.

El patrón de inicialización que sí existe en el proyecto es un componente Java que
corre cuando el contexto ya está listo (esquema ya creado). Ejemplos:

- `config/bootstrap/AdminAccountInitializer.java` — crea la cuenta admin.
- `config/DatabaseExtensionConfig.java` — habilita la extensión `unaccent`.

Sobre ese patrón se implementó `config/bootstrap/DemoDataInitializer.java`, que
siembra un set base: 5 usuarios del equipo, 10 lugares turísticos, 10 planes (con
miembros) y reviews de lugares y de usuarios.

El seeder se ejecuta automáticamente al levantar el backend (incluido en
`docker compose up`) y puede activarse/desactivarse con la variable de entorno
`SEED_DEMO_DATA` (mapeada a `app.seed.demo-data.enabled`).

---

## 2. El problema observado

Al levantar el stack sobre un **volumen de base de datos preexistente** (donde los
5 emails del seed **ya existían**, porque el equipo ya había usado la app), el seed
**no pobló** los planes, lugares ni reviews esperados.

### Causa raíz

La idempotencia del seeder se apoyaba en un **guard global**:

```java
// 1) usuarios: upsert por email (findByEmail -> reusar o crear)
List<User> team = ensureTeam();

// 2) guard global
if (!planRepository.findByCreatorId(team.get(0).getId()).isEmpty()) {
    return; // <-- aborta TODO el seeding
}
```

La intención del guard era: *"si ya sembramos antes, no volver a sembrar"*. Pero el
**marcador elegido era malo**: *"¿el usuario seed #1 tiene algún plan?"*. Ese marcador
**no es exclusivo del seed** — colisiona con la actividad real de los usuarios.

Como en el volumen el usuario #1 ya tenía planes propios (creados con la app), el
guard interpretó *"ya está sembrado"* y abortó la inserción de lugares, planes y
reviews.

### Aclaración importante

El **vínculo con los usuarios existentes nunca fue el problema**. `ensureUser` hace
`findByEmail` y, si el email existe, devuelve **ese** usuario; ese objeto se usa como
`creator`/autor. Es decir: sí es posible (y el código ya lo hace) crear planes,
lugares y reviews atribuidos a los usuarios que ya existen, "como si los hubieran
creado ellos". El único impedimento fue el guard global, que cortó antes de llegar a
esa parte.

---

## 3. Restricciones de diseño

Cualquier solución debe cumplir:

1. **Insert-only:** nunca `UPDATE` ni `DELETE` de datos existentes. Solo agregar.
2. **Idempotente:** correr el seed N veces no debe duplicar datos.
3. **Desacoplado de la actividad real de los usuarios:** el "¿ya sembré?" no puede
   depender de datos que un usuario podría haber creado por su cuenta.
4. **Escalable a muchas más entidades:** se planea extender el seed con bastantes
   más registros y tipos de entidad. La estrategia no debe volverse tediosa ni
   costosa a medida que crece.
5. **Compatible con el mecanismo actual** (seeder Java en `ApplicationReadyEvent`,
   sin introducir Flyway/Liquibase salvo que se decida explícitamente).
6. **Cuidado con constraints:** la tabla `reviews` tiene un
   `UNIQUE (user_id, target_type, target_id)`. Insertar una review duplicada lanza
   una violación de constraint y, como el seed es `@Transactional`, haría **rollback
   de todo el lote**. La estrategia debe evitar ese escenario.

---

## 4. Opciones consideradas

### Opción A — Marcador por versión / lotes (elegida)

Una tabla mínima (p. ej. `seed_log`) registra qué **lotes** de seed ya se aplicaron.
El seed se organiza en lotes versionados; cada lote se aplica a lo sumo una vez:

```java
if (!seedLog.existsById("v1_core")) {
    insertarLoteV1();               // inserts planos, sin chequear entidad por entidad
    seedLog.save(new SeedLog("v1_core"));
}
if (!seedLog.existsById("v2_more_plans")) {
    insertarLoteV2();
    seedLog.save(new SeedLog("v2_more_plans"));
}
```

**Ventajas**
- **1 chequeo por lote**, no por entidad → O(lotes). Escala a cualquier cantidad de
  entidades **sin boilerplate por entidad**.
- Dentro del lote, inserts directos (el marcador garantiza ejecución única).
- El marcador es **propiedad exclusiva del seed** → no colisiona con la actividad de
  los usuarios (corrige la causa raíz).
- Extender es trivial: se agrega un lote nuevo con una clave nueva; corre una vez en
  el próximo arranque y los lotes viejos se saltean.
- Es conceptualmente equivalente a una migración (modelo Flyway/Liquibase), pero
  liviano y hecho a mano.
- Insert-only e idempotente por construcción.

**Desventajas**
- Requiere **una tabla nueva** (`seed_log`), creada por `ddl-auto` como una `@Entity`.
- **No "auto-repara":** si alguien borra a mano filas de un lote ya aplicado, el lote
  no las regenera (igual que una migración real). Para resembrar desde cero:
  `docker compose down -v` y volver a levantar.

### Opción B — Sentinela por lote, sin tabla nueva

En vez de una tabla, se chequea **un** registro representativo y claramente "del
seed" por lote (p. ej. *"¿existe el lugar 'Glaciar Perito Moreno'?"*). Si no existe,
se corre el lote.

**Ventajas**
- Cero cambios de schema, 1 chequeo por lote.

**Desventajas**
- El sentinela podría colisionar con datos reales si no se elige con cuidado (es el
  tipo de error que causó el bug original, aunque acá mitigado usando un nombre
  distintivo del seed).
- Menos explícito y auditable que una tabla de versiones; el "estado del seed" queda
  implícito en la existencia de ciertos registros.

### Opción C — Idempotencia por entidad (clave natural)

Cada entidad se inserta solo si no existe ya, según su clave natural:

| Entidad        | Clave natural                          | Lookup                                          |
|----------------|----------------------------------------|-------------------------------------------------|
| Usuario        | `email`                                | `findByEmail`                                   |
| Lugar          | `name`                                 | `findFirstByName`                               |
| Plan           | `(creator, title)`                     | `findByCreatorId` + filtro por título           |
| Review         | `(autor, target_type, target_id)`      | `findByUserIdAndTargetTypeAndTargetId`          |

**Ventajas**
- Máxima robustez: "auto-repara"/completa datos parcialmente faltantes.
- No necesita tabla de marcadores.
- Tolera bases donde los datos pueden preexistir desde otras fuentes.

**Desventajas**
- **Boilerplate por cada tipo de entidad** (clave + lookup + get-or-create). A medida
  que el seed crece a muchas entidades, se vuelve tedioso y propenso a errores.
- Más chequeos (aunque el costo de performance es marginal: el seed corre una sola
  vez al boot, con lookups indexados sobre tablas chicas).

> **Nota sobre performance:** en las tres opciones el costo es despreciable porque el
> seed se ejecuta una única vez en el arranque. El factor decisivo **no** es CPU/DB,
> sino la **mantenibilidad** a medida que el seed crece.

---

## 5. Decisión

**Se elige la Opción A: seed por lotes versionados con tabla marcadora `seed_log`.**

### Por qué

- **Escala a la dirección del proyecto.** El objetivo es extender el seed a muchas
  más entidades. La Opción A mantiene el costo y el boilerplate en O(lotes), no en
  O(entidades): agregar datos nuevos es "un lote nuevo", sin tener que definir claves
  naturales ni get-or-create por cada tipo.
- **Corrige la causa raíz.** El marcador es exclusivo del seed (una fila en
  `seed_log`), así que el "¿ya sembré?" deja de depender de la actividad real de los
  usuarios — que fue exactamente lo que rompió la versión con guard global.
- **Cumple las restricciones:** insert-only, idempotente, y desacoplado.
- **Modelo conocido y auditable.** Es el patrón de las migraciones (Flyway/Liquibase)
  en versión liviana; el estado del seed queda explícito y consultable en una tabla.
- **Descarta la Opción C** por overkill: su única ventaja real (auto-reparar datos
  borrados a mano) no es un requisito, y su costo (boilerplate por entidad) choca de
  frente con el plan de crecer el seed.
- **Descarta la Opción B** como elección principal porque, aunque evita la tabla, deja
  el estado del seed implícito y reintroduce (atenuado) el riesgo de sentinela mal
  elegido. Queda como alternativa válida si en algún momento se prefiere no agregar
  schema.

### Comportamiento esperado sobre el volumen actual

Como la tabla `seed_log` todavía no existe, en el próximo arranque el lote `v1_core`
figurará "no aplicado" → se ejecuta → siembra lugares, planes y reviews **vinculados
a los usuarios existentes** (los creadores/autores se siguen resolviendo por email).
Es justamente el resultado deseado. En arranques posteriores el lote queda marcado y
se saltea, sin duplicar.

---

## 6. Bosquejo de implementación futura

> Solo orientativo; se detallará al implementar.

1. **Entidad + repo del marcador.**
   - `SeedLog` (`@Entity`): PK `version` (String), `appliedAt` (Instant).
   - `SeedLogRepository extends JpaRepository<SeedLog, String>`.
   - Hibernate (`ddl-auto=update`) crea la tabla automáticamente.

2. **Refactor del seeder a lotes.**
   - En `DemoDataInitializer.seed()`, eliminar el guard global actual.
   - Definir un helper:
     ```java
     private void applyOnce(String version, Runnable batch) {
         if (seedLog.existsById(version)) return;
         batch.run();
         seedLog.save(new SeedLog(version));
     }
     ```
   - Envolver cada lote: `applyOnce("v1_core", this::seedCoreBatch);`
   - **Transaccionalidad:** preferible aplicar **cada lote en su propia transacción**
     (que el marcado y los inserts del lote commiteen juntos atómicamente). Revisar si
     conviene un método `@Transactional` por lote en un bean aparte, o
     `TransactionTemplate`, en vez de un único `@Transactional` para todo `seed()`.

3. **Mantener** `ensureTeam()`/`ensureUser()` (upsert por email) para que los
   creadores/autores siempre apunten a los usuarios correctos, existan o no.

4. **Para crecer el seed:** agregar `seedV2Batch()` y `applyOnce("v2_...", ...)`.
   No tocar lotes ya liberados (son inmutables, como una migración aplicada).

5. **Validación:**
   - Levantar sobre el volumen actual → verificar en Adminer que aparecen lugares,
     planes y reviews atribuidos al equipo, y una fila por lote en `seed_log`.
   - Reiniciar → conteos estables (sin duplicados), sin nuevas filas en `seed_log`.

---

## 7. Notas y riesgos

- **Reseed desde cero:** con datos ya presentes, el seed solo agrega lo que falte
  según los lotes no aplicados. Para empezar limpio: `docker compose down -v`.
- **`reviews` UNIQUE:** dentro de un lote que corre una sola vez, los inserts de
  reviews son seguros (no hay duplicados) salvo que esos mismos pares ya existieran en
  la DB. En una primera corrida real no existen. Si se sembrara sobre una base que ya
  tuviera esos pares, conviene que el lote sea transaccional para no dejar estados
  parciales.
- **Heads-up no relacionado a este diseño:** actualmente
  `app.seed.demo-data.enabled=${SEED_DEMO_DATA:}` tiene **default vacío**. Dentro de
  Docker Compose está OK porque `SEED_DEMO_DATA` es requerido. Pero si se corre el jar
  fuera de compose **sin** esa env, la property queda `""` y el binding a `boolean`
  falla al arrancar. Conviene un default real (`:true`) o garantizar que la env esté
  siempre seteada.
