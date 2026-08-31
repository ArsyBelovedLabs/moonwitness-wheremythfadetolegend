# MoonWitness Design System Integration

This application consumes the canonical shared UI package from:

- `ArsyBelovedLabs/moonwitness-design-system`
- package: `@arsybelovedlabs/moonwitness-design-system`
- current shared generation: `v0.3.x`
- theme: `myth-fade`

## Runtime boundary

The root is now composed through shared primitives:

```tsx
<MoonWitnessProvider theme="myth-fade">
  <ApplicationShell label="WHERE MYTH FADE TO LEGEND">
    <ResearchInstrument />
  </ApplicationShell>
</MoonWitnessProvider>
```

The shared repository owns semantic tokens, reusable visual primitives, instrument geometry, state/accessibility contracts, signature data visualization, evidence/provenance UI and themes.

This repository continues to own all research data, domain behavior, routing, Leaflet data layers, monthly report logic, correlation/causality calculations, evidence/revelation content and application-specific composition.

The integration does **not** modify the frozen August 2026 data files.

## Shared primitives available for progressive migration

- application: `MoonWitnessProvider`, `ApplicationShell`
- command/navigation: `MissionRail`, `ArchiveGate`, `ActionRail`, `SegmentedRail`, `CommandDeck`
- observatory: `OrbitalCore`, `TemporalOrrery`, `ChronologyTrack`, `MetricRail`, `SignalBeacon`
- evidence: `EvidenceSpine`, `WitnessThread`, `ProvenanceRail`, `ObservationShard`, `ReliabilityPrism`
- geo/causality: `MapRift`, `CausalityGuardrail`, `CausalityLattice`
- data: `TruthAperture`, `SignalWave`, `StateVector`, `EventPulse`
- revelation: `RevelationLens`
- states: `LoadingOrbit`, `EmptySignal`, `StatusMatrix`, `ProgressRail`

Application-local surfaces should migrate progressively when the shared primitive matches their semantics. Do not rewrite working domain behavior merely for visual consistency.

## Visual contract

The application maps its existing research surfaces onto the shared cinematic observatory language:

- obsidian instrument surfaces
- antique bronze rails
- restrained crimson signal states
- sharp/chamfered geometry
- evidence-ledger density
- map-rift presentation
- semantic focus and reduced-motion behavior
- one dominant instrument per major viewport where practical

The research guardrail remains explicit:

> Temporal/geographic proximity does not establish causation.

Application-specific CSS may compose shared semantic tokens. Reusable primitives must be promoted into `moonwitness-design-system` instead of duplicated here.
