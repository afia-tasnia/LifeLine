import { useState } from "react";
import signUpVideo    from "../assets/videos/sign_up_video.mp4";
import donorVideo     from "../assets/videos/donor_reg_video.mp4";

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --rose:        #8E4444;
    --rose-light:  #E5C7CE;
    --blue:        #a7d7ec;
    --blue-dark:   #6a97aa;
    --blue-hover:  #8ec3d9;
    --cream:       #F9F7F2;
    --deep:        #3D2B2B;
    --muted:       rgba(61,43,43,0.45);
    --border:      #E8E2D9;
  }

  .su-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--cream);
    padding: 1.5rem 1rem;
    font-family: system-ui, sans-serif;
  }

  .su-card {
    width: 100%;
    max-width: 920px;
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 1px solid var(--border);
    overflow: hidden;
    box-shadow: 0 24px 64px rgba(61,43,43,0.10), 0 4px 16px rgba(61,43,43,0.06);
  }
  @media (min-width: 768px) {
    .su-card { flex-direction: row; min-height: 600px; }
  }

  .su-animate {
    animation: slideUp 0.7s cubic-bezier(0.23,1,0.32,1) both;
  }
  @keyframes slideUp {
    from { opacity:0; transform:translateY(24px); }
    to   { opacity:1; transform:translateY(0); }
  }

  /* ══ STEP 1 — ROLE SELECTION ══════════════════════════════════════════════ */
  .step1-wrap {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3.5rem 2rem;
    text-align: center;
    gap: 2.5rem;
  }

  .step1-logo {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 600;
    letter-spacing: -0.04em;
    color: var(--deep);
  }
  .step1-logo span { color: var(--rose); }

  .step1-heading {
    font-family: 'Playfair Display', serif;
    font-size: 1.6rem;
    font-weight: 400;
    color: var(--deep);
    letter-spacing: -0.02em;
  }
  .step1-sub {
    font-size: 0.82rem;
    color: var(--muted);
    margin-top: 0.4rem;
    letter-spacing: 0.03em;
  }

  .step1-cards {
    display: flex;
    gap: 1.25rem;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
    max-width: 560px;
  }

  .role-card {
    flex: 1;
    min-width: 200px;
    max-width: 240px;
    border: 1.5px solid var(--border);
    padding: 2rem 1.5rem;
    cursor: pointer;
    background: #fff;
    text-align: left;
    transition: all 0.28s ease;
    position: relative;
    overflow: hidden;
  }
  .role-card::before {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 3px;
    transform: scaleX(0);
    transition: transform 0.3s ease;
    transform-origin: left;
  }
  .role-card.donor::before    { background: var(--blue); }
  .role-card.receiver::before { background: var(--rose); }

  .role-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(61,43,43,0.10); }
  .role-card:hover::before { transform: scaleX(1); }

  .role-card.selected.donor    { border-color: var(--blue); background: #f0f9fd; }
  .role-card.selected.receiver { border-color: var(--rose); background: #fdf0f0; }
  .role-card.selected::before  { transform: scaleX(1); }

  .role-icon  { font-size: 1.75rem; margin-bottom: 0.75rem; display: block; }
  .role-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem; font-weight: 600;
    color: var(--deep); margin-bottom: 0.4rem;
  }
  .role-desc  { font-size: 0.75rem; color: var(--muted); line-height: 1.6; }
  .role-badge {
    display: inline-block; margin-top: 0.75rem;
    font-size: 8px; font-weight: 700;
    letter-spacing: 0.15em; text-transform: uppercase;
    padding: 3px 8px; border-radius: 20px;
  }
  .role-card.donor    .role-badge { background: rgba(167,215,236,0.25); color: var(--blue-dark); }
  .role-card.receiver .role-badge { background: rgba(142,68,68,0.10);   color: var(--rose); }

  .step1-continue {
    padding: 0.95rem 3rem;
    background: var(--deep); color: #fff;
    font-size: 9px; font-weight: 700;
    letter-spacing: 0.3em; text-transform: uppercase;
    border: none; cursor: pointer;
    transition: all 0.3s ease;
  }
  .step1-continue:hover:not(:disabled) { background: var(--rose); letter-spacing: 0.35em; }
  .step1-continue:disabled { opacity: 0.35; cursor: not-allowed; }

  .step1-login { font-size: 11px; color: var(--muted); }
  .step1-login a { color: var(--rose); font-weight: 700; text-decoration: none; }
  .step1-login a:hover { text-decoration: underline; }

  /* ══ SHARED LEFT PANEL ════════════════════════════════════════════════════ */
  .su-left {
    position: relative;
    padding: 2.5rem 2rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    color: #fff;
  }
  @media (min-width: 768px) { .su-left { width: 38%; padding: 3rem 2.5rem; } }

  .su-left.donor-theme    { background: #a7d7ec; }
  .su-left.receiver-theme { background: var(--deep); }

  .su-video-overlay { position: absolute; inset: 0; z-index: 0; }
  .su-video-overlay::after {
    content: ''; position: absolute; inset: 0; z-index: 1;
  }
  .su-left.donor-theme    .su-video-overlay::after { background: rgba(137,184,204,0.60); }
  .su-left.receiver-theme .su-video-overlay::after { background: rgba(61,43,43,0.70); }

  .su-video {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    transform: scale(1.25);
    object-position: 50% 50%;
  }

  .su-left-top    { position: relative; z-index: 2; }
  .su-left-bottom { position: relative; z-index: 2; padding-top: 2rem; }

  .su-back {
    display: inline-block;
    font-size: 9px; font-weight: 700;
    letter-spacing: 0.35em; text-transform: uppercase;
    color: #fff; opacity: 0.8;
    background: none; border: none; cursor: pointer;
    padding: 0; margin-bottom: 2rem;
    transition: opacity 0.2s;
  }
  .su-back:hover { opacity: 1; }

  .su-left-logo {
    font-family: 'Playfair Display', serif;
    font-size: 1.6rem; font-weight: 600;
    color: #fff; letter-spacing: -0.03em;
    margin-bottom: 0.5rem;
  }
  .su-left-heading {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem; font-weight: 400;
    line-height: 1.3; margin-bottom: 0.75rem;
  }
  .su-left-tagline {
    font-size: 0.75rem; opacity: 0.9;
    line-height: 1.7; font-weight: 300;
    margin-bottom: 1.25rem;
  }

  .su-perks { list-style: none; display: flex; flex-direction: column; gap: 0.6rem; }
  .su-perks li {
    font-size: 9px; font-weight: 700;
    letter-spacing: 0.15em; text-transform: uppercase;
    opacity: 0.9; display: flex; align-items: center; gap: 0.5rem;
  }

  .su-left-footer {
    font-size: 9px; font-weight: 700;
    letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.75;
  }

  .su-alt-btn {
    display: block; width: 100%; text-align: center;
    padding: 0.875rem;
    border: 1px solid rgba(255,255,255,0.25);
    color: #fff; font-size: 9px; font-weight: 700;
    letter-spacing: 0.25em; text-transform: uppercase;
    text-decoration: none; background: transparent;
    transition: all 0.3s ease; margin-top: 0.75rem;
  }
  .su-alt-btn:hover { background: #fff; color: var(--deep); }
  .su-alt-label {
    font-size: 9px; font-weight: 700;
    letter-spacing: 0.2em; text-transform: uppercase;
    opacity: 0.8; display: block;
  }

  /* ══ RIGHT PANEL ══════════════════════════════════════════════════════════ */
  .su-right {
    flex: 1; padding: 2.5rem 2rem;
    display: flex; flex-direction: column;
    justify-content: center;
    background: #fff; overflow-y: auto;
  }
  @media (min-width: 768px) { .su-right { padding: 3rem 3.5rem; } }

  .su-right-header {
    display: flex; justify-content: space-between;
    align-items: center; margin-bottom: 1.75rem;
  }
  .su-heading {
    font-family: 'Playfair Display', serif;
    font-size: 1.6rem; font-weight: 400;
    color: var(--deep); letter-spacing: -0.02em;
  }
  .su-phase-badge {
    font-size: 8px; font-weight: 700;
    letter-spacing: 0.15em; text-transform: uppercase;
    padding: 4px 10px; border-radius: 20px;
  }
  .su-phase-badge.donor-badge    { background: rgba(167,215,236,0.3); color: var(--blue-dark); }
  .su-phase-badge.receiver-badge { background: rgba(142,68,68,0.10);  color: var(--rose); }

  .su-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem 2rem;
  }
  @media (min-width: 560px) { .su-grid { grid-template-columns: 1fr 1fr; } }
  .su-col-2 { grid-column: 1 / -1; }

  .su-field { display: flex; flex-direction: column; gap: 0.35rem; }

  .su-label {
    font-size: 9px; font-weight: 700;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--muted);
  }
  .su-input, .su-select {
    width: 100%; background: transparent;
    border: none; border-bottom: 1px solid var(--border);
    border-radius: 0; padding: 0.6rem 0;
    font-size: 0.875rem; color: var(--deep);
    transition: all 0.3s ease; appearance: none;
  }
  .su-input::placeholder { color: rgba(61,43,43,0.28); }
  .su-input:focus, .su-select:focus { outline: none; padding-left: 6px; }
  .su-input.donor-focus:focus,  .su-select.donor-focus:focus  { border-color: var(--blue); }
  .su-input.recv-focus:focus,   .su-select.recv-focus:focus   { border-color: var(--rose); }

  .su-check-wrap {
    display: flex; align-items: flex-start;
    gap: 0.75rem; cursor: pointer;
  }
  .su-check-wrap input[type="checkbox"] { margin-top: 2px; flex-shrink: 0; }
  .su-check-text { font-size: 10px; color: var(--muted); line-height: 1.65; }

  .su-error {
    font-size: 11px; color: var(--rose);
    letter-spacing: 0.04em; margin-bottom: 0.75rem;
    padding: 0.5rem 0.75rem; background: #fce4ec;
    border-left: 3px solid var(--rose);
  }

  .su-submit {
    width: 100%; padding: 1rem;
    font-size: 9px; font-weight: 700;
    letter-spacing: 0.3em; text-transform: uppercase;
    border: none; cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 8px 24px rgba(61,43,43,0.12);
    margin-top: 0.25rem;
  }
  .su-submit.donor-btn    { background: var(--blue); color: var(--deep); }
  .su-submit.receiver-btn { background: var(--deep); color: #fff; }
  .su-submit.donor-btn:hover:not(:disabled)    { background: var(--blue-hover); letter-spacing: 0.35em; }
  .su-submit.receiver-btn:hover:not(:disabled) { background: var(--rose);       letter-spacing: 0.35em; }
  .su-submit:disabled { opacity: 0.65; cursor: not-allowed; }

  .su-spinner {
    display: inline-block; width: 11px; height: 11px;
    border: 1.5px solid rgba(255,255,255,0.4);
    border-top-color: #fff; border-radius: 50%;
    animation: spin 0.7s linear infinite;
    vertical-align: middle; margin-right: 6px;
  }
  .su-submit.donor-btn .su-spinner { border-color: rgba(61,43,43,0.3); border-top-color: var(--deep); }
  @keyframes spin { to { transform: rotate(360deg); } }

  .su-divider { height: 1px; background: var(--border); margin: 1.25rem 0; }
  .su-footer-text {
    font-size: 10px; color: var(--muted);
    text-align: center; letter-spacing: 0.04em; line-height: 1.8;
  }
  .su-footer-text a { color: var(--rose); font-weight: 700; text-decoration: none; }
  .su-footer-text a:hover { text-decoration: underline; }

  .su-donor-link {
    display: block; width: fit-content;
    margin: 0.5rem auto 0;
    padding: 0.65rem 1.75rem;
    border: 1.5px solid var(--border);
    color: var(--deep); font-size: 9px; font-weight: 700;
    letter-spacing: 0.18em; text-transform: uppercase;
    text-decoration: none; transition: all 0.3s ease;
  }
  .su-donor-link:hover { border-color: var(--rose); color: var(--rose); }
`;

const BLOOD_GROUPS = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];

/* ─── Step 1: Role Selector ───────────────────────────────────────────────── */
function RoleSelector({ onSelect }) {
  const [selected, setSelected] = useState("");

  return (
    <div className="su-card su-animate">
      <div className="step1-wrap">

        <div className="step1-logo">
          Life<span>Line</span>
        </div>

        <div>
          <h2 className="step1-heading">How would you like to join?</h2>
          <p className="step1-sub">Choose your role to get started</p>
        </div>

        <div className="step1-cards">
          <button
            type="button"
            className={`role-card donor ${selected === "donor" ? "selected" : ""}`}
            onClick={() => setSelected("donor")}
          >
            <span className="role-icon">🩸</span>
            <div className="role-title">Donor</div>
            <div className="role-desc">
              Register to donate blood and receive emergency alerts matching your blood type.
            </div>
            <span className="role-badge">Save Lives</span>
          </button>

          <button
            type="button"
            className={`role-card receiver ${selected === "receiver" ? "selected" : ""}`}
            onClick={() => setSelected("receiver")}
          >
            <span className="role-icon">🏥</span>
            <div className="role-title">Receiver</div>
            <div className="role-desc">
              Create an account to request blood in emergencies and track donor availability.
            </div>
            <span className="role-badge">Find Help</span>
          </button>
        </div>

        <button
          className="step1-continue"
          disabled={!selected}
          onClick={() => onSelect(selected)}
        >
          Continue →
        </button>

        <p className="step1-login">
          Already have an account? <a href="/login">Sign in here</a>
        </p>

      </div>
    </div>
  );
}

/* ─── Step 2a: Donor Form ─────────────────────────────────────────────────── */
function DonorForm({ onBack }) {
  const [form, setForm] = useState({
    fullName: "", email: "", password: "",
    bloodGroup: "A+", lastDonation: "", area: "", agreed: false,
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.fullName || !form.email || !form.password)
      return setError("Please fill in all required fields.");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (!form.agreed)
      return setError("Please confirm the eligibility statement.");
    setLoading(true);
    try {
      // Phase 2: await axios.post("/api/auth/register/donor", form);
      await new Promise(r => setTimeout(r, 1200));
      alert(`Donor application submitted for ${form.fullName}!`);
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="su-card su-animate">
      <div className="su-left donor-theme">
        <div className="su-video-overlay">
          <video autoPlay muted loop playsInline className="su-video">
            <source src={donorVideo} type="video/mp4" />
          </video>
        </div>
        <div className="su-left-top">
          <button className="su-back" onClick={onBack}>← Change Role</button>
          <div className="su-left-logo">LifeLine</div>
          <h2 className="su-left-heading">The Hero's Pledge.</h2>
          <p className="su-left-tagline">
            By registering as a donor, you agree to be contacted for emergency
            blood requests matching your type.
          </p>
          <ul className="su-perks">
            <li><span>✓</span> Real-time Alerts</li>
            <li><span>✓</span> Donor Recognition</li>
            <li><span>✓</span> Track Your Impact</li>
          </ul>
        </div>
        <div className="su-left-bottom">
          <div className="su-left-footer">LifeLine Verified Donor Program</div>
        </div>
      </div>

      <div className="su-right">
        <div className="su-right-header">
          <h3 className="su-heading">Donor Application</h3>
          <span className="su-phase-badge donor-badge">Donor</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="su-grid">
            <div className="su-field">
              <label className="su-label">Full Name</label>
              <input type="text" className="su-input donor-focus" placeholder="John Doe"
                value={form.fullName} onChange={e => set("fullName", e.target.value)} />
            </div>
            <div className="su-field">
              <label className="su-label">Email</label>
              <input type="email" className="su-input donor-focus" placeholder="email@example.com"
                value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
            <div className="su-field">
              <label className="su-label">Password</label>
              <input type="password" className="su-input donor-focus" placeholder="••••••••"
                value={form.password} onChange={e => set("password", e.target.value)} />
            </div>
            <div className="su-field">
              <label className="su-label">Blood Group</label>
              <select className="su-select donor-focus"
                value={form.bloodGroup} onChange={e => set("bloodGroup", e.target.value)}>
                {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="su-field">
              <label className="su-label">Last Donation Date</label>
              <input type="date" className="su-input donor-focus"
                value={form.lastDonation} onChange={e => set("lastDonation", e.target.value)} />
            </div>
            <div className="su-field">
              <label className="su-label">Preferred Hospital / Area</label>
              <input type="text" className="su-input donor-focus" placeholder="e.g. Dhaka Medical College"
                value={form.area} onChange={e => set("area", e.target.value)} />
            </div>
            <div className="su-field su-col-2">
              <label className="su-check-wrap">
                <input type="checkbox" checked={form.agreed}
                  onChange={e => set("agreed", e.target.checked)} />
                <span className="su-check-text">
                  I confirm that I am over 18, weigh more than 45 kg,
                  and am in good health to donate blood.
                </span>
              </label>
            </div>
            {error && <div className="su-error su-col-2">{error}</div>}
            <div className="su-col-2">
              <button type="submit" className="su-submit donor-btn" disabled={loading}>
                {loading && <span className="su-spinner" />}
                {loading ? "Submitting…" : "Submit Application"}
              </button>
            </div>
          </div>
        </form>

        <div className="su-divider" />
        <p className="su-footer-text">
          Already have an account? <a href="/login">Sign in here</a>
          {" · "}
          <a href="/signup">Back to role selection</a>
        </p>
      </div>
    </div>
  );
}

/* ─── Step 2b: Receiver Form ──────────────────────────────────────────────── */
function ReceiverForm({ onBack }) {
  const [fullName, setFullName] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!fullName || !email || !password)
      return setError("Please fill in all fields.");
    if (password.length < 6)
      return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      // Phase 2: await axios.post("/api/auth/register/receiver", { fullName, email, password });
      await new Promise(r => setTimeout(r, 1000));
      alert(`Account created for ${fullName}! Please log in.`);
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="su-card su-animate">
      <div className="su-left receiver-theme">
        <div className="su-video-overlay">
          <video autoPlay muted loop playsInline className="su-video">
            <source src={signUpVideo} type="video/mp4" />
          </video>
        </div>
        <div className="su-left-top">
          <button className="su-back" onClick={onBack}>← Change Role</button>
          <div className="su-left-logo">LifeLine</div>
          <h2 className="su-left-heading">Find Help,<br />When It Matters.</h2>
          <p className="su-left-tagline">
            Creating an account allows you to request blood in emergencies
            and track local donor availability near you.
          </p>
        </div>
        <div className="su-left-bottom">
          <span className="su-alt-label">Already a member?</span>
          <a href="/login" className="su-alt-btn">Log In Instead</a>
        </div>
      </div>

      <div className="su-right">
        <div className="su-right-header">
          <h3 className="su-heading">Create Account</h3>
          <span className="su-phase-badge receiver-badge">Receiver</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="su-field" style={{ marginBottom: "1.4rem" }}>
            <label className="su-label">Full Name</label>
            <input type="text" className="su-input recv-focus" placeholder="John Doe"
              value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>
          <div className="su-field" style={{ marginBottom: "1.4rem" }}>
            <label className="su-label">Email Address</label>
            <input type="email" className="su-input recv-focus" placeholder="email@example.com"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="su-field" style={{ marginBottom: "1.4rem" }}>
            <label className="su-label">Password</label>
            <input type="password" className="su-input recv-focus" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {error && <div className="su-error">{error}</div>}
          <button type="submit" className="su-submit receiver-btn" disabled={loading}>
            {loading && <span className="su-spinner" />}
            {loading ? "Creating Account…" : "Register"}
          </button>
        </form>

        <div className="su-divider" />
        <p className="su-footer-text">Are you here to save lives?</p>
        <a href="/signup" className="su-donor-link" onClick={e => { e.preventDefault(); onBack(); }}>
          Back to Role Selection
        </a>
      </div>
    </div>
  );
}

/* ─── Root Export ─────────────────────────────────────────────────────────── */
export default function SignUp() {
  const [step, setStep] = useState("select");

  return (
    <>
      <style>{styles}</style>
      <div className="su-page">
        {step === "select"   && <RoleSelector onSelect={setStep} />}
        {step === "donor"    && <DonorForm    onBack={() => setStep("select")} />}
        {step === "receiver" && <ReceiverForm onBack={() => setStep("select")} />}
      </div>
    </>
  );
}