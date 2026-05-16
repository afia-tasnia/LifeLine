import { useState, useRef, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:5000/api";

/* ── Styles ─────────────────────────────────────────────────────────────────── */
const bgStyle = {
  backgroundImage: `
    radial-gradient(ellipse at 20% 50%, rgba(175,68,68,0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(142,52,52,0.12) 0%, transparent 45%),
    linear-gradient(160deg, #2a1010 0%, #3D2B2B 40%, #1e1010 100%)
  `,
  backgroundColor: "#2a1010",
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
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes floatOrb {
    0%, 100% { transform: translateY(0) scale(1); }
    50%       { transform: translateY(-18px) scale(1.04); }
  }
  @keyframes activeGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
    50%       { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
  }
  @keyframes countUp {
    from { opacity: 0; transform: scale(0.7); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.92) translateY(12px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  .rp-page { animation: fadeIn 0.5s ease both; }
  .rp-card { animation: fadeUp 0.7s cubic-bezier(0.23,1,0.32,1) 0.1s both; }
  .rp-avatar-wrap { animation: popIn 0.6s cubic-bezier(0.23,1,0.32,1) 0.3s both; }
  .rp-name-block { animation: fadeUp 0.6s ease 0.35s both; }
  .rp-reg-strip { animation: fadeUp 0.5s ease 0.4s both; }
  .rp-stat-0 { animation: fadeUp 0.5s ease 0.45s both; }
  .rp-stat-1 { animation: fadeUp 0.5s ease 0.55s both; }
  .rp-requests { animation: fadeUp 0.5s ease 0.6s both; }
  .rp-actions { animation: fadeUp 0.5s ease 0.65s both; }

  .rp-stat-card {
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    position: relative; overflow: hidden;
  }
  .rp-stat-card::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%);
    background-size: 200% 100%;
    opacity: 0; transition: opacity 0.3s;
  }
  .rp-stat-card:hover { transform: translateY(-5px); }
  .rp-stat-card:hover::before { opacity: 1; animation: shimmer 0.6s ease forwards; }

  .rp-active-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 20px;
    font-size: 9px; font-weight: 800;
    letter-spacing: 0.15em; text-transform: uppercase;
    background: #dcfce7; color: #16a34a;
    animation: activeGlow 2.5s ease infinite;
  }

  .rp-orb-1 {
    position: absolute;
    width: 280px; height: 280px; border-radius: 50%;
    background: radial-gradient(circle, rgba(29,111,164,0.12) 0%, transparent 70%);
    top: -60px; right: -60px;
    pointer-events: none;
    animation: floatOrb 8s ease-in-out infinite;
  }
  .rp-orb-2 {
    position: absolute;
    width: 180px; height: 180px; border-radius: 50%;
    background: radial-gradient(circle, rgba(29,111,164,0.08) 0%, transparent 70%);
    bottom: -50px; left: -30px;
    pointer-events: none;
    animation: floatOrb 10s ease-in-out infinite reverse;
  }

  .rp-meta-row {
    display: flex; flex-wrap: wrap;
    gap: 0.75rem 1.75rem;
    margin-top: 0.6rem;
  }
  .rp-meta-item {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 500; opacity: 0.7;
  }
  .rp-meta-item svg { flex-shrink: 0; opacity: 0.6; }

  .rp-edit-btn {
    font-size: 9px; font-weight: 700;
    letter-spacing: 0.25em; text-transform: uppercase;
    padding: 5px 14px; border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.3);
    color: rgba(255,255,255,0.75);
    background: transparent; cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .rp-edit-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }

  .rp-section-label {
    font-size: 9px; font-weight: 700;
    letter-spacing: 0.3em; text-transform: uppercase;
    opacity: 0.35; margin-bottom: 1rem;
  }

  .rp-stat-number {
    animation: countUp 0.5s cubic-bezier(0.23,1,0.32,1) both;
  }

  /* ── Phone modal ── */
  .fulfil-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.55);
    display: flex; align-items: center; justify-content: center;
    z-index: 999;
    animation: fadeIn 0.2s ease both;
  }
  .fulfil-modal {
    background: #fff;
    border-radius: 20px;
    padding: 32px 28px;
    width: 100%; max-width: 380px;
    box-shadow: 0 32px 64px rgba(0,0,0,0.3);
    animation: modalIn 0.3s cubic-bezier(0.23,1,0.32,1) both;
  }
  .fulfil-modal h3 {
    font-size: 16px; font-weight: 700;
    color: #1a1a1a; margin-bottom: 6px;
  }
  .fulfil-modal p {
    font-size: 13px; color: #666;
    line-height: 1.5; margin-bottom: 20px;
  }
  .fulfil-phone-input {
    width: 100%;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s;
    margin-bottom: 8px;
  }
  .fulfil-phone-input:focus { border-color: #22c55e; }
  .fulfil-warning {
    font-size: 11px; color: #f59e0b;
    margin-bottom: 16px; line-height: 1.4;
  }
  .fulfil-btns {
    display: flex; gap: 10px; margin-top: 16px;
  }
  .fulfil-btn-confirm {
    flex: 1; padding: 10px;
    background: #22c55e; color: white;
    font-size: 12px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    border: none; border-radius: 10px; cursor: pointer;
    transition: background 0.2s;
  }
  .fulfil-btn-confirm:hover:not(:disabled) { background: #16a34a; }
  .fulfil-btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
  .fulfil-btn-skip {
    flex: 1; padding: 10px;
    background: transparent; color: #999;
    font-size: 12px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    border: 2px solid #e5e7eb; border-radius: 10px; cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }
  .fulfil-btn-skip:hover { border-color: #ccc; color: #666; }
`;

export default function ReceiverProfile() {
  const { id }             = useParams();
  const { user: authUser, login } = useAuth();

  const authUserId = authUser?._id ?? null;
  const profileId  = id || authUserId;
  const isOwner    = !!authUserId && !!profileId && authUserId === profileId;

  const [receiver,    setReceiver]    = useState(null);
  const [requests,    setRequests]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading,     setUploading]     = useState(false);
  const [uploadMsg,     setUploadMsg]     = useState(null);
  const fileInputRef = useRef(null);

  const [editing,    setEditing]    = useState(false);
  const [editFields, setEditFields] = useState({});
  const [saving,     setSaving]     = useState(false);
  const [saveMsg,    setSaveMsg]    = useState(null);

  // ── Fulfil modal state ──────────────────────────────────────────────────────
  const [fulfilModal,   setFulfilModal]   = useState(null); // { requestId, unitsNeeded }
  const [donorPhone,    setDonorPhone]    = useState("");
  const [fulfilLoading, setFulfilLoading] = useState(false);
  const [fulfilMsg,     setFulfilMsg]     = useState(null); // { ok, text }

  const fetchedRef = useRef(null);

  useEffect(() => {
    if (!profileId) return;

    const fetchKey = `${profileId}-${authUserId}`;
    if (fetchedRef.current === fetchKey) return;
    fetchedRef.current = fetchKey;

    const token = localStorage.getItem("token");

    const loadProfile = async () => {
      setLoading(true);
      setError("");
      try {
        if (authUserId === profileId && token) {
          const { data: { user: freshUser } } = await axios.get(`${API}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          login(token, { ...authUser, ...freshUser });

          setReceiver({
            _id:          freshUser._id,
            name:         freshUser.name,
            email:        freshUser.email,
            bloodGroup:   freshUser.bloodGroup  ?? "—",
            phone:        freshUser.phone       ?? "—",
            location:     freshUser.location    ?? "—",
            role:         freshUser.role,
            registeredAt: freshUser.createdAt   ?? null,
            avatarUrl:    freshUser.avatarUrl   ?? null,
          });

          setAvatarPreview(
            freshUser.avatarUrl ? `http://localhost:5000${freshUser.avatarUrl}` : null
          );

          setEditFields({
            name:       freshUser.name       || "",
            phone:      freshUser.phone      || "",
            location:   freshUser.location   || "",
            bloodGroup: freshUser.bloodGroup || "",
          });

        } else if (!authUserId) {
          setReceiver({
            _id:          profileId,
            name:         "Receiver",
            email:        "—",
            bloodGroup:   "—",
            phone:        "—",
            location:     "—",
            role:         "receiver",
            registeredAt: null,
            avatarUrl:    null,
          });
        }

        if (token) {
          const { data: reqs } = await axios.get(`${API}/blood-requests`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setRequests(
            reqs.filter(
              (r) => r.receiverId?._id === profileId || r.receiverId === profileId
            )
          );
        }
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [profileId, authUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
    setUploading(true);
    setUploadMsg(null);
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const { data } = await axios.post(`${API}/users/avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setAvatarPreview(`http://localhost:5000${data.avatarUrl}`);
      setReceiver((r) => ({ ...r, avatarUrl: data.avatarUrl }));
      login(localStorage.getItem("token"), { ...authUser, avatarUrl: data.avatarUrl });
      setUploadMsg({ ok: true, text: "✓ Photo saved" });
    } catch (err) {
      setUploadMsg({ ok: false, text: err.response?.data?.message || "Upload failed" });
      setAvatarPreview(receiver?.avatarUrl ? `http://localhost:5000${receiver.avatarUrl}` : null);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadMsg(null), 3500);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveMsg(null);
    try {
      const { data: { user: updatedUser } } = await axios.put(`${API}/users/profile`, editFields, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setReceiver((r) => ({ ...r, ...updatedUser }));
      login(localStorage.getItem("token"), { ...authUser, ...updatedUser });
      setSaveMsg({ ok: true, text: "Profile updated!" });
      setEditing(false);
    } catch (err) {
      setSaveMsg({ ok: false, text: err.response?.data?.message || "Save failed" });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 3500);
    }
  }

  // ── Open the fulfil modal ───────────────────────────────────────────────────
  function openFulfilModal(requestId, unitsNeeded) {
    setDonorPhone("");
    setFulfilMsg(null);
    setFulfilModal({ requestId, unitsNeeded });
  }

  function closeFulfilModal() {
    setFulfilModal(null);
    setDonorPhone("");
    setFulfilMsg(null);
  }

  // ── Actually submit the fulfil ─────────────────────────────────────────────
  async function handleFulfilSubmit(skipPhone = false) {
    if (!fulfilModal) return;
    setFulfilLoading(true);
    setFulfilMsg(null);

    const body = { status: "completed" };
    if (!skipPhone && donorPhone.trim()) {
      body.donorPhone = donorPhone.trim();
    }

    try {
      const { data } = await axios.put(
        `${API}/blood-requests/${fulfilModal.requestId}`,
        body,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      // Update local requests list
      setRequests((prev) =>
        prev.map((r) => (r._id === fulfilModal.requestId ? { ...r, status: "completed" } : r))
      );

      if (data.donorWarning) {
        // Phone not matched — warn but still close
        setFulfilMsg({ ok: false, text: data.donorWarning });
        setTimeout(closeFulfilModal, 4000);
      } else if (data.donorName) {
        setFulfilMsg({ ok: true, text: `✓ Marked fulfilled! Donation recorded for ${data.donorName}.` });
        setTimeout(closeFulfilModal, 2500);
      } else {
        closeFulfilModal();
      }
    } catch (err) {
      setFulfilMsg({ ok: false, text: err.response?.data?.message || "Something went wrong." });
    } finally {
      setFulfilLoading(false);
    }
  }

  const requestsPlaced    = requests.length;
  const requestsFulfilled = requests.filter((r) => r.status === "completed").length;
  const initials = receiver
    ? receiver.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "??";
  const joinDate = receiver?.registeredAt
    ? new Date(receiver.registeredAt).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : "—";

  if (loading && !receiver) return (
    <div style={bgStyle} className="min-h-screen flex items-center justify-center">
      <div className="text-white/60 text-[10px] uppercase tracking-[0.4em] animate-pulse">Loading profile…</div>
    </div>
  );

  if (error) return (
    <div style={bgStyle} className="min-h-screen flex items-center justify-center">
      <div className="text-white/70 text-sm uppercase tracking-widest text-center px-4">
        <div className="text-3xl mb-4">⚠️</div>{error}
      </div>
    </div>
  );

  if (!receiver) return (
    <div style={bgStyle} className="min-h-screen flex items-center justify-center">
      <div className="text-white/70 text-sm uppercase tracking-widest text-center px-4">
        <div className="text-3xl mb-4">⚠️</div>
        Profile data unavailable. Please try refreshing the page.
      </div>
    </div>
  );

  return (
    <>
      <style>{animStyles}</style>

      {/* ── Fulfil modal ── */}
      {fulfilModal && (
        <div className="fulfil-overlay" onClick={(e) => e.target === e.currentTarget && closeFulfilModal()}>
          <div className="fulfil-modal">
            <h3>🩸 Who donated to you?</h3>
            <p>
              Enter the phone number of the donor who called and helped you.
              We'll update their donation count automatically!
            </p>
            <input
              className="fulfil-phone-input"
              type="tel"
              placeholder="e.g. 01711123456"
              value={donorPhone}
              onChange={(e) => setDonorPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFulfilSubmit(false)}
              autoFocus
            />
            {fulfilMsg && (
              <div className="fulfil-warning" style={{ color: fulfilMsg.ok ? "#22c55e" : "#f59e0b" }}>
                {fulfilMsg.text}
              </div>
            )}
            <div className="fulfil-btns">
              <button
                className="fulfil-btn-confirm"
                onClick={() => handleFulfilSubmit(false)}
                disabled={fulfilLoading || !donorPhone.trim()}
              >
                {fulfilLoading ? "Saving…" : "Confirm"}
              </button>
              <button
                className="fulfil-btn-skip"
                onClick={() => handleFulfilSubmit(true)}
                disabled={fulfilLoading}
              >
                Skip
              </button>
            </div>
            <p style={{ fontSize: 10, color: "#bbb", marginTop: 12, textAlign: "center" }}>
              Tap Skip if you don't have the donor's number right now
            </p>
          </div>
        </div>
      )}

      <div style={bgStyle} className="rp-page min-h-screen text-[#3D2B2B]">
        <main className="max-w-4xl mx-auto pt-16 px-4 pb-24">

          {isOwner && (
            <div className="mb-4 flex items-center gap-3">
              <span className="text-[9px] uppercase tracking-[0.35em] font-bold text-white/40">Your profile</span>
              <button className="rp-edit-btn" onClick={() => { setEditing((v) => !v); setSaveMsg(null); }}>
                {editing ? "Cancel" : "Edit profile"}
              </button>
            </div>
          )}

          <div style={glassCard} className="rp-card rounded-2xl p-8 md:p-12 relative overflow-hidden">
            <div className="rp-orb-1" />
            <div className="rp-orb-2" />

            <div className="mb-6 flex items-center gap-3">
              <span className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-35">Registered Receiver</span>
              <span className="rp-active-badge">
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                Active
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="rp-avatar-wrap relative flex-shrink-0">
                <div
                  style={avatarStyle}
                  onClick={isOwner && editing ? () => fileInputRef.current?.click() : undefined}
                  className={isOwner && editing ? "cursor-pointer group" : "cursor-default"}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt={receiver.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-4xl font-serif select-none" style={{ color: "#1d6fa4" }}>{initials}</span>
                  )}
                  {isOwner && editing && (
                    <div className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                      <CameraIcon />
                      <span className="text-white text-[9px] font-bold uppercase tracking-wider mt-1">
                        {uploading ? "Uploading…" : "Change photo"}
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 border-white text-sm text-white"
                  style={{ background: "linear-gradient(135deg, #1d6fa4, #155b8a)", boxShadow: "0 4px 12px rgba(29,111,164,0.4)" }}
                >
                  {receiver.bloodGroup}
                </div>

                {isOwner && <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />}
                {uploadMsg && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-white"
                    style={{ backgroundColor: uploadMsg.ok ? "#22c55e" : "#ef4444" }}>
                    {uploadMsg.text}
                  </div>
                )}
              </div>

              <div className="rp-name-block flex-1 text-center md:text-left">
                <h1 className="text-3xl font-serif tracking-tight mb-3">{receiver.name}</h1>
                <div className="rp-meta-row justify-center md:justify-start">
                  <span className="rp-meta-item"><PinIcon /> {receiver.location || "—"}</span>
                  <span className="rp-meta-item"><PhoneIcon /> {receiver.phone || "—"}</span>
                  <span className="rp-meta-item"><MailIcon /> {receiver.email}</span>
                </div>
              </div>
            </div>

            {isOwner && editing && (
              <div className="mt-8 p-6 rounded-xl border border-[#E8E2D9] bg-[#FDFAF6]">
                <p className="rp-section-label">Edit profile</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: "name",     label: "Full name",       type: "text" },
                    { key: "phone",    label: "Phone",           type: "tel"  },
                    { key: "location", label: "City / district", type: "text" },
                  ].map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="block text-[9px] uppercase tracking-widest font-bold opacity-40 mb-1">{label}</label>
                      <input
                        type={type}
                        value={editFields[key]}
                        onChange={(e) => setEditFields((f) => ({ ...f, [key]: e.target.value }))}
                        className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1d6fa4]"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest font-bold opacity-40 mb-1">Blood group</label>
                    <select
                      value={editFields.bloodGroup}
                      onChange={(e) => setEditFields((f) => ({ ...f, bloodGroup: e.target.value }))}
                      className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1d6fa4]"
                    >
                      <option value="">— select —</option>
                      {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all disabled:opacity-50"
                    style={{ background: "#1d6fa4" }}
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                  {saveMsg && (
                    <span className="text-xs font-semibold" style={{ color: saveMsg.ok ? "#22c55e" : "#ef4444" }}>
                      {saveMsg.text}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="rp-reg-strip mt-8 p-4 rounded-xl flex items-center gap-3"
              style={{ background: "rgba(29,111,164,0.06)", border: "1px solid rgba(29,111,164,0.12)" }}>
              <CalendarIcon />
              <div>
                <p className="rp-section-label" style={{ marginBottom: 2 }}>Member since</p>
                <p className="text-sm font-semibold">{joinDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8 border-t border-black/5 pt-8">
              <div className="rp-stat-card rp-stat-0 p-6 rounded-2xl text-center" style={statCardStyle("#AF4444")}>
                <span className="rp-stat-number block text-4xl font-bold mb-1 text-[#AF4444]">{requestsPlaced}</span>
                <span className="rp-section-label" style={{ marginBottom: 0 }}>Requests Placed</span>
              </div>
              <div className="rp-stat-card rp-stat-1 p-6 rounded-2xl text-center" style={statCardStyle("#22c55e")}>
                <span className="rp-stat-number block text-4xl font-bold mb-1 text-green-600">{requestsFulfilled}</span>
                <span className="rp-section-label" style={{ marginBottom: 0 }}>Fulfilled</span>
              </div>
            </div>

            {/* ── Active requests ── */}
            {isOwner && requests.filter((r) => r.status !== "completed").length > 0 && (
              <div className="rp-requests mt-8 border-t border-black/5 pt-8">
                <p className="rp-section-label">Active Requests</p>
                <div className="flex flex-col gap-3">
                  {requests.filter((r) => r.status !== "completed").map((r) => (
                    <div key={r._id}
                      className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-[#E8E2D9] bg-white hover:border-[#1d6fa4]/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #AF4444, #8E3333)" }}
                        >
                          {r.bloodGroup}
                        </span>
                        <div>
                          <p className="text-sm font-semibold">{r.hospital}</p>
                          <p className="text-xs opacity-50">{r.location} · {r.unitsNeeded} unit{r.unitsNeeded !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      {/* ── NEW: opens phone modal instead of directly fulfilling ── */}
                      <button
                        onClick={() => openFulfilModal(r._id, r.unitsNeeded)}
                        className="text-[9px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-full border border-green-500 text-green-600 hover:bg-green-50 transition-all flex-shrink-0"
                      >
                        Mark fulfilled
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isOwner && (
              <div className="rp-actions mt-10 flex flex-col md:flex-row gap-4">
                <Link to="/request"
                  className="flex-1 text-center py-4 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all hover:brightness-110"
                  style={{ background: "linear-gradient(135deg, #AF4444, #8E3333)", boxShadow: "0 8px 20px rgba(175,68,68,0.3)" }}>
                  Place a New Request
                </Link>
                <Link to="/fulfilled-requests"
                  className="flex-1 text-center py-4 border border-[#E8E2D9] text-[#3D2B2B] text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#F9F7F2] hover:border-[#1d6fa4]/40 transition-all">
                  See Fulfilled Requests
                </Link>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link to="/" className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">
              ← Back to Home
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}

function statCardStyle(accent) {
  return { background: "#fff", border: `1px solid ${accent}22`, boxShadow: `0 4px 24px ${accent}14` };
}

function PinIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function PhoneIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.01 1.22 2 2 0 012 .01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
}
function MailIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
}
function CalendarIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d6fa4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function CameraIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
  );
}