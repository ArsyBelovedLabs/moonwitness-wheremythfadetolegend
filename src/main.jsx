import React from "react"
import ReactDOM from "react-dom/client"
import { ApplicationShell, MoonWitnessProvider } from "@arsybelovedlabs/moonwitness-frontend-platform"
import "@arsybelovedlabs/moonwitness-frontend-platform/styles.css"
import "@arsybelovedlabs/moonwitness-frontend-platform/component-system.css"
import App from "./ResearchInstrument.jsx"
import SharedInstrumentLayer from "./SharedInstrumentLayer.jsx"
import ObservatorySceneChrome from "./ObservatorySceneChrome.jsx"
import "./where-myth-dashboard.css"
import "./research-instrument.css"
import "./myth-design-system.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MoonWitnessProvider theme="myth-fade">
      <ApplicationShell
        label="WHERE MYTH FADE TO LEGEND"
        eyebrow="MOONWITNESS / COUNTER-MYTHOS OBSERVATORY"
        status="FROZEN BASELINE / AUGUST 2026"
        statusTone="warning"
        topRail={<ObservatorySceneChrome />}
      >
        <SharedInstrumentLayer />
        <App />
      </ApplicationShell>
    </MoonWitnessProvider>
  </React.StrictMode>,
)
