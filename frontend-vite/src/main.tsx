import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ErrorBoundary from './ErrorBoundary.tsx'
import App from './App.tsx'

// Log any unhandled errors
window.addEventListener('error', (event) => {
  console.error('Unhandled error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

console.log('ThumbCommand frontend starting...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<div style="color: red; padding: 20px;">ERROR: Root element not found!</div>';
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
  console.log('React app mounted successfully');
}
