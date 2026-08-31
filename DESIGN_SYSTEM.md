# MoonWitness UI Integration

## Canonical ownership

The canonical reusable UI/design-system owner is:

- repository: `ArsyBelovedLabs/moonwitness-frontend-platform`
- package: `@arsybelovedlabs/moonwitness-frontend-platform`
- ownership contract: tokens, primitives, reusable patterns and domain-independent UI kits

The existing public prototype package `ArsyBelovedLabs/moonwitness-design-system` is retained only as migration/showcase evidence while `moonwitness-frontend-platform#2` promotes the proven primitives into the canonical owner. It must not become a second design-token or component source of truth.

This app currently pins the verified prototype revision during the cutover so the observable UI can migrate without rewriting research logic. The dependency will switch to `@arsybelovedlabs/moonwitness-frontend-platform` after UI-01 satisfies its package/CI contract.

## Runtime boundary

The root is composed through shared primitives:

```tsx
<MoonWitnessProvider theme="myth-fade">
  <ApplicationShell label="WHERE MYTH FADE TO LEGEND">
    <SharedInstrumentLayer />
    <ResearchInstrument />
  </ApplicationShell>
</MoonWitnessProvider>
```

The shared UI owner is responsible for semantic tokens, reusable visual primitives, instrument geometry, state/accessibility contracts, signature data visualization, evidence/provenance UI and themes.

This repository owns research data, domain behavior, routing, Leaflet data layers, monthly report logic, correlation/causality calculations, evidence/revelation content and application-specific composition.

The integration must not modify frozen August 2026 data files.

## Visible canonical chrome

The visible observatory chrome now maps legacy surfaces onto shared instruments:

- legacy sidebar → `MissionRail`
- legacy search → `ArchiveGate`
- legacy page heading → `InstrumentHeader`
- research state summary → `InspectorDock` + `InspectorRows`
- KPI cards → `TruthAperture` + `MetricRail`
- correlation timeline → `CausalityLattice` + `ChronologyTrack`
- evidence summary → `ProvenanceRail`
- candidate workflow → `WitnessThread`
- disaster context → `MapRift` while the real Leaflet map remains app-owned
- revelation comparison → `RevelationLens` with exactly four repository-backed entries

Legacy DOM is temporarily retained for E2E compatibility and rollback, but is visually demoted. It may be removed only after the canonical consumer cutover has passed regression coverage.

## Visual contract

- obsidian instrument surfaces
- aged ivory text
- antique bronze/gold rails
- restrained crimson product accent for Myth Fade
- sharp/chamfered geometry
- evidence-ledger density
- one dominant instrument per major viewport where practical
- semantic focus-visible behavior
- high-contrast and reduced-motion compatibility

The research guardrail is exact and non-negotiable:

> Temporal/geographic proximity does not establish causation.

Application-specific CSS may compose shared semantic tokens. Reusable primitives belong in `moonwitness-frontend-platform`, not in this application.
