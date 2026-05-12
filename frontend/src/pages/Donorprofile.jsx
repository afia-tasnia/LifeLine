import { useState, useRef, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

// Badge config
const BADGE_CONFIG = {
  Bronze: { color: "#CD7F32", bg: "#FDF3E7", label: "Bronze Member" },
  Silver: { color: "#A8A9AD", bg: "#F4F4F5", label: "Silver Member" },
  Gold: { color: "#D4AF37", bg: "#FFFBEA", label: "Gold Member" },
  Platinum: { color: "#AF4444", bg: "#FDF0F0", label: "Platinum Member" },
};

function getBadge(count) {
  if (count >= 20) return "Platinum";
  if (count >= 10) return "Gold";
  if (count >= 5) return "Silver";
  return "Bronze";
}

export default function DonorProfile() {
  const { id } = useParams();

  // ── State ──────────────────────────────────────────────────────────────────
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // ── Fetch donor from backend ───────────────────────────────────────────────
  useEffect(() => {
    const loadDonor = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(`http://localhost:5000/api/donors/${id}`);
        setDonor(response.data);
        setAvatarPreview(response.data.avatarUrl || null);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load donor profile.");
      } finally {
        setLoading(false);
      }
    };

    loadDonor();
  }, [id]);

  // ── Profile picture handlers ───────────────────────────────────────────────
  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side preview
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);

    // TODO (Phase 3): upload to backend
    // const formData = new FormData();
    // formData.append("avatar", file);
    // axios.put(`/api/donors/${id}/avatar`, formData).then(...)

    // Simulated upload feedback
    setUploading(true);
    setUploadSuccess(false);
    setTimeout(() => {
      setUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }, 1200);
  }

  const badge = donor ? getBadge(donor.donationCount) : "Bronze";
  const badgeCfg = BADGE_CONFIG[badge];

  const initials = donor
    ? donor.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";

  const formattedDate = donor?.lastDonation
    ? new Date(donor.lastDonation).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  if (error) {
    return (
      <div
        style={bgStyle}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="text-white/70 text-sm uppercase tracking-widest text-center px-4">
          <div className="text-3xl mb-4">⚠️</div>
          {error}
        </div>
      </div>
    );
  }

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={bgStyle}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="text-white/70 text-sm uppercase tracking-widest animate-pulse">
          Loading profile…
        </div>
      </div>
    );
  }

  return (
    <div style={bgStyle} className="min-h-screen text-[#3D2B2B]">
      <main className="max-w-4xl mx-auto pt-20 px-4 pb-24">
        {/* ── Glass Card ─────────────────────────────────────────────────── */}
        <div style={glassCard} className="rounded-2xl p-8 md:p-12 relative overflow-hidden">
          {/* Decorative corner blob */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#AF4444]/5 rounded-bl-full pointer-events-none" />

          {/* ── Top section ────────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            {/* Avatar + upload */}
            <div className="relative group">
              <button
                onClick={handleAvatarClick}
                title="Change profile picture"
                className="relative focus:outline-none"
              >
                {/* Avatar circle */}
                <div style={avatarStyle}>
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={donor.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-4xl font-serif text-[#AF4444] select-none">
                      {initials}
                    </span>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <CameraIcon />
                    <span className="text-white text-[9px] font-bold uppercase tracking-wider mt-1">
                      Change
                    </span>
                  </div>
                </div>

                {/* Blood group badge */}
                <div
                  className="absolute -bottom-2 -right-2 w-12 h-12 text-white rounded-full flex items-center justify-center font-bold border-4 border-white text-sm"
                  style={{ backgroundColor: "#AF4444" }}
                >
                  {donor.bloodGroup}
                </div>
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Upload status pill */}
              {(uploading || uploadSuccess) && (
                <div
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-white"
                  style={{
                    backgroundColor: uploading ? "#888" : "#22c55e",
                    transition: "background-color 0.3s",
                  }}
                >
                  {uploading ? "Uploading…" : "✓ Saved"}
                </div>
              )}
            </div>

            {/* Name + badge + contact */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-3xl font-serif">{donor.name}</h1>
                <span
                  className="inline-block px-4 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest"
                  style={{ color: badgeCfg.color, backgroundColor: badgeCfg.bg }}
                >
                  {badgeCfg.label}
                </span>
              </div>

              {donor.quote && (
                <p className="text-sm opacity-50 mb-5 italic">"{donor.quote}"</p>
              )}

              <div className="flex flex-wrap justify-center md:justify-start gap-5 text-xs font-medium opacity-75">
                <span>📍 {donor.location}</span>
                <span>📞 {donor.phone}</span>
                <span>✉️ {donor.email}</span>
              </div>
            </div>
          </div>

          {/* ── Stats row ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 border-t border-[#F0EDE8] pt-10">
            <StatBox
              value={donor.donationCount}
              label="Total Donations"
              valueClass="text-3xl font-bold text-[#AF4444]"
            />

            <StatBox
              label="Current Status"
              valueClass=""
              customValue={
                <span
                  className={`text-lg font-bold flex items-center justify-center gap-2 ${
                    donor.availability === "available"
                      ? "text-green-600"
                      : "text-orange-500"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      donor.availability === "available"
                        ? "bg-green-600"
                        : "bg-orange-500"
                    }`}
                  />
                  {donor.availability === "available" ? "Available" : "Unavailable"}
                </span>
              }
            />

            <StatBox
              value={formattedDate}
              label="Last Contribution"
              valueClass="text-lg font-bold"
            />
          </div>

          {/* ── Action buttons ─────────────────────────────────────────── */}
          <div className="mt-10 flex flex-col md:flex-row gap-4">
            <a
              href={`tel:${donor.phone}`}
              className="flex-1 text-center py-4 bg-[#3D2B2B] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all"
            >
              Call Donor Now
            </a>
            <button className="flex-1 text-center py-4 border border-[#E8E2D9] text-[#3D2B2B] text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#F9F7F2] transition-all">
              Send Message
            </button>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link
            to="/donors"
            className="text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors"
          >
            ← Back to Donor Directory
          </Link>
        </div>
      </main>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatBox({ value, label, valueClass, customValue }) {
  return (
    <div
      className="p-6 rounded-xl text-center transition-all duration-300 hover:-translate-y-0.5"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E8E2D9",
      }}
    >
      {customValue ?? (
        <span className={`block mb-1 ${valueClass}`}>{value}</span>
      )}
      <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
        {label}
      </span>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
      />
    </svg>
  );
}

// ── Inline styles (mirrors donor_profile.css) ──────────────────────────────

const bgStyle = {
  backgroundImage:
    "linear-gradient(rgba(61,43,43,0.7), rgba(61,43,43,0.7)), url('/resources/donor_profile.jpg')",
  backgroundAttachment: "fixed",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const glassCard = {
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(15px)",
  WebkitBackdropFilter: "blur(15px)",
  border: "1px solid rgba(255,255,255,0.4)",
  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
};

const avatarStyle = {
  width: 120,
  height: 120,
  borderRadius: "50%",
  border: "4px solid white",
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  backgroundColor: "#F9F7F2",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  position: "relative",
  cursor: "pointer",
};