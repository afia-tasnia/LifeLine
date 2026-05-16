import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000/api";

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

function getBadge(count) {
  if (count >= 20) return "Platinum";
  if (count >= 10) return "Gold";
  if (count >= 5)  return "Silver";
  return "Bronze";
}

function formatAppointment(date, time) {
  if (!date || !time) return "—";
  const today    = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [h, m]   = time.split(":").map(Number);
  const suffix   = h >= 12 ? "PM" : "AM";
  const h12      = ((h % 12) || 12);
  const timeLabel = `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
  if (date === today)    return `Today, ${timeLabel}`;
  if (date === tomorrow) return `Tomorrow, ${timeLabel}`;
  return `${date}, ${timeLabel}`;
}

export default function HospitalAdmin() {
  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [reservations, setReservations] = useState([]);
  const [donors, setDonors]             = useState([]);
  const [activeTab, setActiveTab]       = useState("schedule");
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [updatingId, setUpdatingId]     = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [resRes, donorRes] = await Promise.all([
        axios.get(`${API}/reservations`, authHeaders),
        axios.get(`${API}/users/donors`),
      ]);
      setReservations(resRes.data);
      setDonors(donorRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleStatusChange(id, newStatus) {
    setUpdatingId(id);
    try {
      const res = await axios.put(`${API}/reservations/${id}`, { status: newStatus }, authHeaders);
      setReservations((prev) => prev.map((r) => (r._id === id ? { ...r, status: res.data.status } : r)));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  }

  function handleRemoveDonor(id) {
    if (!window.confirm("Remove this donor from view?")) return;
    setDonors((prev) => prev.filter((d) => d._id !== id));
  }

  const todayStr       = new Date().toISOString().slice(0, 10);
  const todayCount     = reservations.filter((r) => r.date === todayStr).length;
  const urgentCount    = reservations.filter((r) => r.urgency === "urgent").length;
  const availDonors    = donors.filter((d) => d.availability === "available").length;
  const fulfilledCount = reservations.filter((r) => r.status === "fulfilled").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center">
        <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 animate-pulse">
          Loading dashboard…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex flex-col items-center justify-center gap-4">
        <span className="text-3xl">⚠️</span>
        <p className="text-sm text-[#AF4444] font-bold uppercase tracking-widest">{error}</p>
        <button onClick={fetchData} className="px-5 py-2 bg-[#3D2B2B] text-white text-[10px] font-bold uppercase tracking-widest rounded">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#3D2B2B]">
      <main className="max-w-5xl mx-auto px-6 py-12">

        <header className="flex justify-between items-end mb-12">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-50 mb-1">Hospital Portal</p>
            <h1 className="text-4xl font-serif">Donation Schedule</h1>
          </div>
          <div className="text-right">
            <span className="text-3xl font-serif text-[#FF6B6B]">{todayCount}</span>
            <p className="text-[9px] uppercase tracking-widest font-bold opacity-60">Reservations Today</p>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard value={reservations.length} label="Total Reservations" accent="#AF4444" />
          <StatCard value={urgentCount}         label="Urgent Cases"       accent="#FF6B6B" />
          <StatCard value={availDonors}         label="Available Donors"   accent="#22c55e" />
          <StatCard value={fulfilledCount}      label="Fulfilled Today"    accent="#D4AF37" />
        </div>

        <div className="flex gap-1 mb-6 bg-white border border-[#3D2B2B]/5 rounded-lg p-1 w-fit shadow-sm">
          {[{ key: "schedule", label: "Donation Schedule" }, { key: "donors", label: "Donor Registry" }].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === key ? "bg-[#3D2B2B] text-white" : "text-[#3D2B2B]/60 hover:text-[#3D2B2B]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Reservations table ── */}
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
                {reservations.map((r) => {
                  const sc = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.pending;
                  return (
                    <tr key={r._id} className="hover:bg-[#f3a4a3]/10 transition-colors">
                      <td className="px-6 py-5 font-bold">
                        {r.name}
                        {r.phone && <span className="block text-[11px] font-normal opacity-50">{r.phone}</span>}
                      </td>
                      <td className="px-6 py-5 font-black text-[#FF6B6B]">{r.bloodGroup}</td>
                      <td className="px-6 py-5 text-sm opacity-80">{formatAppointment(r.date, r.time)}</td>
                      <td className="px-6 py-5">
                        {r.urgency === "urgent" ? (
                          <span className="px-3 py-1 bg-red-100 text-red-600 text-[9px] rounded-full font-bold uppercase">Urgent</span>
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
                          value={r.status}
                          disabled={updatingId === r._id}
                          onChange={(e) => handleStatusChange(r._id, e.target.value)}
                          className="text-[10px] font-bold uppercase border border-[#E8E2D9] rounded px-2 py-1 bg-transparent focus:outline-none focus:border-[#AF4444] cursor-pointer disabled:opacity-40"
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
            {reservations.length === 0 && (
              <div className="py-16 text-center text-[10px] uppercase tracking-widest opacity-30 font-bold">
                No reservations submitted yet
              </div>
            )}
          </div>
        )}

        {/* ── Donors table ── */}
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
                {donors.map((d) => {
                  const badge = getBadge(d.donationCount ?? 0);
                  return (
                    <tr key={d._id} className="hover:bg-[#f3a4a3]/10 transition-colors">
                      <td className="px-6 py-5 font-bold">{d.name}</td>
                      <td className="px-6 py-5 font-black text-[#FF6B6B]">{d.bloodGroup}</td>
                      <td className="px-6 py-5 text-sm font-bold opacity-70">{d.donationCount ?? 0}</td>
                      <td className="px-6 py-5">
                        <span
                          className="text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded"
                          style={{ color: BADGE_COLOR[badge] ?? "#888", backgroundColor: (BADGE_COLOR[badge] ?? "#888") + "22" }}
                        >
                          {badge}
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
                        <Link to={`/donors/${d._id}`} className="text-[10px] font-bold uppercase underline hover:text-[#AF4444] transition-colors">
                          View
                        </Link>
                        <button onClick={() => handleRemoveDonor(d._id)} className="text-[10px] font-bold uppercase underline hover:text-red-500 transition-colors opacity-50 hover:opacity-100">
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {donors.length === 0 && (
              <div className="py-16 text-center text-[10px] uppercase tracking-widest opacity-30 font-bold">
                No donors registered yet
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

function StatCard({ value, label, accent }) {
  return (
    <div className="bg-white rounded-xl border border-[#3D2B2B]/5 px-5 py-5 shadow-sm">
      <span className="block text-3xl font-serif mb-1" style={{ color: accent }}>{value}</span>
      <span className="text-[9px] uppercase tracking-widest font-bold opacity-40">{label}</span>
    </div>
  );
}