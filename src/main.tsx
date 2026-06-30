import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import appConfig from './configs/app.config'
import { mockServer } from './mock'
import './index.css'

if (appConfig.enableMock) {
    mockServer({ environment: 'production' })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
