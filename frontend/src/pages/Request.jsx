import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";

/* ─── Styles ─────────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  :root {
    --rose:       #8E4444;
    --rose-light: #E5C7CE;
    --rose-pale:  #F2DCE0;
    --cream:      #F9F7F2;
    --deep:       #3D2B2B;
    --muted:      rgba(61,43,43,0.45);
    --border:     rgba(61,43,43,0.12);
    --accent:     #FF6B6B;
    --green:      #31a354;
  }

  /* PAGE */
  .rq-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: linear-gradient(to bottom, var(--cream) 0%, #f3a4a3 100%);
    padding: 0 1.25rem 8rem;
    position: relative;
    overflow: hidden;
    color: var(--deep);
    font-family: sans-serif;
  }

  /* BACKGROUND SVG SCENE */
  .rq-bg-scene {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 60vh;
    background-image: url('/src/assets/images/request.svg');
    background-size: cover;
    background-position: bottom center;
    opacity: 0.75;
    mask-image: linear-gradient(to top, black 40%, transparent 100%);
    -webkit-mask-image: linear-gradient(to top, black 40%, transparent 100%);
    pointer-events: none;
    z-index: 0;
  }

  /* FLOATING BLOBS */
  .rq-blob {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }
  .rq-blob-1 {
    width: 340px; height: 340px;
    background: rgba(142,68,68,0.08);
    top: -80px; right: -80px;
    filter: blur(60px);
    animation: blobFloat 8s ease-in-out infinite;
  }
  .rq-blob-2 {
    width: 220px; height: 220px;
    background: rgba(255,107,107,0.07);
    bottom: 30%; left: -60px;
    filter: blur(50px);
    animation: blobFloat 11s ease-in-out infinite reverse;
  }
  @keyframes blobFloat {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-20px); }
  }

  /* HEADER */
  .rq-header {
    position: relative;
    z-index: 1;
    text-align: center;
    padding-top: 3.5rem;
    margin-bottom: 3.5rem;
    animation: fadeDown 0.9s cubic-bezier(0.23,1,0.32,1) both;
  }
  @keyframes fadeDown {
    from { opacity:0; transform:translateY(-18px); }
    to   { opacity:1; transform:translateY(0); }
  }

  .rq-logo {
    display: inline-block;
    font-family: 'Playfair Display', serif;
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--deep);
    opacity: 0.5;
    margin-bottom: 2rem;
    text-decoration: none;
    transition: opacity 0.2s;
  }
  .rq-logo:hover { opacity: 0.85; }
  .rq-logo-accent {
    font-family: 'Pacifico', cursive;
    font-weight: 400;
    color: var(--rose);
  }

  .rq-headline {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.6rem, 8vw, 5rem);
    font-weight: 400;
    line-height: 1.1;
    letter-spacing: -0.03em;
    color: var(--deep);
    margin: 0 0 1.2rem;
  }
  .rq-headline em {
    font-style: italic;
    color: var(--rose);
  }

  .rq-subtext {
    font-size: 0.8rem;
    line-height: 1.75;
    color: var(--deep);
    opacity: 0.6;
    max-width: 320px;
    margin: 0 auto;
    letter-spacing: 0.01em;
  }

  /* URGENCY BANNER */
  .rq-urgency-banner {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: #fff0f0;
    border: 1.5px solid var(--accent);
    padding: 0.7rem 1.2rem;
    margin-bottom: 1.75rem;
    animation: pulseIn 0.4s ease both;
    max-width: 560px;
    width: 100%;
  }
  @keyframes pulseIn {
    from { opacity:0; transform:scale(0.96); }
    to   { opacity:1; transform:scale(1); }
  }
  .rq-urgency-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--accent);
    flex-shrink: 0;
    animation: pulseDot 1.2s ease-in-out infinite;
  }
  @keyframes pulseDot {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.5; transform:scale(1.4); }
  }
  .rq-urgency-text {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--accent);
  }

  /* FORM CARD */
  .rq-form-wrapper {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 560px;
    background: rgba(255,255,255,0.72);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border: 1px solid rgba(255,255,255,0.8);
    padding: 2.5rem 2rem;
    box-shadow: 0 16px 48px rgba(61,43,43,0.09), 0 2px 12px rgba(61,43,43,0.05);
    animation: slideUp 0.85s cubic-bezier(0.23,1,0.32,1) 0.15s both;
  }
  @media (min-width: 600px) {
    .rq-form-wrapper { padding: 3rem 3rem; }
  }
  @keyframes slideUp {
    from { opacity:0; transform:translateY(32px); }
    to   { opacity:1; transform:translateY(0); }
  }

  /* SECTION LABEL */
  .rq-section-label {
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--border);
  }

  /* FIELDS */
  .rq-field { margin-bottom: 1.6rem; }
  .rq-field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.6rem;
  }
  @media (max-width: 480px) {
    .rq-field-row { grid-template-columns: 1fr; }
  }

  .rq-label {
    display: block;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 0.65rem;
  }

  .rq-check-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    cursor: pointer;
    user-select: none;
  }

  .rq-input, .rq-select {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 2px solid var(--border);
    padding: 0.75rem 0;
    font-size: 1rem;
    color: var(--deep);
    font-family: inherit;
    transition: all 0.3s ease;
    outline: none;
  }
  .rq-input::placeholder { color: rgba(61,43,43,0.25); font-size: 0.9rem; }
  .rq-input:focus { border-bottom-color: var(--deep); padding-left: 6px; }

  .rq-select {
    cursor: pointer;
    appearance: none;
    background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="%233D2B2B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>');
    background-repeat: no-repeat;
    background-position: right 0.25rem center;
    background-size: 1rem;
    padding-right: 1.75rem;
  }
  .rq-select:focus { border-bottom-color: var(--deep); }
  .rq-select.emergency { color: var(--accent); font-weight: 700; }

  .rq-textarea {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 2px solid var(--border);
    padding: 0.75rem 0;
    font-size: 0.875rem;
    color: var(--deep);
    font-family: inherit;
    resize: none;
    outline: none;
    transition: border-color 0.3s;
    line-height: 1.65;
    min-height: 72px;
  }
  .rq-textarea::placeholder { color: rgba(61,43,43,0.25); }
  .rq-textarea:focus { border-bottom-color: var(--deep); }

  .rq-char-count {
    font-size: 8px;
    letter-spacing: 0.1em;
    color: var(--muted);
    text-align: right;
    margin-top: 0.3rem;
    opacity: 0.7;
  }

  /* SUBMIT */
  .rq-submit-area {
    padding-top: 2rem;
    text-align: center;
    border-top: 1px solid var(--border);
    margin-top: 0.5rem;
  }

  .rq-submit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1.1rem 3rem;
    background: var(--deep);
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.38em;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.23,1,0.32,1);
    position: relative;
    overflow: hidden;
  }
  .rq-submit::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--accent);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.23,1,0.32,1);
    z-index: 0;
  }
  .rq-submit:hover::before { transform: scaleX(1); }
  .rq-submit:hover { letter-spacing: 0.44em; }
  .rq-submit span { position: relative; z-index: 1; }
  .rq-submit:active { transform: scale(0.982); }
  .rq-submit:disabled { opacity: 0.7; cursor: not-allowed; }
  .rq-submit:disabled::before { display: none; }

  .rq-submit.emergency-submit {
    background: var(--accent);
    animation: emergencyPulse 2s ease-in-out infinite;
  }
  .rq-submit.emergency-submit::before { background: #c0392b; }
  @keyframes emergencyPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(255,107,107,0.4); }
    50%      { box-shadow: 0 0 0 12px rgba(255,107,107,0); }
  }

  .rq-spinner {
    display: inline-block;
    width: 10px; height: 10px;
    border: 1.5px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .rq-caption {
    margin-top: 1rem;
    font-size: 8px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    opacity: 0.6;
    font-weight: 700;
  }

  /* SUCCESS */
  .rq-success {
    position: relative;
    z-index: 1;
    max-width: 480px;
    width: 100%;
    text-align: center;
    background: rgba(255,255,255,0.8);
    backdrop-filter: blur(18px);
    border: 1px solid rgba(255,255,255,0.9);
    padding: 4rem 2.5rem;
    box-shadow: 0 16px 48px rgba(61,43,43,0.09);
    animation: slideUp 0.7s cubic-bezier(0.23,1,0.32,1) both;
    margin-top: 6rem;
  }
  .rq-success-icon {
    width: 56px; height: 56px;
    border-radius: 50%;
    background: #e8f5e9;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
  }
  .rq-success-icon svg { width: 24px; height: 24px; }
  .rq-success-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.9rem;
    font-weight: 400;
    color: var(--deep);
    margin-bottom: 0.75rem;
    letter-spacing: -0.02em;
  }
  .rq-success-body {
    font-size: 0.82rem;
    line-height: 1.75;
    color: var(--muted);
    margin-bottom: 2rem;
  }
  .rq-success-back {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--rose);
    text-decoration: none;
    padding-bottom: 2px;
    border-bottom: 1px solid var(--rose);
    transition: opacity 0.2s;
  }
  .rq-success-back:hover { opacity: 0.7; }

  /* ERROR */
  .rq-error {
    font-size: 11px;
    color: var(--rose);
    letter-spacing: 0.04em;
    margin-bottom: 1.25rem;
    padding: 0.65rem 0.9rem;
    background: #fce4ec;
    border-left: 3px solid var(--rose);
  }
