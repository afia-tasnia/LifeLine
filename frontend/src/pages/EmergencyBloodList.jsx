import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const BLOOD_GROUPS = ["All Groups","A+","A-","B+","B-","O+","O-","AB+","AB-"];

// Map urgency labels for display based on isEmergency flag
const URGENCY_ORDER = { Critical: 0, Immediate: 1, Urgent: 2 };

const URGENCY_STYLES = {
  Critical:  { bg: "#dc2626", label: "#fff", cardBorder: "#dc2626", cardBg: "linear-gradient(to right,#fff5f5,#fff)", pulse: true  },
  Immediate: { bg: "#AF4444", label: "#fff", cardBorder: "#AF4444", cardBg: "linear-gradient(to right,#fff8f8,#fff)", pulse: true  },
  Urgent:    { bg: "#d97706", label: "#fff", cardBorder: "#d97706", cardBg: "linear-gradient(to right,#fffbeb,#fff)", pulse: false },
};

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --blood:  #AF4444;
    --deep:   #3D2B2B;
    --cream:  #F9F7F2;
    --border: #E8E2D9;
    --muted:  rgba(61,43,43,0.5);
  }

  .bl-page {
    min-height: 100vh;
    background: var(--cream);
    font-family: system-ui, sans-serif;
  }

  .bl-header {
    max-width: 1000px; margin: 0 auto;
    padding: 3rem 1.5rem 2rem;
    border-bottom: 1px solid var(--border);
    display: flex; flex-direction: column; gap: 1.5rem;
  }
  @media (min-width: 768px) {
    .bl-header { flex-direction: row; align-items: flex-end; justify-content: space-between; }
  }

  .bl-title-eyebrow {
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.35em; text-transform: uppercase;
    color: #dc2626; margin-bottom: 0.5rem;
    display: flex; align-items: center; gap: 0.5rem;
  }
  .bl-live-dot {
    width: 7px; height: 7px; border-radius: 50%; background: #dc2626;
    animation: blink 1.2s infinite;
  }
  @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.2;} }

  .bl-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 400; color: #b91c1c; margin-bottom: 0.4rem;
  }
  .bl-subtitle { font-size: 0.875rem; color: var(--muted); }

  .bl-controls {
    display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;
  }

  .bl-select {
    padding: 0.65rem 2.5rem 0.65rem 1rem;
    background: #fff; border: 1px solid var(--border);
    border-radius: 999px; font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.12em;
    color: var(--deep); cursor: pointer; outline: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23AF4444'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1em;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    transition: all 0.3s ease;
  }
  .bl-select:hover { border-color: var(--blood); transform: translateY(-1px); }

  .bl-pill-btn {
    padding: 0.65rem 1.25rem;
    border: 1px solid var(--border); border-radius: 999px;
    background: #fff; font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.12em;
    color: var(--deep); cursor: pointer; text-decoration: none;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    transition: all 0.3s ease;
    display: inline-flex; align-items: center;
  }
  .bl-pill-btn:hover { background: var(--deep); color: #fff; border-color: var(--deep); }
  .bl-pill-btn.active { background: var(--deep); color: #fff; border-color: var(--deep); }

  .bl-stats {
    max-width: 1000px; margin: 1.5rem auto 0;
    padding: 0 1.5rem;
    display: flex; gap: 1.5rem; flex-wrap: wrap;
  }
  .bl-stat-chip {
    display: flex; align-items: center; gap: 0.5rem;
    font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--muted);
  }
  .bl-stat-chip span:first-child { font-size: 1.1rem; font-weight: 800; color: var(--deep); }

  .bl-main {
    max-width: 1000px; margin: 2rem auto;
    padding: 0 1.5rem 4rem;
    display: flex; flex-direction: column; gap: 1.25rem;
  }

  .bl-card {
    background: #fff; border-radius: 1rem;
    border-left: 8px solid var(--blood);
    padding: 1.75rem 2rem;
    display: flex; flex-direction: column; gap: 1.25rem;
    box-shadow: 0 2px 12px rgba(61,43,43,0.06);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative; overflow: hidden;
  }
  @media (min-width: 640px) {
    .bl-card { flex-direction: row; align-items: center; }
  }
  .bl-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(61,43,43,0.12);
  }

  .bl-card.pulse { animation: heartbeat 2.2s infinite; }
  @keyframes heartbeat {
    0%   { box-shadow: 0 0 0 0 rgba(175,68,68,0.2); }
    70%  { box-shadow: 0 0 0 16px rgba(175,68,68,0); }
    100% { box-shadow: 0 0 0 0 rgba(175,68,68,0); }
  }

  .bl-rank {
    position: absolute; top: 1rem; right: 1.5rem;
    font-size: 3rem; font-weight: 900;
    color: rgba(61,43,43,0.04); line-height: 1;
    pointer-events: none; user-select: none;
  }

  .bl-card-body { flex: 1; }
  .bl-card-top {
    display: flex; align-items: center; gap: 0.75rem;
    flex-wrap: wrap; margin-bottom: 1rem;
  }

  .bl-urgency-badge {
    font-size: 9px; font-weight: 800; letter-spacing: 0.2em;
    text-transform: uppercase; padding: 3px 10px;
    border-radius: 999px;
  }

  .bl-patient-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.4rem; font-weight: 400; color: var(--deep);
  }

  .bl-card-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 0.75rem 1.5rem; margin-bottom: 0.5rem;
  }

  .bl-field-label {
    display: block; font-size: 9px; font-weight: 700;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--muted); margin-bottom: 2px;
  }
  .bl-field-val { font-size: 0.875rem; font-weight: 500; color: var(--deep); }
  .bl-field-val.contact { font-family: monospace; font-weight: 700; color: #b91c1c; }

  .bl-deadline {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 4px 12px;
    background: #fff5f5; border: 1px dashed #ef4444;
    border-radius: 6px;
    font-size: 11px; font-weight: 600; color: #b91c1c;
    margin-top: 0.75rem;
  }

  .bl-group-wrap {
    display: flex; flex-direction: column;
    align-items: center; gap: 0.5rem;
    flex-shrink: 0;
  }
  .bl-group-circle {
    width: 90px; height: 90px; border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--cream);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    box-shadow: inset 0 0 10px rgba(0,0,0,0.04);
    transition: all 0.4s cubic-bezier(0.165,0.84,0.44,1);
  }
  .bl-card:hover .bl-group-circle {
    border-color: #dc2626;
    box-shadow: 0 0 0 4px rgba(220,38,38,0.08);
  }
  .bl-group-text { font-size: 1.75rem; font-weight: 800; color: #dc2626; line-height: 1; }
  .bl-group-label { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); }
  .bl-units-label { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }

  .bl-respond-btn {
    margin-top: 1rem;
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.6rem 1.5rem;
    background: var(--deep); color: #fff;
    font-size: 9px; font-weight: 700;
    letter-spacing: 0.2em; text-transform: uppercase;
    border: none; border-radius: 0.5rem; cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
  }
  .bl-respond-btn:hover { background: #b91c1c; }

  .bl-empty {
    text-align: center; padding: 4rem 2rem;
    color: var(--muted);
  }
  .bl-empty-icon { font-size: 3rem; margin-bottom: 1rem; }
  .bl-empty-title { font-family:'Playfair Display',serif; font-size:1.5rem; color:var(--deep); margin-bottom:0.5rem; }
  .bl-empty-sub { font-size:0.875rem; }

  .bl-status-msg {
    text-align: center; padding: 4rem 2rem;
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--muted);
  }
  .bl-status-msg.error { color: #dc2626; }
`;

/* ─── Helper: derive urgency label from API data ──────────────────────────── */
function getUrgencyLabel(req) {
  // Derive from real API fields — urgencyLevel doesn't exist on our model
  if (req.isEmergency) return "Critical";
  return "Urgent";
}

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function EmergencyBloodList() {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [bloodFilter, setBloodFilter] = useState("All Groups");

  useEffect(() => {
    const fetchEmergencyRequests = async () => {
      try {
        setLoading(true);
        // Fetch only emergency requests from the API
        const response = await axios.get("http://localhost:5000/api/blood-requests?isEmergency=true");
        const formatted = response.data.map((req) => ({
          id:         req._id,
          name:       req.receiverId?.name || "Unknown",
          bloodGroup: req.bloodGroup,
          hospital:   req.hospital,
          contact:    req.receiverId?.phone || "N/A",
          location:   req.location,
          units:      req.unitsNeeded || 1,
          deadline:   new Date(req.createdAt).toLocaleDateString(),
          urgency:    getUrgencyLabel(req),
          postedMins: Math.floor((Date.now() - new Date(req.createdAt)) / 60000),
        }));
        setRequests(formatted);
      } catch (err) {
        setError("Failed to load emergency requests.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmergencyRequests();
  }, []);

  const filtered = useMemo(() => {
    let list = [...requests];
    if (bloodFilter !== "All Groups") list = list.filter(r => r.bloodGroup === bloodFilter);
    list.sort((a, b) =>
      (URGENCY_ORDER[a.urgency] ?? 9) - (URGENCY_ORDER[b.urgency] ?? 9)
      || a.postedMins - b.postedMins
    );
    return list;
  }, [requests, bloodFilter]);

  const criticalCount  = requests.filter(r => r.urgency === "Critical").length;
  const immediateCount = requests.filter(r => r.urgency === "Immediate").length;
  const urgentCount    = requests.filter(r => r.urgency === "Urgent").length;

  return (
    <>
      <style>{styles}</style>
      <div className="bl-page">

        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <header className="bl-header">
          <div>
            <div className="bl-title-eyebrow">
              <span className="bl-live-dot" /> Live Feed
            </div>
            <h1 className="bl-title">Emergency Wall</h1>
            <p className="bl-subtitle">
              Critical requests requiring immediate action. Every minute counts.
            </p>
          </div>

          <div className="bl-controls">
            <select
              className="bl-select"
              value={bloodFilter}
              onChange={e => setBloodFilter(e.target.value)}
            >
              {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
            </select>

            <button className="bl-pill-btn active">
              🚨 Emergency
            </button>

            <Link to="/blood-list" className="bl-pill-btn">
              All Requests
            </Link>
          </div>
        </header>

        {/* ── STATS STRIP ─────────────────────────────────────────────── */}
        <div className="bl-stats">
          <div className="bl-stat-chip"><span>{criticalCount}</span> Critical</div>
          <div className="bl-stat-chip"><span>{immediateCount}</span> Immediate</div>
          <div className="bl-stat-chip"><span>{urgentCount}</span> Urgent</div>
          <div className="bl-stat-chip"><span>{requests.length}</span> Total Active</div>
        </div>

        {/* ── CARDS ───────────────────────────────────────────────────── */}
        <main className="bl-main">
          {loading ? (
            <div className="bl-status-msg">Loading emergency requests…</div>
          ) : error ? (
            <div className="bl-status-msg error">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="bl-empty">
              <div className="bl-empty-icon">🩸</div>
              <div className="bl-empty-title">No requests found</div>
              <p className="bl-empty-sub">No emergency requests match the selected blood group.</p>
            </div>
          ) : (
            filtered.map((req, idx) => {
              const u = URGENCY_STYLES[req.urgency] || URGENCY_STYLES.Urgent;
              return (
                <div
                  key={req.id}
                  className={`bl-card ${u.pulse ? "pulse" : ""}`}
                  style={{ borderLeftColor: u.cardBorder, background: u.cardBg }}
                >
                  <div className="bl-rank">#{idx + 1}</div>

                  <div className="bl-card-body">
                    <div className="bl-card-top">
                      <span className="bl-urgency-badge" style={{ background: u.bg, color: u.label }}>
                        {req.urgency}
                      </span>
                      <h4 className="bl-patient-name">{req.name}</h4>
                      <span style={{ fontSize:"10px", color:"var(--muted)", marginLeft:"auto" }}>
                        {req.postedMins < 60
                          ? `${req.postedMins} mins ago`
                          : `${Math.floor(req.postedMins / 60)}h ago`}
                      </span>
                    </div>

                    <div className="bl-card-grid">
                      <div>
                        <span className="bl-field-label">Hospital</span>
                        <span className="bl-field-val">{req.hospital}</span>
                      </div>
                      <div>
                        <span className="bl-field-label">Contact</span>
                        <span className="bl-field-val contact">{req.contact}</span>
                      </div>
                    </div>

                    <div className="bl-deadline">
                      ⏰ {req.deadline}
                    </div>

                    <a href={`tel:${req.contact}`} className="bl-respond-btn">
                      🩸 Respond Now
                    </a>
                  </div>

                  <div className="bl-group-wrap">
                    <div className="bl-group-circle">
                      <span className="bl-group-text">{req.bloodGroup}</span>
                      <span className="bl-group-label">Group</span>
                    </div>
                    <span className="bl-units-label">{req.units} unit{req.units > 1 ? "s" : ""} needed</span>
                  </div>
                </div>
              );
            })
          )}
        </main>
      </div>
    </>
  );
}