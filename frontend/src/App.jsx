import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
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

// Pages that should NOT show the navbar
const NO_NAVBAR = ['/login', '/signup', '/admin']

function Layout() {
  const location = useLocation()
  const showNavbar = !NO_NAVBAR.some(path => location.pathname.startsWith(path))

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/donors" element={<DonorList />} />
        <Route path="/donors/:id" element={<DonorProfile />} />
        <Route path="/blood-list" element={<BloodList />} />

        {/* ── Protected: Donor ── */}
        <Route path="/donor-dashboard" element={
          <ProtectedRoute><DonorProfile /></ProtectedRoute>
        } />

        {/* ── Protected: Receiver ── */}
        <Route path="/dashboard" element={
          <ProtectedRoute><ReceiverProfile /></ProtectedRoute>
        } />
        <Route path="/receivers/:id" element={
          <ProtectedRoute><ReceiverProfile /></ProtectedRoute>
        } />
        <Route path="/request" element={
          <ProtectedRoute><Request /></ProtectedRoute>
        } />

        {/* ── Protected: Hospital Admin ── */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly><HospitalAdmin /></ProtectedRoute>
        } />
        <Route path="/emergency" element={<EmergencyBloodList />} />
        <Route path="/learn-more" element={<LearnMore />} />
        <Route path="/reserve" element={<Reserve />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}