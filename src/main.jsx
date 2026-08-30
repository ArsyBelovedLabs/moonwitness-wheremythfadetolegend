import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import MonitorWidget from './components/MonitorWidget.jsx'
import './shadcn.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4 sm:px-6">
      <div className="pointer-events-auto mx-auto max-w-2xl">
        <MonitorWidget />
      </div>
    </div>
  </React.StrictMode>
)
