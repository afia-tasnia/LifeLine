import { useState } from "react";

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
    --border:     #E8E2D9;
    --green:      #31a354;
    --blue-role:  #3949ab;
  }

  /* PAGE */
  .ll-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--cream);
    padding: 1.5rem 1rem;
  }

  /* CARD */
  .ll-card {
    width: 100%;
    max-width: 900px;
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 1px solid var(--border);
    overflow: hidden;
    box-shadow: 0 24px 64px rgba(61,43,43,0.10), 0 4px 16px rgba(61,43,43,0.06);
    animation: slideUp 0.85s cubic-bezier(0.23,1,0.32,1) both;
  }
  @media (min-width: 768px) {
    .ll-card { flex-direction: row; min-height: 580px; }
  }
  @keyframes slideUp {
    from { opacity:0; transform:translateY(28px); }
    to   { opacity:1; transform:translateY(0); }
  }

  /* LEFT PANEL */
  .ll-left {
    position: relative;
    background: var(--rose-light);
    padding: 2.5rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    overflow: hidden;
  }
  @media (min-width: 768px) {
    .ll-left { width: 42%; padding: 3rem 2.5rem; gap: 0; justify-content: space-between; }
  }

  .ll-blob {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }
  .ll-blob-1 { width:220px; height:220px; background:rgba(142,68,68,0.12); bottom:-60px; right:-60px; filter:blur(40px); }
  .ll-blob-2 { width:120px; height:120px; background:rgba(142,68,68,0.08); top:-30px; left:-30px; filter:blur(30px); }

  .ll-left-top { position: relative; z-index: 1; }

  .ll-back {
    display: inline-block;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: var(--deep);
    opacity: 0.5;
    text-decoration: none;
    margin-bottom: 2rem;
    transition: opacity 0.2s;
  }
  .ll-back:hover { opacity: 1; }

  .ll-logo {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 600;
    letter-spacing: -0.04em;
    color: var(--deep);
    margin-bottom: 0.75rem;
    line-height: 1;
  }
  .ll-logo-accent {
    font-family: 'Pacifico', cursive;
    font-weight: 400;
    color: var(--rose);
    padding-left: 2px;
  }

  .ll-tagline {
    font-size: 0.83rem;
    line-height: 1.7;
    color: var(--deep);
    opacity: 0.65;
    font-weight: 300;
    max-width: 260px;
  }

  /* ILLUSTRATION */
  .ll-illustration {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 1;
    padding: 0.5rem 0;
  }
  @media (min-width: 768px) { .ll-illustration { flex: 1; } }

  .ll-illustration svg {
    width: 100%;
    max-width: 200px;
    height: auto;
    transition: transform 0.5s ease;
  }
  .ll-illustration svg:hover { transform: scale(1.04); }

  /* SIGN UP */
  .ll-left-bottom { position: relative; z-index: 1; }

  .ll-signup-label {
    display: block;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--deep);
    opacity: 0.7;
    margin-bottom: 0.75rem;
  }
  .ll-signup-btn {
    display: block;
    width: 100%;
    text-align: center;
    padding: 0.875rem;
    border: 1.5px solid rgba(61,43,43,0.35);
    color: var(--deep);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    text-decoration: none;
    background: transparent;
    transition: all 0.3s ease;
  }
  .ll-signup-btn:hover { background: #fff; border-color: var(--deep); }

  /* RIGHT PANEL */
  .ll-right {
    flex: 1;
    padding: 2.5rem 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  @media (min-width: 768px) { .ll-right { padding: 3rem 3.5rem; } }

  .ll-heading {
    font-family: 'Playfair Display', serif;
    font-size: 1.75rem;
    font-weight: 400;
    color: var(--deep);
    margin-bottom: 0.3rem;
    letter-spacing: -0.02em;
  }
  .ll-subheading {
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.06em;
    margin-bottom: 1.75rem;
  }

  /* ROLE PILLS */
  .ll-role-pills {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1.75rem;
  }
  .ll-role-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0.5rem 0.75rem;
    border: 1.5px solid var(--border);
    border-radius: 2px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: var(--muted);
    background: transparent;
    cursor: pointer;
    transition: all 0.22s ease;
    flex: 1;
    min-width: 80px;
    justify-content: center;
    white-space: nowrap;
  }
  .ll-role-pill:hover { border-color: rgba(61,43,43,0.3); color: var(--deep); }

  .pill-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
    transition: background-color 0.2s;
  }

  .ll-role-pill.active-donor    { background:#e8f5e9; border-color:var(--green);     color:#1b5e20; }
  .ll-role-pill.active-receiver { background:#fce4ec; border-color:var(--rose);      color:var(--rose); }
  .ll-role-pill.active-admin    { background:#e8eaf6; border-color:var(--blue-role); color:var(--blue-role); }

  /* FIELDS */
  .ll-field { margin-bottom: 1.35rem; }

  .ll-label {
    display: block;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 0.4rem;
  }
  .ll-input {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--border);
    border-radius: 0;
    padding: 0.65rem 0;
    font-size: 0.875rem;
    color: var(--deep);
    transition: all 0.35s cubic-bezier(0.165,0.84,0.44,1);
  }
  .ll-input::placeholder { color: rgba(61,43,43,0.28); }
  .ll-input:focus { outline:none; border-color:var(--rose); padding-left:8px; }

  /* REMEMBER ROW */
  .ll-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .ll-check-label {
    display: flex; align-items: center; gap: 7px;
    cursor: pointer; user-select: none;
  }
  .ll-checkbox {
    width:13px; height:13px;
    border: 1.5px solid var(--border);
    appearance:none; -webkit-appearance:none;
    cursor:pointer; background:transparent;
    flex-shrink:0; transition:all 0.25s; margin:0;
  }
  .ll-checkbox:checked {
    background-color: var(--deep);
    border-color: var(--deep);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='8' viewBox='0 0 10 8'%3E%3Cpath d='M1 4l3 3 5-6' stroke='white' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat:no-repeat; background-position:center;
  }
  .ll-check-text {
    font-size:9px; font-weight:700;
    letter-spacing:0.15em; text-transform:uppercase;
    color:rgba(61,43,43,0.55);
  }
  .ll-forgot {
    font-size:9px; font-weight:700;
    letter-spacing:0.15em; text-transform:uppercase;
    color:rgba(61,43,43,0.35); text-decoration:none;
    transition:color 0.2s;
  }
  .ll-forgot:hover { color: var(--rose); }

  /* ERROR */
  .ll-error {
    font-size:11px; color:var(--rose);
    letter-spacing:0.04em; margin-bottom:1rem;
    padding:0.55rem 0.75rem;
    background:#fce4ec;
    border-left:3px solid var(--rose);
  }

  /* SUBMIT */
  .ll-submit {
    width:100%; padding:1rem;
    background: var(--rose-light);
    color: var(--deep);
    font-size:9px; font-weight:700;
    letter-spacing:0.3em; text-transform:uppercase;
    border:none; cursor:pointer;
    transition: all 0.3s ease;
  }
  .ll-submit:hover:not(:disabled) {
    background: var(--rose);
    color: #fff;
    letter-spacing: 0.35em;
  }
  .ll-submit:active:not(:disabled) { transform: scale(0.985); }
  .ll-submit:disabled {
    background:var(--rose); color:#fff;
    cursor:not-allowed; opacity:0.75;
  }

  .ll-spinner {
    display:inline-block; width:11px; height:11px;
    border:1.5px solid rgba(255,255,255,0.4);
    border-top-color:#fff; border-radius:50%;
    animation:spin 0.7s linear infinite;
    vertical-align:middle; margin-right:6px;
  }
  @keyframes spin { to { transform:rotate(360deg); } }

  /* FOOTER */
  .ll-divider { height:1px; background:var(--border); margin:1.5rem 0; }

  .ll-footer-text {
    font-size:10px; color:var(--muted);
    text-align:center; letter-spacing:0.04em; line-height:1.8;
  }
  .ll-footer-text a { color:var(--rose); text-decoration:none; font-weight:700; }
  .ll-footer-text a:hover { text-decoration:underline; }
`;

/* ─── Roles ──────────────────────────────────────────────────────────────────── */
const ROLES = [
  { value:"donor",    label:"Donor",         dot:"#31a354", activeClass:"active-donor"    },
  { value:"receiver", label:"Receiver",       dot:"#8E4444", activeClass:"active-receiver" },
  { value:"admin",    label:"Hospital Admin", dot:"#3949ab", activeClass:"active-admin"    },
];

/* ─── Inline blood donation illustration ────────────────────────────────────── */
function BloodIllustration() {
  return (
    <img
      src="/src/assets/images/login_graphic.svg"
      alt="Blood donation illustration"
      style={{ width: "100%", maxWidth: "500px", height: "auto", transition: "transform 0.5s ease", cursor: "pointer" }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    />
  );
}

/* ─── Main component ─────────────────────────────────────────────────────────── */
export default function Login() {
  const [role,     setRole]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!role)               { setError("Please select your role to continue."); return; }
    if (!email || !password) { setError("Please fill in all fields.");            return; }

    setLoading(true);
    try {
      // ── Phase 2: replace with real API call ──────────────────────────
      // const res = await axios.post("/api/auth/login", { email, password, role });
      // localStorage.setItem("token", res.data.token);
      // navigate based on role:
      //   admin    → "/admin"
      //   donor    → "/donor-dashboard"
      //   receiver → "/dashboard"
      // ─────────────────────────────────────────────────────────────────
      await new Promise((r) => setTimeout(r, 1000));
      alert(`Logged in as ${ROLES.find((r) => r.value === role)?.label}`);
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="ll-page">
        <div className="ll-card">

          {/* ── LEFT ─────────────────────────────────────────────── */}
          <div className="ll-left">
            <div className="ll-blob ll-blob-1" />
            <div className="ll-blob ll-blob-2" />

            <div className="ll-left-top">
              {/* Use <Link to="/"> from react-router-dom in production */}
              <a href="/" className="ll-back">← Back to Home</a>
              <div className="ll-logo">
                Life<span className="ll-logo-accent">Line</span>
              </div>
              <p className="ll-tagline">
                Log in to manage your requests or coordinate
                life-saving transfers within your community.
              </p>
            </div>

            <div className="ll-illustration">
              <BloodIllustration />
            </div>

            <div className="ll-left-bottom">
              <span className="ll-signup-label">Need an account?</span>
              <a href="/signup" className="ll-signup-btn">Sign Up Here</a>
            </div>
          </div>

          {/* ── RIGHT ────────────────────────────────────────────── */}
          <div className="ll-right">
            <h2 className="ll-heading">Sign In</h2>
            <p className="ll-subheading">Select your role and enter your credentials</p>

            {/* Role pills */}
            <div className="ll-role-pills">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => { setRole(r.value); setError(""); }}
                  className={`ll-role-pill ${role === r.value ? r.activeClass : ""}`}
                >
                  <span
                    className="pill-dot"
                    style={{ backgroundColor: role === r.value ? r.dot : "var(--border)" }}
                  />
                  {r.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="ll-field">
                <label className="ll-label">Email Address</label>
                <input
                  type="email"
                  className="ll-input"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="ll-field">
                <label className="ll-label">Password</label>
                <input
                  type="password"
                  className="ll-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <div className="ll-row">
                <label className="ll-check-label">
                  <input
                    type="checkbox"
                    className="ll-checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span className="ll-check-text">Remember me</span>
                </label>
                <a href="/forgot-password" className="ll-forgot">Forgot?</a>
              </div>

              {error && <div className="ll-error">{error}</div>}

              <button type="submit" className="ll-submit" disabled={loading}>
                {loading && <span className="ll-spinner" />}
                {loading ? "Signing in…" : "Login"}
              </button>
            </form>

            <div className="ll-divider" />

            <p className="ll-footer-text">
              Don't have an account?{" "}
              <a href="/signup">Create one here</a>
              {" · "}
              <a href="/donor-registration">Register as a Donor</a>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
