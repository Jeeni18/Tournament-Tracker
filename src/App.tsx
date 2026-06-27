import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import FixturesPage from './pages/FixturesPage'
import StandingsPage from './pages/StandingsPage'
import RankingsPage from './pages/RankingsPage'
import BracketPage from './pages/BracketPage'
import TeamDetailPage from './pages/TeamDetailPage'
import OwnerDetailPage from './pages/OwnerDetailPage'
import LoginPage from './pages/LoginPage'
import SearchPage from './pages/SearchPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-[#071A3D] flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/"          element={<HomePage />} />
                <Route path="/fixtures"  element={<FixturesPage />} />
                <Route path="/standings" element={<StandingsPage />} />
                <Route path="/rankings"  element={<RankingsPage />} />
                <Route path="/bracket"   element={<BracketPage />} />
                <Route path="/teams/:id"  element={<TeamDetailPage />} />
                <Route path="/owners/:id" element={<OwnerDetailPage />} />
                <Route path="/login"     element={<LoginPage />} />
                <Route path="/search"    element={<SearchPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
