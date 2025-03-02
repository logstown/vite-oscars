import { Route, Routes } from 'react-router-dom'

import IndexPage from '@/pages/index'
import LoginPage from './pages/login'
import JoinPoolPage from './pages/join-pool'
import HallOfFamePage from './pages/hall-of-fame'
function App() {
  return (
    <>
      <canvas className='absolute' id='my-canvas'></canvas>
      <Routes>
        <Route element={<IndexPage />} path='/' />
        <Route element={<LoginPage />} path='/login' />
        <Route element={<JoinPoolPage />} path='/join-pool/:poolId' />
        <Route element={<HallOfFamePage />} path='/hall-of-fame' />
      </Routes>
    </>
  )
}

export default App
