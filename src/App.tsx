import { Route, Routes } from 'react-router-dom'

import IndexPage from '@/pages/index'
import LoginPage from './pages/login'
import JoinPoolPage from './pages/join-pool'

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path='/' />
      <Route element={<LoginPage />} path='/login' />
      <Route element={<JoinPoolPage />} path='/join-pool/:poolId' />
    </Routes>
  )
}

export default App
