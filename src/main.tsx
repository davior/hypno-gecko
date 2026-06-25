import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { AboutPage } from './features/about/AboutPage'
import { AffirmationsPage } from './features/affirmations/AffirmationsPage'
import { GeneratorPage } from './features/generator/GeneratorPage'
import { LibraryPage } from './features/library/LibraryPage'
import { SessionPage } from './features/session/SessionPage'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/generator" replace /> },
      { path: 'generator', element: <GeneratorPage /> },
      { path: 'sessions', element: <SessionPage /> },
      { path: 'affirmations', element: <AffirmationsPage /> },
      { path: 'library', element: <LibraryPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <Navigate to="/generator" replace /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
