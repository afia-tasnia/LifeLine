import { useState, useRef, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:5000/api";

const BADGE_CONFIG = {
  Bronze:   { color: "#CD7F32", bg: "rgba(205,127,50,0.12)",  glow: "rgba(205,127,50,0.3)",  label: "Bronze Member" },
  Silver:   { color: "#A8A9AD", bg: "rgba(168,169,173,0.12)", glow: "rgba(168,169,173,0.3)", label: "Silver Member" },
  Gold:     { color: "#D4AF37", bg: "rgba(212,175,55,0.12)",  glow: "rgba(212,175,55,0.3)",  label: "Gold Member" },
  Platinum: { color: "#AF4444", bg: "rgba(175,68,68,0.12)",   glow: "rgba(175,68,68,0.3)",   label: "Platinum Member" },
};

function getBadge(count) {
  if (count >= 20) return "Platinum";
  if (count >= 10) return "Gold";
  if (count >= 5)  return "Silver";
  return "Bronze";
}

/* ── Injected CSS animations ───────────────────────────────────────────────── */
const animStyles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes popIn {
    0%   { opacity: 0; transform: scale(0.85); }
    70%  { transform: scale(1.04); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes pulse-dot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
    50%       { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
  }
  @keyframes pulse-dot-orange {
    0%, 100% { box-shadow: 0 0 0 0 rgba(234,88,12,0.5); }
    50%       { box-shadow: 0 0 0 6px rgba(234,88,12,0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes floatOrb {
    0%, 100% { transform: translateY(0) scale(1); }
    50%       { transform: translateY(-18px) scale(1.04); }
  }
  @keyframes rotateSlow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .dp-page { animation: fadeIn 0.5s ease both; }
  .dp-card { animation: fadeUp 0.7s cubic-bezier(0.23,1,0.32,1) 0.1s both; }
  .dp-avatar-wrap { animation: popIn 0.6s cubic-bezier(0.23,1,0.32,1) 0.3s both; }
  .dp-name-block { animation: fadeUp 0.6s ease 0.35s both; }
  .dp-stat-0 { animation: fadeUp 0.5s ease 0.45s both; }
  .dp-stat-1 { animation: fadeUp 0.5s ease 0.55s both; }
  .dp-stat-2 { animation: fadeUp 0.5s ease 0.65s both; }
  .dp-actions { animation: fadeUp 0.5s ease 0.7s both; }

  .dp-stat-card {
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    position: relative;
    overflow: hidden;
  }
  .dp-stat-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%);
    background-size: 200% 100%;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .dp-stat-card:hover { transform: translateY(-5px); }
  .dp-stat-card:hover::before {
    opacity: 1;
    animation: shimmer 0.6s ease forwards;
  }

  .dp-avail-dot-green {
    display: inline-block;
    width: 9px; height: 9px;
    border-radius: 50%;
    background: #22c55e;
    animation: pulse-dot 2s ease infinite;
    flex-shrink: 0;
  }
  .dp-avail-dot-orange {
    display: inline-block;
    width: 9px; height: 9px;
    border-radius: 50%;
    background: #ea580c;
    animation: pulse-dot-orange 2s ease infinite;
    flex-shrink: 0;
  }

  .dp-orb-1 {
    position: absolute;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(175,68,68,0.18) 0%, transparent 70%);
    top: -80px; right: -80px;
    pointer-events: none;
    animation: floatOrb 7s ease-in-out infinite;
  }
  .dp-orb-2 {
    position: absolute;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(175,68,68,0.10) 0%, transparent 70%);
    bottom: -60px; left: -40px;
    pointer-events: none;
    animation: floatOrb 9s ease-in-out infinite reverse;
  }

  .dp-badge-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 14px; border-radius: 20px;
    font-size: 10px; font-weight: 800;
    letter-spacing: 0.15em; text-transform: uppercase;
    border: 1px solid currentColor;
  }

  .dp-meta-row {
    display: flex; flex-wrap: wrap;
    gap: 1rem 2rem;
    margin-top: 0.6rem;
  }
  .dp-meta-item {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 500;
    opacity: 0.7;
  }
  .dp-meta-item svg { flex-shrink: 0; opacity: 0.6; }

  .dp-edit-btn {
    font-size: 9px; font-weight: 700;
    letter-spacing: 0.25em; text-transform: uppercase;
    padding: 5px 14px; border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.3);
    color: rgba(255,255,255,0.75);
    background: transparent;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .dp-edit-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }

  .dp-section-label {
    font-size: 9px; font-weight: 700;
    letter-spacing: 0.3em; text-transform: uppercase;
    opacity: 0.35; margin-bottom: 1rem;
  }
`;

export default function DonorProfile() {
  const { id }              = useParams();
  const { user: authUser, login } = useAuth();
  const isOwner = authUser?._id === id;

  const [donor,         setDonor]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [cooldown,      setCooldown]      = useState(null);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading,     setUploading]     = useState(false);
  const [uploadMsg,     setUploadMsg]     = useState(null);
  const fileInputRef = useRef(null);

  const [editing,    setEditing]    = useState(false);
  const [editFields, setEditFields] = useState({});
  const [saving,     setSaving]     = useState(false);
  const [saveMsg,    setSaveMsg]    = useState(null);

  const [togglingAvail, setTogglingAvail] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError("");
      try {
        const { data } = await axios.get(`${API}/users/donors/${id}`);
        setDonor(data);
        setAvatarPreview(data.avatarUrl ? `http://localhost:5000${data.avatarUrl}` : null);
        setEditFields({ name: data.name || "", phone: data.phone || "", location: data.location || "", bloodGroup: data.bloodGroup || "" });
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load donor profile.");
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!isOwner) return;
    axios.get(`${API}/donations/cooldown-status`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      .then((res) => setCooldown(res.data)).catch(() => {});
  }, [id, isOwner]);

  async function handleFileChange(e) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
    setUploading(true); setUploadMsg(null);
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const { data } = await axios.post(`${API}/users/avatar`, formData, { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setAvatarPreview(`http://localhost:5000${data.avatarUrl}`);
      setDonor((d) => ({ ...d, avatarUrl: data.avatarUrl }));
      login(localStorage.getItem("token"), { ...authUser, avatarUrl: data.avatarUrl });
      setUploadMsg({ ok: true, text: "✓ Photo saved" });
    } catch (err) {
      setUploadMsg({ ok: false, text: err.response?.data?.message || "Upload failed" });
      setAvatarPreview(donor?.avatarUrl ? `http://localhost:5000${donor.avatarUrl}` : null);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadMsg(null), 3500);
    }
  }

  async function handleSave() {
    setSaving(true); setSaveMsg(null);
    try {
      const { data } = await axios.put(`${API}/users/profile`, editFields, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setDonor((d) => ({ ...d, ...data }));
      login(localStorage.getItem("token"), { ...authUser, ...data });
      setSaveMsg({ ok: true, text: "Profile updated!" });
      setEditing(false);
    } catch (err) {
      setSaveMsg({ ok: false, text: err.response?.data?.message || "Save failed" });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 3500);
    }
  }

  async function handleToggleAvailability() {
    if (!donor) return;
    const next = donor.availability === "available" ? "unavailable" : "available";
    setTogglingAvail(true);
    try {
      const { data } = await axios.put(`${API}/users/profile`, { availability: next }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setDonor((d) => ({ ...d, availability: data.availability }));
      login(localStorage.getItem("token"), { ...authUser, availability: data.availability });
    } catch { } finally { setTogglingAvail(false); }
  }

  const badge      = donor ? getBadge(donor.donationCount) : "Bronze";
  const badgeCfg   = BADGE_CONFIG[badge];
  const initials   = donor ? donor.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "??";
  const formattedDate = donor?.lastDonatedAt
    ? new Date(donor.lastDonatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  if (error) return (
    <div style={bgStyle} className="min-h-screen flex items-center justify-center">
      <div className="text-white/70 text-sm uppercase tracking-widest text-center px-4">
        <div className="text-3xl mb-4">⚠️</div>{error}
      </div>
    </div>
  );

  if (loading) return (
    <div style={bgStyle} className="min-h-screen flex items-center justify-center">
      <div className="text-white/60 text-[10px] uppercase tracking-[0.4em] animate-pulse">Loading profile…</div>
    </div>
  );

  const isAvailable = donor.availability === "available";

  return (
    <>
      <style>{animStyles}</style>
      <div style={bgStyle} className="dp-page min-h-screen text-[#3D2B2B]">
        <main className="max-w-4xl mx-auto pt-16 px-4 pb-24">

          {/* Owner toolbar */}
          {isOwner && (
            <div className="mb-4 flex items-center gap-3">
              <span className="text-[9px] uppercase tracking-[0.35em] font-bold text-white/40">Your profile</span>
              <button className="dp-edit-btn" onClick={() => { setEditing((v) => !v); setSaveMsg(null); }}>
                {editing ? "Cancel" : "Edit profile"}
              </button>
            </div>
          )}

          {/* Main card */}
          <div style={glassCard} className="dp-card rounded-2xl p-8 md:p-12 relative overflow-hidden">
            {/* Floating orbs */}
            <div className="dp-orb-1" />
            <div className="dp-orb-2" />

            {/* ── Header: avatar + name ── */}
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">

              {/* Avatar */}
              <div className="dp-avatar-wrap relative flex-shrink-0">
                <div
                  style={avatarStyle}
                  onClick={isOwner ? () => fileInputRef.current?.click() : undefined}
                  className={isOwner ? "cursor-pointer group" : "cursor-default"}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt={donor.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-4xl font-serif text-[#AF4444] select-none">{initials}</span>
                  )}
                  {isOwner && (
                    <div className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <CameraIcon />
                      <span className="text-white text-[9px] font-bold uppercase tracking-wider mt-1">
                        {uploading ? "Uploading…" : "Change"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Blood group ring */}
                <div
                  className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 border-white text-sm text-white"
                  style={{ background: "linear-gradient(135deg, #AF4444, #8E3333)", boxShadow: "0 4px 12px rgba(175,68,68,0.4)" }}
                >
                  {donor.bloodGroup}
                </div>

                {isOwner && <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />}
                {uploadMsg && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-white"
                    style={{ backgroundColor: uploadMsg.ok ? "#22c55e" : "#ef4444" }}>
                    {uploadMsg.text}
                  </div>
                )}
              </div>

              {/* Name + badge + meta */}
              <div className="dp-name-block flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                  <h1 className="text-3xl font-serif tracking-tight">{donor.name}</h1>
                  <span className="dp-badge-pill" style={{ color: badgeCfg.color, backgroundColor: badgeCfg.bg, borderColor: `${badgeCfg.color}44` }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: badgeCfg.color, display: "inline-block" }} />
                    {badgeCfg.label}
                  </span>
                </div>
                <div className="dp-meta-row justify-center md:justify-start">
                  <span className="dp-meta-item">
                    <PinIcon /> {donor.location || "—"}
                  </span>
                  <span className="dp-meta-item">
                    <PhoneIcon /> {donor.phone || "—"}
                  </span>
                  <span className="dp-meta-item">
                    <MailIcon /> {donor.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit form */}
            {isOwner && editing && (
              <div className="mt-8 p-6 rounded-xl border border-[#E8E2D9] bg-[#FDFAF6]">
                <p className="dp-section-label">Edit profile</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[{ key: "name", label: "Full name", type: "text" }, { key: "phone", label: "Phone", type: "tel" }, { key: "location", label: "City / district", type: "text" }].map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="block text-[9px] uppercase tracking-widest font-bold opacity-40 mb-1">{label}</label>
                      <input type={type} value={editFields[key]} onChange={(e) => setEditFields((f) => ({ ...f, [key]: e.target.value }))}
                        className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#AF4444]" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest font-bold opacity-40 mb-1">Blood group</label>
                    <select value={editFields.bloodGroup} onChange={(e) => setEditFields((f) => ({ ...f, bloodGroup: e.target.value }))}
                      className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#AF4444]">
                      <option value="">— select —</option>
                      {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <button onClick={handleSave} disabled={saving}
                    className="px-6 py-2 bg-[#AF4444] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#8f3030] transition-all disabled:opacity-50">
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                  {saveMsg && <span className="text-xs font-semibold" style={{ color: saveMsg.ok ? "#22c55e" : "#ef4444" }}>{saveMsg.text}</span>}
                </div>
              </div>
            )}

            {/* ── Stats ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12 border-t border-black/5 pt-10">

              {/* Donations count */}
              <div className="dp-stat-card dp-stat-0 p-6 rounded-2xl text-center" style={statCardStyle("#AF4444")}>
                <span className="block text-4xl font-bold mb-1" style={{ color: "#AF4444" }}>{donor.donationCount}</span>
                <span className="dp-section-label" style={{ marginBottom: 0 }}>Total Donations</span>
              </div>

              {/* Availability */}
              <div className="dp-stat-card dp-stat-1 p-6 rounded-2xl text-center" style={statCardStyle(isAvailable ? "#22c55e" : "#ea580c")}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className={isAvailable ? "dp-avail-dot-green" : "dp-avail-dot-orange"} />
                  <span className="text-lg font-bold" style={{ color: isAvailable ? "#16a34a" : "#ea580c" }}>
                    {isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
                {isOwner && (
                  <button onClick={handleToggleAvailability} disabled={togglingAvail}
                    className="mt-2 text-[9px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-full border transition-all disabled:opacity-40"
                    style={{ color: isAvailable ? "#ea580c" : "#16a34a", borderColor: isAvailable ? "#ea580c" : "#16a34a" }}>
                    {togglingAvail ? "Updating…" : isAvailable ? "Mark unavailable" : "Mark available"}
                  </button>
                )}
                {isOwner && cooldown && (
                  <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: cooldown.inCooldown ? "#FDF3E7" : "#EAF6EC", border: `1px solid ${cooldown.inCooldown ? "#f0a50044" : "#27ae6044"}`, fontSize: 13 }}>
                    {cooldown.inCooldown ? (
                      <><span style={{ color: "#AF4444" }}>●</span> <strong>Cooldown active</strong> — donate again in <strong>{cooldown.daysRemaining} day{cooldown.daysRemaining !== 1 ? "s" : ""}</strong>.<br />
                        <span style={{ color: "#888", fontSize: 12 }}>Last donated: {new Date(cooldown.lastDonatedAt).toLocaleDateString()}</span></>
                    ) : <>✅ <strong>Eligible to donate</strong> today!</>}
                  </div>
                )}
                <span className="dp-section-label mt-3 block" style={{ marginBottom: 0 }}>Current Status</span>
              </div>

              {/* Last contribution */}
              <div className="dp-stat-card dp-stat-2 p-6 rounded-2xl text-center" style={statCardStyle("#3D2B2B")}>
                <span className="block text-xl font-bold mb-1 text-[#3D2B2B]">{formattedDate}</span>
                <span className="dp-section-label" style={{ marginBottom: 0 }}>Last Contribution</span>
              </div>
            </div>

            {/* ── Action buttons ── */}
            <div className="dp-actions mt-10 flex flex-col md:flex-row gap-4">
              <Link to={`/donor-donations/${id}`}
                className="flex-1 text-center py-4 border border-[#E8E2D9] text-[#3D2B2B] text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#F9F7F2] hover:border-[#AF4444] transition-all">
                {isOwner ? "My Donation History" : "View Donation History"}
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link to="/donors" className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">
              ← Back to Donor Directory
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}

/* ── Helpers ───────────────────────────────────────────────────────────────── */
function statCardStyle(accent) {
  return {
    background: "#fff",
    border: `1px solid ${accent}22`,
    boxShadow: `0 4px 24px ${accent}14`,
  };
}

/* ── SVG Icons ─────────────────────────────────────────────────────────────── */
function PinIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function PhoneIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.01 1.22 2 2 0 012 .01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
}
function MailIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
}
function CameraIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
  </svg>;
}

/* ── Styles ─────────────────────────────────────────────────────────────────── */
const bgStyle = {
  backgroundImage: `
    radial-gradient(ellipse at 20% 50%, rgba(175,68,68,0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(142,52,52,0.12) 0%, transparent 45%),
    linear-gradient(160deg, #2a1010 0%, #3D2B2B 40%, #1e1010 100%)
  `,
  backgroundAttachment: "fixed",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const glassCard = {
  background: "rgba(255,255,255,0.92)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.6)",
  boxShadow: "0 30px 60px -12px rgba(0,0,0,0.45), 0 0 0 1px rgba(175,68,68,0.08)",
};

const avatarStyle = {
  width: 120, height: 120,
  borderRadius: "50%",
  border: "4px solid white",
  boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
  backgroundColor: "#F9F7F2",
  display: "flex", alignItems: "center", justifyContent: "center",
  overflow: "hidden", position: "relative",
};