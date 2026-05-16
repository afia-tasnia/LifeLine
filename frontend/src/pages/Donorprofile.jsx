import { useState, useRef, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:5000/api";

const BADGE_CONFIG = {
  Bronze:   { color: "#CD7F32", bg: "#FDF3E7", label: "Bronze Member" },
  Silver:   { color: "#A8A9AD", bg: "#F4F4F5", label: "Silver Member" },
  Gold:     { color: "#D4AF37", bg: "#FFFBEA", label: "Gold Member" },
  Platinum: { color: "#AF4444", bg: "#FDF0F0", label: "Platinum Member" },
};

function getBadge(count) {
  if (count >= 20) return "Platinum";
  if (count >= 10) return "Gold";
  if (count >= 5)  return "Silver";
  return "Bronze";
}

export default function DonorProfile() {
  const { id }              = useParams();
  const { user: authUser, login } = useAuth();

  const isOwner = authUser?._id === id;

  // ── State ──────────────────────────────────────────────────────────────────
  const [donor,         setDonor]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [cooldown,      setCooldown]      = useState(null);

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading,     setUploading]     = useState(false);
  const [uploadMsg,     setUploadMsg]     = useState(null); // { ok: bool, text: string }
  const fileInputRef = useRef(null);

  // Edit form
  const [editing,    setEditing]    = useState(false);
  const [editFields, setEditFields] = useState({});
  const [saving,     setSaving]     = useState(false);
  const [saveMsg,    setSaveMsg]    = useState(null);

  // Availability toggle
  const [togglingAvail, setTogglingAvail] = useState(false);

  // ── Load donor ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.get(`${API}/users/donors/${id}`);
        setDonor(data);
        setAvatarPreview(data.avatarUrl ? `http://localhost:5000${data.avatarUrl}` : null);
        setEditFields({
          name:      data.name      || "",
          phone:     data.phone     || "",
          location:  data.location  || "",
          bloodGroup: data.bloodGroup || "",
        });
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load donor profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Cooldown (owner only) ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOwner) return;
    axios
      .get(`${API}/donations/cooldown-status`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setCooldown(res.data))
      .catch(() => {});
  }, [id, isOwner]);

  // ── Avatar upload ──────────────────────────────────────────────────────────
  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optimistic preview
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
      setDonor((d) => ({ ...d, avatarUrl: data.avatarUrl }));

      const updatedUser = { ...authUser, avatarUrl: data.avatarUrl };
      login(localStorage.getItem("token"), updatedUser);

      setUploadMsg({ ok: true, text: "✓ Photo saved" });
    } catch (err) {
      setUploadMsg({ ok: false, text: err.response?.data?.message || "Upload failed" });
      // Revert preview on failure
      setAvatarPreview(
        donor?.avatarUrl ? `http://localhost:5000${donor.avatarUrl}` : null
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
      setDonor((d) => ({ ...d, ...data }));
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

  // ── Availability toggle ────────────────────────────────────────────────────
  async function handleToggleAvailability() {
    if (!donor) return;
    const next = donor.availability === "available" ? "unavailable" : "available";
    setTogglingAvail(true);
    try {
      const { data } = await axios.put(
        `${API}/users/profile`,
        { availability: next },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setDonor((d) => ({ ...d, availability: data.availability }));
      const updatedUser = { ...authUser, availability: data.availability };
      login(localStorage.getItem("token"), updatedUser);
    } catch {
      // Non-fatal
    } finally {
      setTogglingAvail(false);
    }
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const badge    = donor ? getBadge(donor.donationCount) : "Bronze";
  const badgeCfg = BADGE_CONFIG[badge];
  const initials = donor
    ? donor.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "??";
  const formattedDate = donor?.lastDonatedAt
    ? new Date(donor.lastDonatedAt).toLocaleDateString("en-GB", {
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

        {/* Owner mode label */}
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
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#AF4444]/5 rounded-bl-full pointer-events-none" />

          {/* Top section */}
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">

            {/* ── Avatar
                FIX: removed `group` class from outer wrapper so `group-hover` doesn't
                bleed to the overlay for non-owners. The overlay div now also checks
                `isOwner` directly before rendering, so visitors never see the camera UI. */}
            <div className="relative">
              <div
                style={avatarStyle}
                onClick={isOwner ? () => fileInputRef.current?.click() : undefined}
                className={isOwner ? "cursor-pointer" : "cursor-default"}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={donor.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-4xl font-serif text-[#AF4444] select-none">{initials}</span>
                )}

                {/* Camera overlay — ONLY rendered for the profile owner */}
                {isOwner && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                    <CameraIcon />
                    <span className="text-white text-[9px] font-bold uppercase tracking-wider mt-1">
                      {uploading ? "Uploading…" : "Change"}
                    </span>
                  </div>
                )}
              </div>

              {/* Blood group badge */}
              <div
                className="absolute -bottom-2 -right-2 w-12 h-12 text-white rounded-full flex items-center justify-center font-bold border-4 border-white text-sm"
                style={{ backgroundColor: "#AF4444" }}
              >
                {donor.bloodGroup}
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
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-3xl font-serif">{donor.name}</h1>
                <span
                  className="inline-block px-4 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest"
                  style={{ color: badgeCfg.color, backgroundColor: badgeCfg.bg }}
                >
                  {badgeCfg.label}
                </span>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-5 text-xs font-medium opacity-75">
                <span>📍 {donor.location || "—"}</span>
                <span>📞 {donor.phone    || "—"}</span>
                <span>✉️ {donor.email}</span>
              </div>
            </div>
          </div>

          {/* Edit form (owner only) */}
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
                      className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#AF4444]"
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
                    className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#AF4444]"
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
                  className="px-6 py-2 bg-[#AF4444] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#8f3030] transition-all disabled:opacity-50"
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

          {/* Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 border-t border-[#F0EDE8] pt-10">
            <StatBox
              value={donor.donationCount}
              label="Total Donations"
              valueClass="text-3xl font-bold text-[#AF4444]"
            />

            <StatBox
              label="Current Status"
              customValue={
                <div>
                  <span
                    className={`text-lg font-bold flex items-center justify-center gap-2 ${
                      donor.availability === "available" ? "text-green-600" : "text-orange-500"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        donor.availability === "available" ? "bg-green-600" : "bg-orange-500"
                      }`}
                    />
                    {donor.availability === "available" ? "Available" : "Unavailable"}
                  </span>

                  {isOwner && (
                    <button
                      onClick={handleToggleAvailability}
                      disabled={togglingAvail}
                      className="mt-3 text-[9px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-full border border-current transition-all disabled:opacity-40"
                      style={{
                        color: donor.availability === "available" ? "#ea580c" : "#16a34a",
                        borderColor: donor.availability === "available" ? "#ea580c" : "#16a34a",
                      }}
                    >
                      {togglingAvail
                        ? "Updating…"
                        : donor.availability === "available"
                        ? "Mark unavailable"
                        : "Mark available"}
                    </button>
                  )}

                  {isOwner && cooldown && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: cooldown.inCooldown ? "#FDF3E7" : "#EAF6EC",
                        border: `1px solid ${cooldown.inCooldown ? "#f0a500" : "#27ae60"}44`,
                        fontSize: 13,
                      }}
                    >
                      {cooldown.inCooldown ? (
                        <>
                          🩸 <strong>Cooldown active</strong> — donate again in{" "}
                          <strong>
                            {cooldown.daysRemaining} day{cooldown.daysRemaining !== 1 ? "s" : ""}
                          </strong>.
                          <br />
                          <span style={{ color: "#888", fontSize: 12 }}>
                            Last donated: {new Date(cooldown.lastDonatedAt).toLocaleDateString()}
                          </span>
                        </>
                      ) : (
                        <>✅ You are <strong>eligible to donate</strong> today!</>
                      )}
                    </div>
                  )}
                </div>
              }
            />

            <StatBox value={formattedDate} label="Last Contribution" valueClass="text-lg font-bold" />
          </div>

          {/* Actions (owner only) */}
          {isOwner && (
            <div className="mt-10 flex flex-col md:flex-row gap-4">
              <Link
                to={`/donor-donations/${id}`}
                className="flex-1 text-center py-4 border border-[#E8E2D9] text-[#3D2B2B] text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#F9F7F2] transition-all"
              >
                My Donation History
              </Link>
            </div>
          )}
        </div>

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

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatBox({ value, label, valueClass, customValue }) {
  return (
    <div
      className="p-6 rounded-xl text-center transition-all duration-300 hover:-translate-y-0.5"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E2D9" }}
    >
      {customValue ?? <span className={`block mb-1 ${valueClass}`}>{value}</span>}
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
  backgroundImage: "linear-gradient(rgba(61,43,43,0.7), rgba(61,43,43,0.7)), url('/resources/donor_profile.jpg')",
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
  width: 120, height: 120,
  borderRadius: "50%",
  border: "4px solid white",
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  backgroundColor: "#F9F7F2",
  display: "flex", alignItems: "center", justifyContent: "center",
  overflow: "hidden", position: "relative",
};