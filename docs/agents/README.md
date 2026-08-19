# Equipo de agentes — Santo Amore

Guía viva del laboratorio de agentes sobre este repo. Objetivo: especializar Cursor primero; automatizar después; agentes de negocio solo con volumen y humano en el loop.

## Vocabulario (Fase 0)

| Concepto | Qué es | Cuándo usarlo | En este proyecto |
| --- | --- | --- | --- |
| **Chat + rules** | Un agente generalista con reglas siempre activas | Tareas ad hoc de código/producto | [`.cursor/rules/`](../../.cursor/rules/), [`AGENTS.md`](../../AGENTS.md), [`docs/PROJECT.md`](../PROJECT.md) |
| **Rule** | Invariante corta que el agente no debe violar | “Siempre tests”, “no secrets”, tokens de marca | `santo-amore.mdc`, `testing.mdc` |
| **Skill** | Procedimiento de dominio que el agente lee al trabajar ese área | Flujos repetibles (commerce, ops) | [`.cursor/skills/sa-commerce`](../../.cursor/skills/sa-commerce/), [`.cursor/skills/sa-ops`](../../.cursor/skills/sa-ops/) |
| **Subagente** | Especialista aislado (Task) con foco acotado | Explorar, review, CI roto, security | `explore`, `bugbot`, `security-review`, `ci-investigator` |
| **Automation** | Agente que se dispara solo (PR, cron, webhook) | Trabajo repetitivo sin que vos abras el chat | Cursor Automations / GitHub Actions — ver [eng-automations.md](./eng-automations.md) |
| **SDK / multi-agente** | Infra propia para lanzar agentes fuera del IDE | Bots internos, cron con Cursor SDK | Solo si Fase 1–2 se quedan chicas |

### Regla práctica

Un agente (o skill) por **dolor recurrente y medible**, no por organigrama. Preferí *humano aprueba* en plata, stock y mensajes a clientes.

### Cuándo alcanza un prompt vs. automatizar

- **Prompt + skill**: lo hacés menos de 2 veces por semana y necesitás juicio.
- **Subagente**: la tarea es exploración/review aislada y no querés contaminar el hilo principal.
- **Automation**: el trigger es claro (PR abierta, CI rojo) y el outcome es checklist/reporte, no deploy autónomo.
- **SDK**: necesitás el mismo agente desde script/CI fuera de Cursor IDE.

## Índice

| Doc | Fase | Contenido |
| --- | --- | --- |
| [playbook-pedido-end-to-end.md](./playbook-pedido-end-to-end.md) | 1 | Checkout → webhook → `/ops` → Chatwoot |
| [practice-subagents.md](./practice-subagents.md) | 1 | Ejercicios con subagentes + bitácora |
| [eng-automations.md](./eng-automations.md) | 2 | Review/security/CI listos para activar |
| [biz-agents.md](./biz-agents.md) | 3 | Reporter métricas, ops asistido, drafts inbox |

## Roles previstos

| Rol | Skill / doc | Momento |
| --- | --- | --- |
| Dev / storefront | `sa-commerce` | Ya |
| Ops / fulfillment | `sa-ops` | Ya (código); volumen real después |
| Review / calidad | [eng-automations.md](./eng-automations.md) | Ritmo de PRs |
| Métricas / atención | [biz-agents.md](./biz-agents.md) | Ventas + Chatwoot vivos |

Contexto de producto y stack: [`docs/PROJECT.md`](../PROJECT.md).
