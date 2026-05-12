import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const BLOOD_GROUPS = ["All Groups", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function BloodList() {
  const [requests, setRequests] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("All Groups");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBloodRequests = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/blood-requests");
        const formattedRequests = response.data.map((req) => ({
          _id: req._id,
          patientName: req.receiverId?.name || "Unknown",
          bloodGroup: req.bloodGroup,
          hospital: req.hospital,
          contact: req.receiverId?.phone || "N/A",
          location: req.location,
          unitsNeeded: req.unitsNeeded,
          deadline: new Date(req.createdAt).toLocaleDateString(),
          urgency: req.isEmergency ? "emergency" : "normal",
        }));
        setRequests(formattedRequests);
      } catch (err) {
        setError("Failed to load blood requests");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBloodRequests();
  }, []);

  const filtered = requests.filter(
    (r) => selectedGroup === "All Groups" || r.bloodGroup === selectedGroup
  );

  return (
    <div className="bg-[#F9F7F2] text-[#3D2B2B] min-h-screen">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="max-w-5xl mx-auto mt-12 mb-12 px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[#E8E2D9] pb-8">
          <div>
            <h1 className="text-4xl font-serif mb-2">Urgent Appeals</h1>
            <p className="text-sm opacity-60">
              Every second counts. View active blood requests in your area.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link to="/emergency">
              <button style={emergencyBtnStyle} className="py-3 px-6 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm flex items-center gap-2 hover:-translate-y-px transition-transform">
                <span style={dotStyle} />
                Emergency Only
              </button>
            </Link>

            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              style={selectStyle}
              className="py-3 pl-6 pr-12 bg-white border border-[#E8E2D9] rounded-full text-[10px] font-bold uppercase tracking-widest cursor-pointer shadow-sm"
            >
              {BLOOD_GROUPS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* ── Cards ───────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto space-y-6 px-4 md:px-8 pb-20">
        {loading ? (
          <div className="py-20 text-center text-[10px] uppercase tracking-widest font-bold opacity-30">
            Loading blood requests...
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-600 text-[10px] uppercase tracking-widest font-bold">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-[10px] uppercase tracking-widest font-bold opacity-30">
            No requests found for {selectedGroup}
          </div>
        ) : (
          filtered.map((req) => (
            <RequestCard key={req._id} request={req} />
          ))
        )}
      </main>
    </div>
  );
}

// ── Request Card ─────────────────────────────────────────────────────────────
function RequestCard({ request }) {
  const isEmergency = request.urgency === "emergency";

  return (
    <div
      className="bg-white p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm rounded-xl group"
      style={isEmergency ? emergencyCardStyle : normalCardStyle}
    >
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-4">
          {isEmergency && (
            <span className="bg-red-600 text-white text-[10px] px-3 py-1 font-bold tracking-widest rounded-full uppercase">
              Emergency
            </span>
          )}
          <h4 className="text-3xl font-serif text-[#3D2B2B]">{request.patientName}</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <p>
            <span className="opacity-50 uppercase text-[10px] font-bold block">Hospital</span>
            <span className="font-medium">{request.hospital}</span>
          </p>
          <p>
            <span className="opacity-50 uppercase text-[10px] font-bold block">Contact</span>
            <span className="font-mono font-bold">{request.contact}</span>
          </p>
          <div className="md:col-span-2">
            <span style={isEmergency ? deadlineEmergencyStyle : deadlineNormalStyle} className="text-xs">
              Need by: {request.deadline}
            </span>
          </div>
        </div>
      </div>

      <div
        className="flex flex-col items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-[5deg]"
        style={groupCircleStyle}
      >
        <span
          className="text-4xl font-bold"
          style={{ color: isEmergency ? "#DC2626" : "#8E4444" }}
        >
          {request.bloodGroup}
        </span>
        <span className="text-[8px] uppercase font-bold opacity-40">Group</span>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const emergencyBtnStyle = {
  border: "1px solid #E8E2D9",
  backgroundColor: "white",
  color: "#3D2B2B",
};

const dotStyle = {
  width: 8,
  height: 8,
  backgroundColor: "#AF4444",
  borderRadius: "50%",
  display: "inline-block",
};

const selectStyle = {
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238E4444'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 1rem center",
  backgroundSize: "1em",
};

const normalCardStyle = {
  border: "1px solid #E8E2D9",
};

const emergencyCardStyle = {
  borderLeft: "8px solid #AF4444",
  background: "linear-gradient(to right, #FFF8F8, #FFFFFF)",
  animation: "heartbeat 2s infinite",
};

const deadlineEmergencyStyle = {
  display: "inline-block",
  padding: "4px 12px",
  backgroundColor: "#FFF5F5",
  border: "1px dashed #EF4444",
  borderRadius: 6,
  fontWeight: 600,
  color: "#B91C1C",
};

const deadlineNormalStyle = {
  display: "inline-block",
  padding: "4px 12px",
  backgroundColor: "#F3E5D0",
  borderRadius: 6,
  fontWeight: 600,
  color: "#AF4444",
};

const groupCircleStyle = {
  width: 80,
  height: 80,
  borderRadius: "50%",
  border: "1px solid #E8E2D9",
  backgroundColor: "#F9F7F2",
  flexShrink: 0,
};