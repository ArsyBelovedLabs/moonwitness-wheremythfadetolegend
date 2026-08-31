import React from "react"
import ReactDOM from "react-dom/client"
import { MoonWitnessProvider } from "@arsybelovedlabs/moonwitness-design-system"
import "@arsybelovedlabs/moonwitness-design-system/styles.css"
import App from "./ResearchInstrument.jsx"
import "./where-myth-dashboard.css"
import "./research-instrument.css"
import "./myth-design-system.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MoonWitnessProvider theme="myth-fade">
      <App />
    </MoonWitnessProvider>
  </React.StrictMode>,
)
