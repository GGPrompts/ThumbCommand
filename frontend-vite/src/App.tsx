import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import TmuxViewer from './pages/TmuxViewer'
import Terminal from './pages/Terminal'

function App() {
  console.log('App component rendering...');

  return (
    <BrowserRouter>
      <div className="dark min-h-screen">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tmux" element={<TmuxViewer />} />
          <Route path="/terminal" element={<Terminal />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
