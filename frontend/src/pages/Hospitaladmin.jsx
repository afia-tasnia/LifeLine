import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// ── Mock data (replace with API calls in Phase 5) ─────────────────────────
const MOCK_REQUESTS = [
  {
    _id: "r1",
    patientName: "Adnan Chowdhury",
    bloodGroup: "O+",
    appointment: "Today, 2:30 PM",
    status: "pending",
    hospital: "Dhaka Medical College",
    urgency: "urgent",
  },
  {
    _id: "r2",
    patientName: "Nusrat Jahan",
    bloodGroup: "A−",
    appointment: "Today, 4:00 PM",
    status: "confirmed",
    hospital: "Square Hospital",
    urgency: "normal",
  },
  {
    _id: "r3",
    patientName: "Rakib Hossain",
    bloodGroup: "B+",
    appointment: "Tomorrow, 10:00 AM",
    status: "fulfilled",
    hospital: "Popular Medical",
    urgency: "normal",
  },
  {
    _id: "r4",
    patientName: "Sadia Islam",
    bloodGroup: "AB+",
    appointment: "Tomorrow, 1:00 PM",
    status: "pending",
    hospital: "Ibn Sina Hospital",
    urgency: "urgent",
  },
];

const MOCK_DONORS = [
  { _id: "d1", name: "Ariful Islam", bloodGroup: "O+", donationCount: 14, availability: "available", badge: "Platinum" },
  { _id: "d2", name: "Mehedi Hasan", bloodGroup: "A+", donationCount: 8, availability: "available", badge: "Silver" },
  { _id: "d3", name: "Tania Akter", bloodGroup: "B−", donationCount: 3, availability: "unavailable", badge: "Bronze" },
  { _id: "d4", name: "Zahir Uddin", bloodGroup: "AB+", donationCount: 21, availability: "available", badge: "Platinum" },
];

const STATUS_CONFIG = {
  pending:   { label: "Pending",   bg: "bg-yellow-100", text: "text-yellow-700" },
  confirmed: { label: "Confirmed", bg: "bg-blue-100",   text: "text-blue-700"   },
  fulfilled: { label: "Fulfilled", bg: "bg-green-100",  text: "text-green-700"  },
  cancelled: { label: "Cancelled", bg: "bg-red-100",    text: "text-red-500"    },
};

const BADGE_COLOR = {
  Platinum: "#AF4444",
  Gold:     "#D4AF37",
  Silver:   "#A8A9AD",
  Bronze:   "#CD7F32",
};

