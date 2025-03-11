import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router";
import App from './app'
import { Route } from 'react-router';
import { Routes } from 'react-router';
import GeoportalLayout from './pages/geoportal/geoportalLayout';
import { CssBaseline } from '@mui/material';
import View2D from './pages/geoportal/view-2d/view-2d';
import View3D from './pages/geoportal/view-3d/view-3d';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CssBaseline>
      <BrowserRouter>
        <Routes>
          <Route index element={<App />} />
          <Route path='geoportal' element={<GeoportalLayout />} >
            <Route index element={<View2D />} />
            <Route path='3d' element={<View3D />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CssBaseline>
  </StrictMode>
)
