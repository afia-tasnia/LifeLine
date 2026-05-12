import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ReceiverProfile() {
  const { user: authUser } = useAuth(); // ✅ inside the component

  const [receiver, setReceiver]           = useState(null);
  const [loading, setLoading]             = useState(true);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading]         = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // ✅ Single useEffect — reads from auth, no mock data
  useEffect(() => {
    if (authUser) {
      setReceiver({
        _id:               authUser._id,
        name:              authUser.name,
        email:             authUser.email,
        bloodGroup:        authUser.bloodGroup  ?? "—",
        phone:             authUser.phone       ?? "—",
        role:              authUser.role,
        location:          authUser.location    ?? "—",
        hospital:          authUser.hospital    ?? "—",
        condition:         authUser.condition   ?? "—",
        registeredAt:      authUser.createdAt   ?? null,
        requestsPlaced:    authUser.requestsPlaced    ?? 0,
        requestsFulfilled: authUser.requestsFulfilled ?? 0,
        status:            authUser.status      ?? "active",
        avatarUrl:         authUser.avatarUrl   ?? null,
        note:              authUser.note        ?? null,
      });
      setAvatarPreview(authUser.avatarUrl ?? null);
      setLoading(false);
    }
  }, [authUser]);

  // ── Avatar handlers ──────────────────────────────────────────────────
  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);

    // TODO Phase 4: upload via axios.put(`/api/receivers/${authUser._id}/avatar`, formData)
    setUploading(true);
    setUploadSuccess(false);
    setTimeout(() => {
      setUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }, 1200);
  }

  const initials = receiver
    ? receiver.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const joinDate = receiver?.registeredAt
    ? new Date(receiver.registeredAt).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : "—";

  if (loading) {
    return (
      <div style={bgStyle} className="min-h-screen flex items-center justify-center">
        <div className="text-white/70 text-sm uppercase tracking-widest animate-pulse">
          Loading profile…
        </div>
      </div>
    );
  }

  return (
    <div style={bgStyle} className="min-h-screen text-[#3D2B2B]">
      <main className="max-w-4xl mx-auto pt-20 px-4 pb-24">

        {/* ── Glass Card ────────────────────────────────────────────── */}
        <div style={glassCard} className="rounded-2xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#1d6fa4]/8 rounded-bl-full pointer-events-none" />

          {/* Role label */}
          <div className="mb-6 flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-40">
              Registered Receiver
            </span>
            <span
              className={`text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded ${
                receiver.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {receiver.status === "active" ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Top section */}
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">

            {/* Avatar + upload */}
            <div className="relative group">
              <button onClick={handleAvatarClick} className="relative focus:outline-none">
                <div style={avatarStyle}>
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
                  <div className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <CameraIcon />
                    <span className="text-white text-[9px] font-bold uppercase tracking-wider mt-1">
                      Change
                    </span>
                  </div>
                </div>
                <div
                  className="absolute -bottom-2 -right-2 w-12 h-12 text-white rounded-full flex items-center justify-center font-bold border-4 border-white text-sm"
                  style={{ backgroundColor: "#1d6fa4" }}
                >
                  {receiver.bloodGroup}
                </div>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />

              {(uploading || uploadSuccess) && (
                <div
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-white"
                  style={{ backgroundColor: uploading ? "#888" : "#22c55e" }}
                >
                  {uploading ? "Uploading…" : "✓ Saved"}
                </div>
              )}
            </div>

            {/* Name + details */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-serif mb-2">{receiver.name}</h1>
              {receiver.note && (
                <p className="text-sm opacity-50 mb-5 italic">"{receiver.note}"</p>
              )}
              <div className="flex flex-wrap justify-center md:justify-start gap-5 text-xs font-medium opacity-75">
                <span>📍 {receiver.location}</span>
                <span>📞 {receiver.phone}</span>
                <span>✉️ {receiver.email}</span>
              </div>
            </div>
          </div>

          {/* Medical info strip */}
          <div className="mt-8 p-5 rounded-xl border border-[#F0EDE8] bg-[#FDFAF6] flex flex-col md:flex-row gap-4 md:gap-10">
            <InfoItem label="Hospital"   value={receiver.hospital}  icon="🏥" />
            <InfoItem label="Condition"  value={receiver.condition} icon="🩺" />
            <InfoItem label="Registered" value={joinDate}           icon="📅" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 border-t border-[#F0EDE8] pt-8">
            <StatBox value={receiver.requestsPlaced}    label="Requests Placed" valueClass="text-3xl font-bold text-[#AF4444]" />
            <StatBox value={receiver.requestsFulfilled} label="Fulfilled"       valueClass="text-3xl font-bold text-green-600" />
            <StatBox value={receiver.requestsPlaced - receiver.requestsFulfilled} label="Pending" valueClass="text-3xl font-bold text-orange-400" />
          </div>

          {/* Actions */}
          <div className="mt-10 flex flex-col md:flex-row gap-4">
            <Link
              to="/request"
              className="flex-1 text-center py-4 bg-[#AF4444] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#8f3030] transition-all"
            >
              Place a New Request
            </Link>
            <a
              href={`tel:${receiver.phone}`}
              className="flex-1 text-center py-4 bg-[#3D2B2B] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all"
            >
              Contact Receiver
            </a>
            <Link
              to="/blood-list"
              className="flex-1 text-center py-4 border border-[#E8E2D9] text-[#3D2B2B] text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#F9F7F2] transition-all"
            >
              View Blood List
            </Link>
          </div>
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

// ── Sub-components ──────────────────────────────────────────────────────────

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

function InfoItem({ label, value, icon }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-base mt-0.5">{icon}</span>
      <div>
        <p className="text-[9px] uppercase tracking-widest font-bold opacity-40 mb-0.5">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
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

// ── Styles ──────────────────────────────────────────────────────────────────

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
  overflow: "hidden", position: "relative", cursor: "pointer",
};