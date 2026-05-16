import { useState, useRef, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:5000/api";

export default function ReceiverProfile() {
  const { id }              = useParams();
  const { user: authUser, login } = useAuth();

  const profileId = id || authUser?._id;
  const isOwner   = authUser?._id === profileId;

  // ── State ──────────────────────────────────────────────────────────────────
  const [receiver,    setReceiver]    = useState(null);
  const [requests,    setRequests]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  // Avatar — only show hover overlay when in edit mode
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading,     setUploading]     = useState(false);
  const [uploadMsg,     setUploadMsg]     = useState(null);
  const fileInputRef = useRef(null);

  // Edit form
  const [editing,    setEditing]    = useState(false);
  const [editFields, setEditFields] = useState({});
  const [saving,     setSaving]     = useState(false);
  const [saveMsg,    setSaveMsg]    = useState(null);

  // Fulfil
  const [fulfillingId, setFulfillingId] = useState(null);

  // ── Load receiver + their requests ────────────────────────────────────────
  useEffect(() => {
    if (!profileId) return;

    const token = localStorage.getItem("token");

    const loadProfile = async () => {
      setLoading(true);
      setError("");
      try {
        if (isOwner && authUser) {
          setReceiver({
            _id:          authUser._id,
            name:         authUser.name,
            email:        authUser.email,
            bloodGroup:   authUser.bloodGroup ?? "—",
            phone:        authUser.phone      ?? "—",
            location:     authUser.location   ?? "—",
            role:         authUser.role,
            registeredAt: authUser.createdAt  ?? null,
            avatarUrl:    authUser.avatarUrl  ?? null,
          });
          setAvatarPreview(
            authUser.avatarUrl ? `http://localhost:5000${authUser.avatarUrl}` : null
          );
          setEditFields({
            name:       authUser.name       || "",
            phone:      authUser.phone      || "",
            location:   authUser.location   || "",
            bloodGroup: authUser.bloodGroup || "",
          });
        } else {
          setError("Receiver profiles are not publicly viewable.");
          setLoading(false);
          return;
        }

        const { data } = await axios.get(`${API}/blood-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const mine = data.filter(
          (r) => r.receiverId?._id === profileId || r.receiverId === profileId
        );
        setRequests(mine);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [profileId, authUser, isOwner]);

  // ── Avatar upload ──────────────────────────────────────────────────────────
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

      const updatedUser = { ...authUser, avatarUrl: data.avatarUrl };
      login(localStorage.getItem("token"), updatedUser);

      setUploadMsg({ ok: true, text: "✓ Photo saved" });
    } catch (err) {
      setUploadMsg({ ok: false, text: err.response?.data?.message || "Upload failed" });
      // Revert preview to the server URL on failure
      setAvatarPreview(
        receiver?.avatarUrl ? `http://localhost:5000${receiver.avatarUrl}` : null
      );
    } finally {
      setUploading(false);
      setTimeout(() => setUploadMsg(null), 3500);
    }
  }

  // ── Edit profile save ──────────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true);
    setSaveMsg(null);
    try {
      const { data } = await axios.put(`${API}/users/profile`, editFields, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setReceiver((r) => ({ ...r, ...data }));

      const updatedUser = { ...authUser, ...data };
      login(localStorage.getItem("token"), updatedUser);

      setSaveMsg({ ok: true, text: "Profile updated!" });
      setEditing(false);
    } catch (err) {
      setSaveMsg({ ok: false, text: err.response?.data?.message || "Save failed" });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 3500);
    }
  }

  // ── Mark request fulfilled ─────────────────────────────────────────────────
  // BloodRequest model uses "completed" (not "fulfilled") — this is the fix.
  async function handleFulfil(requestId) {
    setFulfillingId(requestId);
    try {
      await axios.put(
        `${API}/blood-requests/${requestId}`,
        { status: "completed" },         // ← was "fulfilled", model only accepts "completed"
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setRequests((prev) =>
        prev.map((r) => (r._id === requestId ? { ...r, status: "completed" } : r))
      );
    } catch {
      // Silently ignore — user can retry
    } finally {
      setFulfillingId(null);
    }
  }

  // ── Derived ────────────────────────────────────────────────────────────────
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

  // ── Error / loading ────────────────────────────────────────────────────────
  if (error) return (
    <div style={bgStyle} className="min-h-screen flex items-center justify-center">
      <div className="text-white/70 text-sm uppercase tracking-widest text-center px-4">
        <div className="text-3xl mb-4">⚠️</div>{error}
      </div>
    </div>
  );

  if (loading) return (
    <div style={bgStyle} className="min-h-screen flex items-center justify-center">
      <div className="text-white/70 text-sm uppercase tracking-widest animate-pulse">
        Loading profile…
      </div>
    </div>
  );

  return (
    <div style={bgStyle} className="min-h-screen text-[#3D2B2B]">
      <main className="max-w-4xl mx-auto pt-20 px-4 pb-24">

        {/* Owner label + edit toggle */}
        {isOwner && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/50">
              Your profile
            </span>
            <button
              onClick={() => { setEditing((v) => !v); setSaveMsg(null); }}
              className="text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border border-white/30 text-white/70 hover:bg-white/10 transition-colors"
            >
              {editing ? "Cancel" : "Edit profile"}
            </button>
          </div>
        )}

        <div style={glassCard} className="rounded-2xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#1d6fa4]/8 rounded-bl-full pointer-events-none" />

          {/* Role label */}
          <div className="mb-6 flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-40">
              Registered Receiver
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded bg-green-100 text-green-700">
              Active
            </span>
          </div>

          {/* Top section */}
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">

            {/* Avatar — camera overlay only visible in edit mode */}
            <div className="relative">
              <div
                style={avatarStyle}
                onClick={isOwner && editing ? () => fileInputRef.current?.click() : undefined}
                className={isOwner && editing ? "cursor-pointer group" : "cursor-default"}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={receiver.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-4xl font-serif text-[#1d6fa4] select-none">
                    {initials}
                  </span>
                )}
                {/* Camera overlay — only when editing */}
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
                className="absolute -bottom-2 -right-2 w-12 h-12 text-white rounded-full flex items-center justify-center font-bold border-4 border-white text-sm"
                style={{ backgroundColor: "#1d6fa4" }}
              >
                {receiver.bloodGroup}
              </div>

              {isOwner && (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              )}

              {uploadMsg && (
                <div
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-white"
                  style={{ backgroundColor: uploadMsg.ok ? "#22c55e" : "#ef4444" }}
                >
                  {uploadMsg.text}
                </div>
              )}
            </div>

            {/* Name + meta */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-serif mb-2">{receiver.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-5 text-xs font-medium opacity-75">
                <span>📍 {receiver.location || "—"}</span>
                <span>📞 {receiver.phone    || "—"}</span>
                <span>✉️ {receiver.email}</span>
              </div>
            </div>
          </div>

          {/* ── Edit form (owner only, shown when editing=true) ── */}
          {isOwner && editing && (
            <div className="mt-8 p-6 rounded-xl border border-[#E8E2D9] bg-[#FDFAF6]">
              <p className="text-[9px] uppercase tracking-widest font-bold opacity-40 mb-4">
                Edit profile
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "name",     label: "Full name",       type: "text" },
                  { key: "phone",    label: "Phone",           type: "tel"  },
                  { key: "location", label: "City / district", type: "text" },
                ].map(({ key, label, type }) => (
                  <div key={key}>
                    <label className="block text-[9px] uppercase tracking-widest font-bold opacity-40 mb-1">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={editFields[key]}
                      onChange={(e) => setEditFields((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1d6fa4]"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-[9px] uppercase tracking-widest font-bold opacity-40 mb-1">
                    Blood group
                  </label>
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
                  className="px-6 py-2 bg-[#1d6fa4] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#155b8a] transition-all disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
                {saveMsg && (
                  <span
                    className="text-xs font-semibold"
                    style={{ color: saveMsg.ok ? "#22c55e" : "#ef4444" }}
                  >
                    {saveMsg.text}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Registered date strip */}
          <div className="mt-8 p-5 rounded-xl border border-[#F0EDE8] bg-[#FDFAF6] flex items-center gap-3">
            <span className="text-base">📅</span>
            <div>
              <p className="text-[9px] uppercase tracking-widest font-bold opacity-40 mb-0.5">Registered</p>
              <p className="text-sm font-semibold">{joinDate}</p>
            </div>
          </div>

          {/* Stats — 2 cards only (no Pending) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 border-t border-[#F0EDE8] pt-8">
            <StatBox value={requestsPlaced}    label="Requests Placed" valueClass="text-3xl font-bold text-[#AF4444]" />
            <StatBox value={requestsFulfilled} label="Fulfilled"        valueClass="text-3xl font-bold text-green-600" />
          </div>

          {/* ── Active requests list with mark-fulfilled (owner only) ── */}
          {isOwner && requests.filter((r) => r.status !== "completed").length > 0 && (
            <div className="mt-8 border-t border-[#F0EDE8] pt-8">
              <p className="text-[9px] uppercase tracking-widest font-bold opacity-40 mb-4">
                Active requests
              </p>
              <div className="flex flex-col gap-3">
                {requests
                  .filter((r) => r.status !== "completed")
                  .map((r) => (
                    <div
                      key={r._id}
                      className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-[#E8E2D9] bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                          style={{ backgroundColor: "#AF4444" }}
                        >
                          {r.bloodGroup}
                        </span>
                        <div>
                          <p className="text-sm font-semibold">{r.hospital}</p>
                          <p className="text-xs opacity-50">{r.location} · {r.unitsNeeded} unit{r.unitsNeeded !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleFulfil(r._id)}
                        disabled={fulfillingId === r._id}
                        className="text-[9px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-full border border-green-500 text-green-600 hover:bg-green-50 transition-all disabled:opacity-40 flex-shrink-0"
                      >
                        {fulfillingId === r._id ? "Saving…" : "Mark fulfilled"}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {isOwner && (
            <div className="mt-10 flex flex-col md:flex-row gap-4">
              <Link
                to="/request"
                className="flex-1 text-center py-4 bg-[#AF4444] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#8f3030] transition-all"
              >
                Place a New Request
              </Link>
              {/* Replaced "View Blood List" with "See Fulfilled Requests" — public page */}
              <Link
                to="/fulfilled-requests"
                className="flex-1 text-center py-4 border border-[#E8E2D9] text-[#3D2B2B] text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#F9F7F2] transition-all"
              >
                See Fulfilled Requests
              </Link>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-xs font-bold uppercase tracking-widest text-sky-200/70 hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatBox({ value, label, valueClass }) {
  return (
    <div
      className="p-6 rounded-xl text-center transition-all duration-300 hover:-translate-y-0.5"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E2D9" }}
    >
      <span className={`block mb-1 ${valueClass}`}>{value}</span>
      <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">{label}</span>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const bgStyle = {
  backgroundImage: "linear-gradient(135deg, rgba(15,40,80,0.88) 0%, rgba(29,78,132,0.80) 50%, rgba(15,40,80,0.88) 100%)",
  backgroundAttachment: "fixed",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundColor: "#0f2850",
};

const glassCard = {
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(15px)",
  WebkitBackdropFilter: "blur(15px)",
  border: "1px solid rgba(255,255,255,0.4)",
  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
};

const avatarStyle = {
  width: 120, height: 120,
  borderRadius: "50%",
  border: "4px solid white",
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  backgroundColor: "#F9F7F2",
  display: "flex", alignItems: "center", justifyContent: "center",
  overflow: "hidden", position: "relative",
};