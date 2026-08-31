import React from "react"
import ReactDOM from "react-dom/client"
import { ApplicationShell, MoonWitnessProvider } from "@arsybelovedlabs/moonwitness-design-system"
import "@arsybelovedlabs/moonwitness-design-system/styles.css"
import "@arsybelovedlabs/moonwitness-frontend-platform/component-system.css"
import App from "./ResearchInstrument.jsx"
import SharedInstrumentLayer from "./SharedInstrumentLayer.jsx"
import "./where-myth-dashboard.css"
import "./research-instrument.css"
import "./myth-design-system.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MoonWitnessProvider theme="myth-fade">
      <ApplicationShell
        label="WHERE MYTH FADE TO LEGEND"
        eyebrow="MOONWITNESS / COUNTER-MYTHOS OBSERVATORY"
        status="REPOSITORY / GROUNDED"
        statusTone="success"
        topRail={
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,minWidth:0,fontFamily:"ui-monospace, SFMono-Regular, Menlo, monospace",fontSize:9,letterSpacing:".08em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
            <span style={{color:"var(--mw-accent-secondary)",fontWeight:800}}>EVIDENCE-FIRST</span>
            <i style={{color:"var(--mw-accent-primary)"}}>•</i>
            <strong style={{color:"var(--mw-text-muted)",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis"}}>Temporal/geographic proximity does not establish causation.</strong>
          </div>
        }
      >
        <SharedInstrumentLayer />
        <App />
      </ApplicationShell>
    </MoonWitnessProvider>
  </React.StrictMode>,
)
