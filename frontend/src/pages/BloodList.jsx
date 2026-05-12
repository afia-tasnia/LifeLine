import { useState } from "react";
import { Link } from "react-router-dom";

// ── Mock data (replace with API in Phase 4) ───────────────────────────────
const MOCK_REQUESTS = [
  { _id: "r1", patientName: "Rahman Ali",       bloodGroup: "B+",  hospital: "Dhaka Medical College",          contact: "+880 1700-112233", deadline: "Today, before 4:00 PM",  urgency: "emergency" },
  { _id: "r2", patientName: "Sultana Kamal",     bloodGroup: "O-",  hospital: "Evercare Hospital",               contact: "+880 1811-445566", deadline: "25 March, 10:00 AM",     urgency: "normal" },
  { _id: "r3", patientName: "Tanvir Ahmed",      bloodGroup: "A-",  hospital: "Sylhet MAG Osmani",               contact: "+880 1912-778899", deadline: "26 March, Evening",      urgency: "normal" },
  { _id: "r4", patientName: "Mehedi Hasan",      bloodGroup: "AB+", hospital: "Rajshahi Medical College",        contact: "+880 1515-223344", deadline: "28 March, 9:00 AM",      urgency: "normal" },
  { _id: "r5", patientName: "Nusrat Jahan",      bloodGroup: "O+",  hospital: "Khulna City Hospital",            contact: "+880 1313-556677", deadline: "Tomorrow, 11:30 AM",     urgency: "normal" },
  { _id: "r6", patientName: "Kamrul Hasan",      bloodGroup: "B-",  hospital: "Sher-e-Bangla Medical",           contact: "+880 1717-889900", deadline: "30 March, Morning",      urgency: "normal" },
  { _id: "r7", patientName: "Ayesha Siddiqua",   bloodGroup: "A+",  hospital: "Rangpur Medical College",         contact: "+880 1616-112244", deadline: "24 March, 12:00 PM",     urgency: "normal" },
  { _id: "r8", patientName: "Rafiqul Islam",     bloodGroup: "AB-", hospital: "Mymensingh Medical",              contact: "+880 1414-334455", deadline: "01 April, 10:00 AM",     urgency: "normal" },
  { _id: "r9", patientName: "Fahim Muntassir",   bloodGroup: "O+",  hospital: "Cumilla Central Hospital",        contact: "+880 1818-667788", deadline: "29 March, 11:00 AM",     urgency: "normal" },
  { _id: "r10", patientName: "Tasnim Ara",       bloodGroup: "B+",  hospital: "Sheikh Fazilatunnessa Memorial",  contact: "+880 1712-445892", deadline: "Tomorrow, 2:00 PM",      urgency: "normal" },
];

const BLOOD_GROUPS = ["All Groups", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function BloodList() {
  const [selectedGroup, setSelectedGroup] = useState("All Groups");

  // TODO Phase 4: replace MOCK_REQUESTS with API fetch
  // useEffect(() => { axios.get("/api/requests").then(r => setRequests(r.data)) }, [])

  const filtered = MOCK_REQUESTS.filter(
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
            {/* Emergency only link */}
            <Link to="/emergency">
              <button style={emergencyBtnStyle} className="py-3 px-6 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm flex items-center gap-2 hover:-translate-y-px transition-transform">
                <span style={dotStyle} />
                Emergency Only
              </button>
            </Link>

            {/* Blood group filter */}
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
        {filtered.length === 0 ? (
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
        {/* Name row */}
        <div className="flex items-center gap-4 mb-4">
          {isEmergency && (
            <span className="bg-red-600 text-white text-[10px] px-3 py-1 font-bold tracking-widest rounded-full uppercase">
              Emergency
            </span>
          )}
          <h4 className="text-3xl font-serif text-[#3D2B2B]">{request.patientName}</h4>
        </div>

        {/* Details grid */}
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

      {/* Blood group circle */}
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

// ── Styles (mirrors blood_list.css) ──────────────────────────────────────────

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