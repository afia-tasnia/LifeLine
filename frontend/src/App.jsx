import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import SignUp from './pages/SignUp.jsx'
import DonorProfile from './pages/Donorprofile.jsx'
import ReceiverProfile from './pages/Receiverprofile.jsx'
import HospitalAdmin from './pages/Hospitaladmin.jsx'
import BloodList from './pages/BloodList.jsx'
import Request from './pages/Request.jsx'
import DonorList from './pages/DonorList.jsx'
import EmergencyBloodList from './pages/EmergencyBloodList.jsx'
import LearnMore from './pages/Learnmore.jsx'
import Reserve from './pages/Reserve.jsx'
import FulfilledRequests from './pages/Fulfilledrequests.jsx'
import DonorDonations from './pages/Donordonations.jsx'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages that should NOT show the navbar
const NO_NAVBAR = ['/login', '/signup']

// Redirect /donor-dashboard → /donors/:id using the logged-in user's real _id
function DonorDashboardRedirect() {
  const { user } = useAuth()
  if (!user?._id) return <Navigate to="/login" replace />
  return <Navigate to={`/donors/${user._id}`} replace />
}

function Layout() {
  const location = useLocation()
  const showNavbar = !NO_NAVBAR.some(path => location.pathname.startsWith(path))

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        {/* ── Public ── */}
        <Route path="/"           element={<Home />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/signup"     element={<SignUp />} />
        <Route path="/donors"     element={<DonorList />} />
        <Route path="/donors/:id" element={<DonorProfile />} />
        {/* Donor donation history — public but owner can delete */}
        <Route path="/donor-donations/:id" element={<DonorDonations />} />
        {/* /receivers/:id is public read-only — the page itself gates edit controls */}
        <Route path="/receivers/:id" element={<ReceiverProfile />} />
        <Route path="/learn-more" element={<LearnMore />} />
        {/* Fulfilled requests — public showcase page */}
        <Route path="/fulfilled-requests" element={<FulfilledRequests />} />

        {/* ── Protected: Donor ── */}
        <Route path="/donor-dashboard" element={
          <ProtectedRoute requiredRole="donor">
            <DonorDashboardRedirect />
          </ProtectedRoute>
        } />
        <Route path="/blood-list" element={
          <ProtectedRoute requiredRole="donor"><BloodList /></ProtectedRoute>
        } />
        <Route path="/emergency" element={
          <ProtectedRoute requiredRole="donor"><EmergencyBloodList /></ProtectedRoute>
        } />
        <Route path="/reserve" element={
          <ProtectedRoute requiredRole="donor"><Reserve /></ProtectedRoute>
        } />

        {/* ── Protected: Receiver ── */}
        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="receiver"><ReceiverProfile /></ProtectedRoute>
        } />
        <Route path="/request" element={
          <ProtectedRoute requiredRole={["donor", "receiver"]}><Request /></ProtectedRoute>
        } />

        {/* ── Protected: Hospital Admin ── */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin"><HospitalAdmin /></ProtectedRoute>
        } />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  )
}