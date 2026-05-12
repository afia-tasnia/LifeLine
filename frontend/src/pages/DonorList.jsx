import { useState, useEffect } from "react";
import axios from "axios";
import DonorCard from "../components/DonorCard.jsx";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const CITIES = ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur", "Mymensingh", "Cumilla"];

// ─────────────────────────────────────────────
// Main page component
// ─────────────────────────────────────────────
export default function DonorList() {
  const [search,      setSearch]      = useState("");
  const [bloodFilter, setBloodFilter] = useState("");
  const [cityFilter,  setCityFilter]  = useState("");
  const [donors,      setDonors]      = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  const hasFilters = search || bloodFilter || cityFilter;

  useEffect(() => {
    const fetchDonors = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (bloodFilter) params.bloodGroup = bloodFilter;
        if (cityFilter) params.location = cityFilter;
        if (search) params.search = search;

        const response = await axios.get("http://localhost:5000/api/donors", { params });
        setDonors(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load donors.");
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, [bloodFilter, cityFilter, search]);

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
                type="button"
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
          {loading ? "Loading donors..." : `${donors.length} donor${donors.length !== 1 ? "s" : ""} found`}
          {hasFilters && !loading && " matching your filters"}
        </div>

        {/* Grid */}
        <main className="dl-grid">
          {loading ? (
            <div className="dl-empty">
              <div className="dl-empty-icon">⏳</div>
              <h3>Loading donors…</h3>
              <p>Please wait while we fetch the latest donor availability.</p>
            </div>
          ) : error ? (
            <div className="dl-empty">
              <div className="dl-empty-icon">⚠️</div>
              <h3>Unable to load donors</h3>
              <p>{error}</p>
            </div>
          ) : donors.length > 0 ? (
            donors.map((donor, i) => (
              <div key={donor._id} style={{ animationDelay: `${i * 45}ms` }}>
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