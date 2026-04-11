import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom"

import HomePage from './pages/home/HomePage'
import ViewerPage from './components/Viewer'

import './main.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/viewer/:file" element={<ViewerPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)