# Automatizaciones de ingeniería (Fase 2)

Activar cuando haya ritmo de PRs o miedo a romper producción. Hasta entonces, usar subagentes a mano ([practice-subagents.md](./practice-subagents.md)).

## Condición de entrada

- Varias PRs por semana, **o**
- Cambios frecuentes en checkout / webhook / ops auth, **o**
- CI rojo recurrente sin triage claro.

## Ya disponible sin infra nueva

### 1. Template de PR

[`.github/PULL_REQUEST_TEMPLATE.md`](../../.github/PULL_REQUEST_TEMPLATE.md) fuerza checklist de tests, commerce/ops y secretos.

### 2. CI actual

[`.github/workflows/ci.yml`](../../.github/workflows/ci.yml): `lint` + `test` en push a `main` y en PRs. No hace falta duplicarlo.

### 3. Prompts listos (pegar en Agent)

**Review de branch (humano dispara):**

```text
Revisá los cambios de esta branch vs main.
Checklist: tests Vitest para lógica nueva, no secrets, commerce/ops invariants
(docs/agents + skills sa-commerce/sa-ops), Next 16 docs si tocás APIs.
Devolvé: riesgos, gaps de tests, nitpicks separados.
```

**Bugbot (solo si lo pedís explícito):**

```text
Corré Bugbot sobre los cambios de branch vs main.
Change Description: <1–3 bullets del PR>
```

**Security review (solo si lo pedís explícito):**

```text
Security Review de branch vs main.
Foco: webhook MercadoPago, firmas, OPS_PASSWORD/site gate, tokens Sanity/MP, /api/ops.
```

**CI rojo:**

```text
Usá ci-investigator sobre el PR #<n> check "quality".
Resumen causa raíz + archivo/línea + fix sugerido (sin push).
```

## Cursor Automations (cuando quieras hands-off)

Configurar en la UI de Automations (Agents Window), no como YAML inventado en el repo:

| Automation | Trigger | Acción sugerida |
| --- | --- | --- |
| PR review checklist | PR abierta/actualizada en `elcasu/santo-amore` | Agente comenta riesgos + checklist tests |
| CI triage | Check CI fallido | Mismo prompt de ci-investigator |
| Security on sensitive paths | PR que toca `app/api/mercadopago/**`, `app/api/ops/**`, `proxy.ts` | Security review acotado |

Guardrails:

- Solo comentar / sugerir; **no** merge ni push a `main`.
- No exponer secrets del entorno en el comentario.
- Si el agente propone fix, humano aplica o abre follow-up.

## SDK (opcional, más adelante)

Usar Cursor SDK solo si necesitás el mismo triage desde cron/script fuera del IDE. No es prerequisito de Fase 2.

## Checklist de activación

- [ ] Template de PR en uso
- [ ] Equipo sabe los 4 prompts de arriba
- [ ] (Opcional) Automation PR review en Cursor
- [ ] (Opcional) Automation CI failed → triage
- [ ] Ninguna automation mergea sola
