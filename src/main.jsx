import React from "react"
import ReactDOM from "react-dom/client"
import { ApplicationShell, MoonWitnessProvider } from "@arsybelovedlabs/moonwitness-design-system"
import "@arsybelovedlabs/moonwitness-design-system/styles.css"
import App from "./ResearchInstrument.jsx"
import "./where-myth-dashboard.css"
import "./research-instrument.css"
import "./myth-design-system.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MoonWitnessProvider theme="myth-fade">
      <ApplicationShell label="WHERE MYTH FADE TO LEGEND" eyebrow="MOONWITNESS / COUNTER-MYTHOS OBSERVATORY">
        <App />
      </ApplicationShell>
    </MoonWitnessProvider>
  </React.StrictMode>,
)
