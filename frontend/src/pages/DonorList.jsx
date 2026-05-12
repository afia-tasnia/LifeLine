import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

// ─────────────────────────────────────────────
// Static donor data — replace with API call in Phase 3
// GET /api/donors  →  swap DONORS array with response data
// ─────────────────────────────────────────────
const DONORS = [
  { id: 1,  name: "Ariful Islam",     city: "Dhaka",      bloodGroup: "O+",  status: "Available", lastDonation: "14 Oct 2025", donations: 14, badge: "Platinum" },
  { id: 2,  name: "Sarah Khan",       city: "Chittagong", bloodGroup: "A-",  status: "Away",      lastDonation: "02 Jan 2026", donations: 11, badge: "Gold"     },
  { id: 3,  name: "Tanvir Ahmed",     city: "Sylhet",     bloodGroup: "B+",  status: "Available", lastDonation: "20 Dec 2025", donations: 7,  badge: "Silver"   },
  { id: 4,  name: "Mehedi Hasan",     city: "Rajshahi",   bloodGroup: "AB+", status: "Available", lastDonation: "15 Feb 2026", donations: 3,  badge: "Bronze"   },
  { id: 5,  name: "Nafisa Alam",      city: "Dhaka",      bloodGroup: "O-",  status: "Available", lastDonation: "10 Nov 2025", donations: 16, badge: "Platinum" },
  { id: 6,  name: "Raihan Hossain",   city: "Khulna",     bloodGroup: "A+",  status: "Away",      lastDonation: "05 Mar 2026", donations: 9,  badge: "Silver"   },
  { id: 7,  name: "Priya Das",        city: "Barisal",    bloodGroup: "B-",  status: "Available", lastDonation: "28 Jan 2026", donations: 12, badge: "Gold"     },
  { id: 8,  name: "Fahim Muntassir",  city: "Cumilla",    bloodGroup: "O+",  status: "Available", lastDonation: "18 Feb 2026", donations: 2,  badge: "Bronze"   },
  { id: 9,  name: "Tasnim Ara",       city: "Dhaka",      bloodGroup: "B+",  status: "Available", lastDonation: "01 Mar 2026", donations: 4,  badge: "Bronze"   },
  { id: 10, name: "Imtiaz Ahmed",     city: "Chittagong", bloodGroup: "A-",  status: "Available", lastDonation: "New Donor",   donations: 0,  badge: "Verified" },
  { id: 11, name: "Sultan Mahmud",    city: "Sylhet",     bloodGroup: "O-",  status: "Available", lastDonation: "10 Jan 2026", donations: 11, badge: "Gold"     },
  { id: 12, name: "Zubayer Al-Mahmud",city: "Rajshahi",   bloodGroup: "AB+", status: "Available", lastDonation: "25 Oct 2025", donations: 18, badge: "Platinum" },
  { id: 13, name: "Sumaiya Akter",    city: "Khulna",     bloodGroup: "B-",  status: "Available", lastDonation: "14 Feb 2026", donations: 3,  badge: "Bronze"   },
  { id: 14, name: "Hasan Mahmud",     city: "Barisal",    bloodGroup: "A+",  status: "Away",      lastDonation: "02 Dec 2025", donations: 0,  badge: "Verified" },
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const CITIES = ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur", "Mymensingh", "Cumilla"];

// Badge style map — mirrors your donor_list.css
const BADGE_STYLES = {
  Platinum: { background: "linear-gradient(135deg,#e5e4e2,#ffffff)", color: "#4a4a4a" },
  Gold:     { background: "linear-gradient(135deg,#d4af37,#f9f295)", color: "#5c441a" },
  Silver:   { background: "linear-gradient(135deg,#c0c0c0,#e8e8e8)", color: "#333"    },
  Bronze:   { background: "linear-gradient(135deg,#cd7f32,#f5d1b0)", color: "#4d2600" },
  Verified: { background: "#f3f4f6",                                  color: "#6b7280", border: "1px solid #e5e7eb" },
};

// Initials helper
function initials(name) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

// Individual donor card
function DonorCard({ donor }) {
  const badge  = BADGE_STYLES[donor.badge] ?? BADGE_STYLES.Verified;
  const avail  = donor.status === "Available";

  return (
    <div className="dl-card">
      {/* Badge ribbon */}
      <div className="dl-card-badge" style={badge}>{donor.badge}</div>

      {/* Top row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <h4 style={{ fontFamily:"'Lora',serif", fontSize:"1.15rem", color:"#3D2B2B", margin:"0 0 4px" }}>
            {donor.name}
          </h4>
          <p style={{ fontSize:10, opacity:.5, margin:0, letterSpacing:".05em" }}>📍 {donor.city}</p>
        </div>
        {/* Blood group circle */}
        <div style={{
          width:48, height:48, borderRadius:"50%",
          background:"rgba(167,215,236,.15)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontWeight:700, fontSize:13, color:"#3D2B2B", flexShrink:0
        }}>
          {donor.bloodGroup}
        </div>
      </div>

      {/* Details */}
      <div style={{ fontSize:12, display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <span style={{ opacity:.6 }}>Status</span>
          <span style={{
            fontWeight:700,
            color: donor.status === "Available" ? "#16a34a"
                 : donor.status === "Away"      ? "#d97706"
                 : "#dc2626"
          }}>
            {donor.status}
          </span>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <span style={{ opacity:.6 }}>Donations</span>
          <span style={{ fontWeight:700 }}>{donor.donations}</span>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <span style={{ opacity:.6 }}>Last Donation</span>
          <span>{donor.lastDonation}</span>
        </div>
      </div>

      {/* CTA */}
      {avail ? (
        <Link
          to={`/donors/${donor.id}`}
          style={{
            display:"block", textAlign:"center",
            padding:"12px 20px",
            background:"#3D2B2B", color:"#fff",
            fontSize:10, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase",
            textDecoration:"none", borderRadius:8,
            transition:"background .2s, transform .15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background="#000"; e.currentTarget.style.transform="translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background="#3D2B2B"; e.currentTarget.style.transform="translateY(0)"; }}
        >
          See Profile
        </Link>
      ) : (
        <button disabled style={{
          width:"100%", padding:"12px 20px",
          background:"#F9F7F2", color:"#3D2B2B",
          fontSize:10, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase",
          border:"1px solid #E8E2D9", borderRadius:8,
          opacity:.45, cursor:"not-allowed",
        }}>
          Currently Away
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main page component
// ─────────────────────────────────────────────
export default function DonorList() {
  const [search,      setSearch]      = useState("");
  const [bloodFilter, setBloodFilter] = useState("");
  const [cityFilter,  setCityFilter]  = useState("");

  // Live filtering — no API call needed here, just client-side for static data
  // In Phase 3: debounce search and hit GET /api/donors?bloodGroup=X&city=Y&name=Z
  const filtered = useMemo(() => {
    return DONORS.filter(d => {
      const matchName  = d.name.toLowerCase().includes(search.toLowerCase());
      const matchBlood = bloodFilter ? d.bloodGroup === bloodFilter : true;
      const matchCity  = cityFilter  ? d.city        === cityFilter  : true;
      return matchName && matchBlood && matchCity;
    });
  }, [search, bloodFilter, cityFilter]);

  const hasFilters = search || bloodFilter || cityFilter;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap');

        .dl-page {
          background: #F9F7F2;
          color: #3D2B2B;
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Header ── */
        .dl-header {
          max-width: 1200px; margin: 0 auto;
          padding: 64px 32px 40px;
          display: flex; flex-wrap: wrap;
          justify-content: space-between; align-items: flex-end; gap: 24px;
        }
        .dl-header h1 {
          font-family: 'Lora', serif;
          font-size: clamp(2rem, 4vw, 2.8rem);
          margin: 0 0 6px; color: #3D2B2B;
        }
        .dl-header p { font-size: 13px; opacity: .55; margin: 0; }

        /* ── Search + filter bar ── */
        .dl-controls {
          display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
        }
        .dl-input {
          padding: 11px 20px;
          border: 1px solid #E8E2D9; border-radius: 99px;
          font-size: 13px; font-family: 'DM Sans', sans-serif;
          background: #fff; outline: none;
          transition: border-color .2s, box-shadow .2s;
          width: 220px;
        }
        .dl-input:focus {
          border-color: #a7d7ec;
          box-shadow: 0 0 0 4px rgba(167,215,236,.18);
        }
        .dl-select {
          padding: 11px 20px;
          border: 1px solid #E8E2D9; border-radius: 99px;
          font-size: 13px; font-family: 'DM Sans', sans-serif;
          background: #fff; outline: none; cursor: pointer;
          transition: border-color .2s;
          appearance: none; -webkit-appearance: none;
          padding-right: 36px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%233D2B2B' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
        }
        .dl-select:focus { border-color: #a7d7ec; }

        .dl-clear-btn {
          padding: 11px 18px; border-radius: 99px;
          border: 1px dashed #E8E2D9; background: transparent;
          font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
          color: #8E4444; cursor: pointer; transition: border-color .2s, background .2s;
        }
        .dl-clear-btn:hover { border-color: #8E4444; background: #fff5f5; }

        /* ── Result count ── */
        .dl-count {
          max-width: 1200px; margin: 0 auto;
          padding: 0 32px 20px;
          font-size: 12px; opacity: .5; font-weight: 600; letter-spacing: .05em;
        }

        /* ── Grid ── */
        .dl-grid {
          max-width: 1200px; margin: 0 auto;
          padding: 0 32px 80px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        /* ── Card ── */
        .dl-card {
          background: #fff;
          border: 1px solid #E8E2D9;
          border-radius: 16px;
          padding: 32px 28px 28px;
          position: relative; overflow: hidden;
          transition: transform .35s cubic-bezier(.165,.84,.44,1),
                      box-shadow .35s cubic-bezier(.165,.84,.44,1);
          animation: cardFade .45s ease both;
        }
        @keyframes cardFade {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .dl-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,.07);
        }

        .dl-card-badge {
          position: absolute; top: 0; right: 0;
          padding: 5px 14px;
          font-size: 9px; font-weight: 800;
          letter-spacing: .14em; text-transform: uppercase;
          border-bottom-left-radius: 10px;
        }

        /* ── Empty state ── */
        .dl-empty {
          grid-column: 1 / -1;
          text-align: center; padding: 80px 20px;
          opacity: .45;
        }
        .dl-empty-icon { font-size: 3rem; margin-bottom: 16px; }
        .dl-empty h3 { font-family:'Lora',serif; font-size:1.4rem; margin:0 0 8px; }
        .dl-empty p  { font-size:13px; }

        /* ── Responsive ── */
        @media (max-width: 1024px) { .dl-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 640px)  {
          .dl-grid    { grid-template-columns: 1fr; padding: 0 16px 60px; }
          .dl-header  { padding: 48px 16px 32px; }
          .dl-count   { padding: 0 16px 16px; }
          .dl-input   { width: 100%; }
        }
      `}</style>

      <div className="dl-page">
        {/* ── Header ── */}
        <header className="dl-header">
          <div>
            <h1>Find a Hero</h1>
            <p>Search through our verified community of donors.</p>
          </div>

          {/* Controls */}
          <div className="dl-controls">
            <input
              type="text"
              className="dl-input"
              placeholder="Search by name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            <select
              className="dl-select"
              value={bloodFilter}
              onChange={e => setBloodFilter(e.target.value)}
            >
              <option value="">Blood Group</option>
              {BLOOD_GROUPS.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>

            <select
              className="dl-select"
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
            >
              <option value="">Select City</option>
              {CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {hasFilters && (
              <button
                className="dl-clear-btn"
                onClick={() => { setSearch(""); setBloodFilter(""); setCityFilter(""); }}
              >
                ✕ Clear
              </button>
            )}
          </div>
        </header>

        {/* Result count */}
        <div className="dl-count">
          {filtered.length} donor{filtered.length !== 1 ? "s" : ""} found
          {hasFilters && " matching your filters"}
        </div>

        {/* Grid */}
        <main className="dl-grid">
          {filtered.length > 0 ? (
            filtered.map((donor, i) => (
              <div key={donor.id} style={{ animationDelay: `${i * 45}ms` }}>
                <DonorCard donor={donor} />
              </div>
            ))
          ) : (
            <div className="dl-empty">
              <div className="dl-empty-icon">🩸</div>
              <h3>No donors found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}