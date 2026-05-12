import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logoSvg from "../assets/images/logo.svg";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');

  :root {
    --vintage-rose: #8E4444;
    --cream-bg:     #F9F7F2;
    --deep-text:    #3D2B2B;
  }

  .nav-root {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(249,247,242,0.95);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid #E8E2D9;
    padding: 0.75rem 1rem;
    font-family: system-ui, sans-serif;
  }
  @media (min-width: 768px) { .nav-root { padding: 1.25rem 2rem; } }

  .nav-inner {
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* LOGO */
  .nav-logo-wrap { display: flex; align-items: center; gap: 0; text-decoration: none; }
  .nav-logo-img  { height: 2rem; width: auto; object-fit: contain; }
  @media (min-width: 768px) { .nav-logo-img { height: 2.5rem; } }

  .nav-brand {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: -0.04em;
    color: var(--deep-text);
    line-height: 1;
  }
  @media (min-width: 768px) { .nav-brand { font-size: 1.75rem; } }

  .nav-brand-accent {
    color: var(--vintage-rose);
    font-family: 'Pacifico', cursive;
    font-weight: 400;
    padding-left: 2px;
  }

  /* LINKS */
  .nav-links {
    display: none;
    align-items: center;
    gap: 2.5rem;
    list-style: none;
    margin: 0; padding: 0;
  }
  @media (min-width: 768px) { .nav-links { display: flex; } }

  .nav-link {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: var(--deep-text);
    text-decoration: none;
    position: relative;
    transition: color 0.3s ease;
  }
  .nav-link::after {
    content: '';
    position: absolute;
    width: 0; height: 1px;
    bottom: -2px; left: 0;
    background-color: var(--vintage-rose);
    transition: width 0.3s ease;
  }
  .nav-link:hover { color: var(--vintage-rose); }
  .nav-link:hover::after { width: 100%; }
  .nav-link.active { color: var(--vintage-rose); }
  .nav-link.active::after { width: 100%; }

  /* ACTIONS */
  .nav-actions { display: flex; align-items: center; gap: 1rem; }
  @media (min-width: 768px) { .nav-actions { gap: 1.5rem; } }

  .nav-login {
    display: none;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--vintage-rose);
    text-decoration: none;
    transition: opacity 0.2s;
  }
  .nav-login:hover { opacity: 0.7; }
  @media (min-width: 576px) { .nav-login { display: block; } }

  .nav-user {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--deep-text);
    white-space: nowrap;
  }
  @media (min-width: 576px) { .nav-user { display: block; } }

  .nav-cta {
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    background: var(--vintage-rose);
    color: var(--cream-bg);
    border: none;
    padding: 0.6rem 1rem;
    border-radius: 10px;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.4s cubic-bezier(0.165,0.84,0.44,1);
    box-shadow: 0 4px 6px -1px rgba(142,68,68,0.2);
    white-space: nowrap;
  }
  @media (min-width: 768px) { .nav-cta { padding: 0.75rem 1.75rem; font-size: 10px; } }
  .nav-cta:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 12px 25px rgba(142,68,68,0.35);
    filter: brightness(1.1);
  }

  /* MOBILE MENU */
  .nav-burger {
    display: flex;
    flex-direction: column;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
  }
  @media (min-width: 768px) { .nav-burger { display: none; } }

  .nav-burger span {
    display: block;
    width: 22px; height: 2px;
    background: var(--deep-text);
    border-radius: 2px;
    transition: all 0.3s ease;
  }
  .nav-burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .nav-burger.open span:nth-child(2) { opacity: 0; }
  .nav-burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  .nav-mobile {
    display: none;
    flex-direction: column;
    gap: 0;
    border-top: 1px solid #E8E2D9;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
  }
  .nav-mobile.open { display: flex; }
  @media (min-width: 768px) { .nav-mobile { display: none !important; } }

  .nav-mobile-link {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: var(--deep-text);
    text-decoration: none;
    padding: 0.75rem 0;
    border-bottom: 1px solid #E8E2D9;
    transition: color 0.2s;
  }
  .nav-mobile-link:hover { color: var(--vintage-rose); }
  .nav-mobile-link.active { color: var(--vintage-rose); }
`;

const NAV_LINKS = [
  { label: "Home",        to: "/" },
  { label: "Find Donors", to: "/donors" },
  { label: "Requests",    to: "/request" },
  { label: "Dashboard",   to: "/dashboard" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <>
      <style>{styles}</style>
      <nav className="nav-root">
        <div className="nav-inner">

          {/* Logo */}
          <Link to="/" className="nav-logo-wrap">
            <img src={logoSvg} alt="LifeLine Logo" className="nav-logo-img" />
            <span className="nav-brand">
              Life<span className="nav-brand-accent">Line</span>
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="nav-links">
            {NAV_LINKS.map(({ label, to }) => (
              <li key={to}>
                <Link to={to} className={`nav-link ${isActive(to) ? "active" : ""}`}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="nav-actions">
            {user ? (
              <>
                <span className="nav-user">
                  Welcome, {user.name} ({user.role})
                </span>
                <button onClick={handleLogout} className="nav-cta">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-login">Log In</Link>
                <Link to="/signup" className="nav-cta">Donate Now</Link>
              </>
            )}

            {/* Burger */}
            <button
              className={`nav-burger ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`nav-mobile ${menuOpen ? "open" : ""}`}>
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className={`nav-mobile-link ${isActive(to) ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          {user ? (
            <>
              <div className="nav-mobile-link" style={{ color: "var(--deep-text)" }}>
                Welcome, {user.name} ({user.role})
              </div>
              <button
                onClick={handleLogout}
                className="nav-mobile-link"
                style={{ color: "var(--vintage-rose)", background: "none", border: "none", cursor: "pointer" }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="nav-mobile-link"
              onClick={() => setMenuOpen(false)}
              style={{ color: "var(--vintage-rose)" }}
            >
              Log In
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}