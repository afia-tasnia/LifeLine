import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import SignUp from './pages/SignUp.jsx'
import DonorProfile from './pages/Donorprofile.jsx'
import ReceiverProfile from './pages/Receiverprofile.jsx'
import HospitalAdmin from './pages/Hospitaladmin.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/donors/:id" element={<DonorProfile />} />
        <Route path="/receivers/:id" element={<ReceiverProfile />} />
        <Route path="/admin" element={<ProtectedRoute><HospitalAdmin /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}