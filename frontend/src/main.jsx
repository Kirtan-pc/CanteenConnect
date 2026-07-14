import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Mobile Debugging: Catch early errors
window.onerror = function(msg, url, line, col, error) {
  alert("Error: " + msg + "\nLine: " + line);
};

try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (e) {
  alert("Render Error: " + e.message);
}