export default function HospitalAdmin() {
  const [requests, setRequests] = useState([]);
  const [donors, setDonors] = useState([]);
  const [activeTab, setActiveTab] = useState("schedule"); // "schedule" | "donors"
  const [loading, setLoading] = useState(true);

  // ── Fetch data ──────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      // TODO Phase 5: replace with
      // axios.get("/api/admin/requests").then(r => setRequests(r.data))
      // axios.get("/api/admin/donors").then(r => setDonors(r.data))
      setRequests(MOCK_REQUESTS);
      setDonors(MOCK_DONORS);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────
  function handleStatusChange(id, newStatus) {
    setRequests((prev) =>
      prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
    );
    // TODO Phase 5: axios.put(`/api/admin/requests/${id}`, { status: newStatus })
  }

  function handleRemoveDonor(id) {
    if (!window.confirm("Remove this donor from the registry?")) return;
    setDonors((prev) => prev.filter((d) => d._id !== id));
    // TODO Phase 5: axios.delete(`/api/admin/donors/${id}`)
  }

  // ── Derived stats ────────────────────────────────────────────────────────
  const todayCount    = requests.filter((r) => r.appointment.startsWith("Today")).length;
  const urgentCount   = requests.filter((r) => r.urgency === "urgent").length;
  const availDonors   = donors.filter((d) => d.availability === "available").length;
  const fulfilledCount = requests.filter((r) => r.status === "fulfilled").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center">
        <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 animate-pulse">
          Loading dashboard…
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#3D2B2B]">
      <main className="max-w-5xl mx-auto px-6 py-12">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <header className="flex justify-between items-end mb-12">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-50 mb-1">
              Hospital Portal
            </p>
            <h1 className="text-4xl font-serif">Donation Schedule</h1>
          </div>
          <div className="text-right">
            <span className="text-3xl font-serif text-[#FF6B6B]">{todayCount}</span>
            <p className="text-[9px] uppercase tracking-widest font-bold opacity-60">
              Reservations Today
            </p>
          </div>
        </header>

        {/* ── Stat cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard value={requests.length} label="Total Requests"  accent="#AF4444" />
          <StatCard value={urgentCount}     label="Urgent Cases"    accent="#FF6B6B" />
          <StatCard value={availDonors}     label="Available Donors" accent="#22c55e" />
          <StatCard value={fulfilledCount}  label="Fulfilled Today"  accent="#D4AF37" />
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────── */}
        <div className="flex gap-1 mb-6 bg-white border border-[#3D2B2B]/5 rounded-lg p-1 w-fit shadow-sm">
          {[
            { key: "schedule", label: "Donation Schedule" },
            { key: "donors",   label: "Donor Registry"    },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === key
                  ? "bg-[#3D2B2B] text-white"
                  : "text-[#3D2B2B]/60 hover:text-[#3D2B2B]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Requests table ──────────────────────────────────────────── */}
        {activeTab === "schedule" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#3D2B2B]/5">
            <table className="w-full text-left">
              <thead className="bg-[#3D2B2B] text-white text-[10px] uppercase tracking-widest">
                <tr>
                  {["Donor Name", "Blood Group", "Appointment", "Urgency", "Status", "Action"].map((h) => (
                    <th key={h} className="px-6 py-4 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3D2B2B]/5">
                {requests.map((req) => {
                  const sc = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending;
                  return (
                    <tr key={req._id} className="hover:bg-[#f3a4a3]/10 transition-colors">
                      <td className="px-6 py-5 font-bold">{req.patientName}</td>
                      <td className="px-6 py-5 font-black text-[#FF6B6B]">{req.bloodGroup}</td>
                      <td className="px-6 py-5 text-sm opacity-80">{req.appointment}</td>
                      <td className="px-6 py-5">
                        {req.urgency === "urgent" ? (
                          <span className="px-3 py-1 bg-red-100 text-red-600 text-[9px] rounded-full font-bold uppercase">
                            Urgent
                          </span>
                        ) : (
                          <span className="text-[10px] opacity-40 uppercase font-bold">Normal</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 ${sc.bg} ${sc.text} text-[10px] rounded-full font-bold uppercase`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <select
                          value={req.status}
                          onChange={(e) => handleStatusChange(req._id, e.target.value)}
                          className="text-[10px] font-bold uppercase border border-[#E8E2D9] rounded px-2 py-1 bg-transparent focus:outline-none focus:border-[#AF4444] cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirm</option>
                          <option value="fulfilled">Fulfilled</option>
                          <option value="cancelled">Cancel</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {requests.length === 0 && (
              <div className="py-16 text-center text-[10px] uppercase tracking-widest opacity-30 font-bold">
                No requests found
              </div>
            )}
          </div>
        )}

        {/* ── Donors table ────────────────────────────────────────────── */}
        {activeTab === "donors" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#3D2B2B]/5">
            <table className="w-full text-left">
              <thead className="bg-[#3D2B2B] text-white text-[10px] uppercase tracking-widest">
                <tr>
                  {["Donor Name", "Blood Group", "Donations", "Badge", "Status", "Action"].map((h) => (
                    <th key={h} className="px-6 py-4 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3D2B2B]/5">
                {donors.map((d) => (
                  <tr key={d._id} className="hover:bg-[#f3a4a3]/10 transition-colors">
                    <td className="px-6 py-5 font-bold">{d.name}</td>
                    <td className="px-6 py-5 font-black text-[#FF6B6B]">{d.bloodGroup}</td>
                    <td className="px-6 py-5 text-sm font-bold opacity-70">{d.donationCount}</td>
                    <td className="px-6 py-5">
                      <span
                        className="text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded"
                        style={{
                          color: BADGE_COLOR[d.badge] ?? "#888",
                          backgroundColor: BADGE_COLOR[d.badge] + "22",
                        }}
                      >
                        {d.badge}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {d.availability === "available" ? (
                        <span className="flex items-center gap-1.5 text-green-600 font-bold text-xs">
                          <span className="w-2 h-2 rounded-full bg-green-600" /> Available
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-orange-400 font-bold text-xs">
                          <span className="w-2 h-2 rounded-full bg-orange-400" /> Unavailable
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 flex gap-3">
                      <Link
                        to={`/donors/${d._id}`}
                        className="text-[10px] font-bold uppercase underline hover:text-[#AF4444] transition-colors"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleRemoveDonor(d._id)}
                        className="text-[10px] font-bold uppercase underline hover:text-red-500 transition-colors opacity-50 hover:opacity-100"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {donors.length === 0 && (
              <div className="py-16 text-center text-[10px] uppercase tracking-widest opacity-30 font-bold">
                No donors found
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

// ── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ value, label, accent }) {
  return (
    <div className="bg-white rounded-xl border border-[#3D2B2B]/5 px-5 py-5 shadow-sm">
      <span className="block text-3xl font-serif mb-1" style={{ color: accent }}>
        {value}
      </span>
      <span className="text-[9px] uppercase tracking-widest font-bold opacity-40">
        {label}
      </span>
    </div>
  );
}