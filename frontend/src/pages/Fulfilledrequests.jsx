import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const BLOOD_GROUPS = ["All Groups", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const API = "http://localhost:5000/api";

export default function FulfilledRequests() {
  const [requests,      setRequests]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All Groups");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // status=completed filters server-side so we only get fulfilled records
        const { data } = await axios.get(`${API}/blood-requests?status=completed`);
        setRequests(data);
      } catch {
        setError("Failed to load fulfilled requests.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = requests.filter(
    (r) => selectedGroup === "All Groups" || r.bloodGroup === selectedGroup
  );

  return (
    <div className="bg-[#F9F7F2] text-[#3D2B2B] min-h-screen">

      {/* Header */}
      <header className="max-w-5xl mx-auto mt-12 mb-12 px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[#E8E2D9] pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Fulfilled
              </span>
            </div>
            <h1 className="text-4xl font-serif mb-2">Fulfilled Requests</h1>
            <p className="text-sm opacity-60">
              Blood requests that have been successfully met — lives saved by donors like you.
            </p>
          </div>

          <div className="flex items-center gap-4">
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

      {/* Summary bar */}
      {!loading && !error && (
        <div className="max-w-5xl mx-auto px-4 md:px-8 mb-6">
          <p className="text-xs font-bold uppercase tracking-widest opacity-40">
            {filtered.length} fulfilled request{filtered.length !== 1 ? "s" : ""}
            {selectedGroup !== "All Groups" ? ` · ${selectedGroup}` : ""}
          </p>
        </div>
      )}

      {/* Cards */}
      <main className="max-w-5xl mx-auto space-y-5 px-4 md:px-8 pb-20">
        {loading ? (
          <div className="py-20 text-center text-[10px] uppercase tracking-widest font-bold opacity-30 animate-pulse">
            Loading…
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-600 text-[10px] uppercase tracking-widest font-bold">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-30">
              No fulfilled requests yet
              {selectedGroup !== "All Groups" ? ` for ${selectedGroup}` : ""}.
            </p>
          </div>
        ) : (
          filtered.map((req) => <FulfilledCard key={req._id} req={req} />)
        )}
      </main>

      {/* Back link */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-12 text-center">
        <Link
          to="/"
          className="text-xs font-bold uppercase tracking-widest text-[#AF4444]/60 hover:text-[#AF4444] transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

// ── Card component ─────────────────────────────────────────────────────────────

function FulfilledCard({ req }) {
  const date = new Date(req.updatedAt || req.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <div
      className="bg-white p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 rounded-xl shadow-sm"
      style={cardStyle}
    >
      <div className="flex-1">
        {/* Patient name */}
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-[9px] font-bold uppercase tracking-widest">
            ✓ Fulfilled
          </span>
          <h4 className="text-xl font-serif text-[#3D2B2B]">
            {req.receiverId?.name || "Anonymous"}
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div>
            <span className="opacity-50 uppercase text-[9px] font-bold block mb-0.5">Hospital</span>
            <span className="font-medium">{req.hospital}</span>
          </div>
          <div>
            <span className="opacity-50 uppercase text-[9px] font-bold block mb-0.5">Location</span>
            <span className="font-medium">{req.location}</span>
          </div>
          <div>
            <span className="opacity-50 uppercase text-[9px] font-bold block mb-0.5">Units donated</span>
            <span className="font-bold text-green-700">{req.unitsNeeded} unit{req.unitsNeeded !== 1 ? "s" : ""}</span>
          </div>
        </div>

        <p className="mt-3 text-[10px] uppercase tracking-widest opacity-40 font-bold">
          Fulfilled on {date}
          {req.isEmergency && (
            <span className="ml-3 text-[#AF4444]">· was emergency</span>
          )}
        </p>
      </div>

      {/* Blood group circle */}
      <div
        className="flex flex-col items-center justify-center flex-shrink-0"
        style={groupCircleStyle}
      >
        <span className="text-3xl font-bold text-green-600">{req.bloodGroup}</span>
        <span className="text-[8px] uppercase font-bold opacity-40">Group</span>
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const cardStyle = {
  border: "1px solid #E8E2D9",
  borderLeft: "6px solid #22c55e",
};

const groupCircleStyle = {
  width: 72,
  height: 72,
  borderRadius: "50%",
  border: "1px solid #E8E2D9",
  backgroundColor: "#F0FDF4",
  flexShrink: 0,
};

const selectStyle = {
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238E4444'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 1rem center",
  backgroundSize: "1em",
};