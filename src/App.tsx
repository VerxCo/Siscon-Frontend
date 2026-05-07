import { ProtectedRoute } from './routes/ProtectedRoute'
import { DashboardPage } from './pages/Dashboard'

function App() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  )
}

export default App