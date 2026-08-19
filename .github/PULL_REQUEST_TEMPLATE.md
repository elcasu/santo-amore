## Summary

<!-- Qué cambia y por qué (1–3 bullets). -->

-

## Test plan

- [ ] `npm test` / lógica nueva tiene `*.test.ts` en `lib/`
- [ ] `npm run lint`
- [ ] Si tocás commerce/checkout/MP: smoke mental del playbook `docs/agents/playbook-pedido-end-to-end.md`
- [ ] Si tocás `/ops` o snapshots: no mutás `saleSnapshot` históricos; offline ≠ `order`
- [ ] Sin secrets (`.env*`, API keys) en el diff

## Agent review (opcional)

Cuando el ritmo de PRs lo justifique, pegar prompts de `docs/agents/eng-automations.md` (review / Bugbot / security / CI).
