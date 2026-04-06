import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom"

import HomePage from './pages/home/HomePage'
import Viewer from './components/Viewer'

import './main.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/viewer/:file" element={<Viewer />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)