`;

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

function EmergencyCounter({ used, limit, resetInSeconds, formatCountdown }) {
  const remaining = limit - used;
  const pct = (used / limit) * 100;
  const color = remaining === 0 ? "#c0392b" : remaining === 1 ? "#e67e22" : "#27ae60";

  return (
    <div style={{
      background: "rgba(255,255,255,0.7)",
      border: `1px solid ${color}33`,
      borderRadius: 12,
      padding: "12px 16px",
      marginBottom: 16,
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#3D2B2B" }}>
          🚨 Emergency requests today
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>
          {used} / {limit}
        </span>
      </div>
      {/* progress bar */}
      <div style={{ height: 6, borderRadius: 99, background: "#e0e0e0", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, transition: "width 0.4s" }} />
      </div>
      {remaining === 0 ? (
        <span style={{ fontSize: 12, color: "#c0392b" }}>
          Limit reached - resets in {formatCountdown(resetInSeconds)}
        </span>
      ) : (
        <span style={{ fontSize: 12, color: "#666" }}>
          {remaining} emergency request{remaining !== 1 ? "s" : ""} remaining today
          {resetInSeconds > 0 && ` · resets in ${formatCountdown(resetInSeconds)}`}
        </span>
      )}
    </div>
  );
}

export default function Request() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    bloodGroup:   "A+",
    hospital:     "",
    location:     "",
    unitsNeeded:  1,
    isEmergency:  false,
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  const [emergencyUsed,    setEmergencyUsed]    = useState(0);
  const [resetInSeconds,   setResetInSeconds]   = useState(0);
  const EMERGENCY_LIMIT = 3;

  // Fetch today's emergency usage on mount (only if user is logged in)
  useEffect(() => {
    if (!user) return;
    axios
      .get("http://localhost:5000/api/blood-requests/emergency-usage/today", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        setEmergencyUsed(res.data.emergencyRequestsUsed);
        setResetInSeconds(res.data.resetInSeconds);
      })
      .catch(() => {});
  }, [user]);

  // Countdown tick
  useEffect(() => {
    if (resetInSeconds <= 0) return;
    const id = setInterval(() => setResetInSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [resetInSeconds]);

  const formatCountdown = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, "0");
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const set = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.hospital.trim())  { setError("Please enter the hospital or location."); return; }
    if (!form.location.trim())  { setError("Please enter the area/location."); return; }
    if (form.unitsNeeded < 1)   { setError("Please enter units needed (minimum 1)."); return; }

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/blood-requests",
        {
          bloodGroup: form.bloodGroup,
          hospital: form.hospital,
          location: form.location,
          unitsNeeded: parseInt(form.unitsNeeded),
          isEmergency: form.isEmergency,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );
      
      setSuccess(true);

      // Update the counter on success
      if (form.isEmergency) {
        setEmergencyUsed(res.data.emergencyRequestsUsed ?? emergencyUsed + 1);
        if (res.data.resetInSeconds) setResetInSeconds(res.data.resetInSeconds);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit blood request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="rq-page">
        <div className="rq-bg-scene" />
        <div className="rq-blob rq-blob-1" />
        <div className="rq-blob rq-blob-2" />

        {success ? (
          <div className="rq-success">
            <div className="rq-success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#31a354" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="rq-success-title">Request Submitted</h2>
            <p className="rq-success-body">
              Your request for <strong>{form.bloodGroup}</strong> blood ({form.unitsNeeded} units) at <strong>{form.hospital}</strong> has been submitted.
              Donors in <strong>{form.location}</strong> will be notified immediately.{form.isEmergency && " This has been marked as an emergency and escalated to the top of the list."}
            </p>
            <a href="/" className="rq-success-back">Return to Home</a>
          </div>

        ) : (
          <>
            <header className="rq-header">
              <a href="/" className="rq-logo">
                Life<span className="rq-logo-accent">Line</span>
              </a>
              <h1 className="rq-headline">
                Request<br /><em>Support.</em>
              </h1>
              <p className="rq-subtext">
                Fill in the details below. We will notify donors in your immediate area.
              </p>
            </header>

            {form.isEmergency && (
              <div className="rq-urgency-banner">
                <span className="rq-urgency-dot" />
                <span className="rq-urgency-text">
                  Emergency Mode — Nearby donors will be alerted instantly
                </span>
              </div>
            )}

            <div className="rq-form-wrapper">
              <p className="rq-section-label">Blood Request Details</p>

              {/* Emergency Counter inside the card */}
              {form.isEmergency && user && (
                <EmergencyCounter
                  used={emergencyUsed}
                  limit={EMERGENCY_LIMIT}
                  resetInSeconds={resetInSeconds}
                  formatCountdown={formatCountdown}
                />
              )}

              <form onSubmit={handleSubmit}>
                <div className="rq-field-row">
                  <div>
                    <label className="rq-label">Blood Group</label>
                    <select
                      className="rq-select"
                      value={form.bloodGroup}
                      onChange={set("bloodGroup")}
                    >
                      {BLOOD_GROUPS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="rq-label">Units Needed</label>
                    <input
                      type="number"
                      className="rq-input"
                      placeholder="e.g. 2"
                      value={form.unitsNeeded}
                      onChange={set("unitsNeeded")}
                      min="1"
                      max="10"
                    />
                  </div>
                </div>

                <div className="rq-field">
                  <label className="rq-label">Hospital Name</label>
                  <input
                    type="text"
                    className="rq-input"
                    placeholder="e.g. Dhaka Medical College"
                    value={form.hospital}
                    onChange={set("hospital")}
                  />
                </div>

                <div className="rq-field">
                  <label className="rq-label">Location / Area</label>
                  <input
                    type="text"
                    className="rq-input"
                    placeholder="e.g. Dhanmondi, Dhaka"
                    value={form.location}
                    onChange={set("location")}
                  />
                </div>

                <div className="rq-field">
                  <label className="rq-check-label">
                    <input
                      type="checkbox"
                      checked={form.isEmergency}
                      onChange={set("isEmergency")}
                      style={{ width: "18px", height: "18px", cursor: "pointer", marginRight: "8px" }}
                    />
                    <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>
                      Mark as Emergency
                    </span>
                  </label>
                </div>

                {error && <div className="rq-error">{error}</div>}

                <div className="rq-submit-area">
                  <button
                    type="submit"
                    // Disable button when limit reached
                    disabled={loading || (form.isEmergency && emergencyUsed >= EMERGENCY_LIMIT)}
                    className={`rq-submit${form.isEmergency ? " emergency-submit" : ""}`}
                  >
                    {loading ? (
                      <>
                        <span className="rq-spinner" />
                        <span>Sending…</span>
                      </>
                    ) : (
                      <span>
                        {form.isEmergency ? "Send Emergency Request" : "Submit Request"}
                      </span>
                    )}
                  </button>
                  <p className="rq-caption">Every second counts. We are here to help.</p>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  );
}