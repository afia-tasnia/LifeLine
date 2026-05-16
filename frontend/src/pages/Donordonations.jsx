import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:5000/api";

export default function DonorDonations() {
  const { id }              = useParams();          // donor's user ID from URL
  const { user: authUser }  = useAuth();

  const isOwner = authUser?._id === id;

  const [donations,  setDonations]  = useState([]);
  const [donorName,  setDonorName]  = useState("");
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [deleteMsg,  setDeleteMsg]  = useState(null); // { ok, text }

  // ── Load donations from public endpoint ─────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.get(`${API}/donations/donor/${id}`);
        setDonations(data);
        // Grab the donor's name from the first record if available
        if (data.length > 0 && data[0].donorId?.name) {
          setDonorName(data[0].donorId?.name || "");
        } else {
          // Fall back to fetching the donor profile
          try {
            const { data: donor } = await axios.get(`${API}/users/donors/${id}`);
            setDonorName(donor.name || "");
          } catch {
            // Non-fatal
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load donation history.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Delete (owner only) ──────────────────────────────────────────────────
  async function handleDelete(donationId) {
    if (!window.confirm("Remove this donation record? This cannot be undone.")) return;

    setDeletingId(donationId);
    setDeleteMsg(null);
    try {
      await axios.delete(`${API}/donations/${donationId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDonations((prev) => prev.filter((d) => d._id !== donationId));
      setDeleteMsg({ ok: true, text: "Donation record removed." });
    } catch (err) {
      setDeleteMsg({
        ok: false,
        text: err.response?.data?.message || "Failed to delete donation.",
      });
    } finally {
      setDeletingId(null);
      setTimeout(() => setDeleteMsg(null), 3500);
    }
  }

  // ── Derived ──────────────────────────────────────────────────────────────
  const totalUnits = donations.reduce((sum, d) => sum + (d.units || 0), 0);

  return (
    <div style={bgStyle} className="min-h-screen text-[#3D2B2B]">
      <main className="max-w-4xl mx-auto pt-16 px-4 pb-24">

        {/* Back link */}
        <div className="mb-6">
          <Link
            to={`/donors/${id}`}
            className="text-[9px] uppercase tracking-widest font-bold text-white/60 hover:text-white transition-colors"
          >
            ← Back to Profile
          </Link>
        </div>

        <div style={glassCard} className="rounded-2xl p-8 md:p-12">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8E2D9] pb-8 mb-8">
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-40 mb-1">
                Donation History
              </p>
              <h1 className="text-3xl font-serif text-[#3D2B2B]">
                {donorName ? `${donorName}'s Donations` : "Donation History"}
              </h1>
              {!loading && !error && (
                <p className="text-sm opacity-60 mt-1">
                  {donations.length} record{donations.length !== 1 ? "s" : ""} ·{" "}
                  {totalUnits} unit{totalUnits !== 1 ? "s" : ""} total
                </p>
              )}
            </div>

            {/* Summary badges */}
            {!loading && !error && donations.length > 0 && (
              <div className="flex gap-3">
                <div className="text-center px-5 py-3 rounded-xl bg-[#F9F7F2] border border-[#E8E2D9]">
                  <span className="block text-2xl font-bold text-[#AF4444]">
                    {donations.length}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest font-bold opacity-40">
                    Donations
                  </span>
                </div>
                <div className="text-center px-5 py-3 rounded-xl bg-[#F9F7F2] border border-[#E8E2D9]">
                  <span className="block text-2xl font-bold text-green-600">
                    {totalUnits}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest font-bold opacity-40">
                    Units
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Toast message */}
          {deleteMsg && (
            <div
              className="mb-6 px-4 py-3 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: deleteMsg.ok ? "#22c55e" : "#ef4444" }}
            >
              {deleteMsg.text}
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="py-20 text-center text-[10px] uppercase tracking-widest font-bold opacity-30 animate-pulse">
              Loading…
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <div className="text-3xl mb-4">⚠️</div>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : donations.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-4xl mb-4">🩸</div>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-30">
                No donations recorded yet.
              </p>
              {isOwner && (
                <p className="text-sm opacity-50 mt-2">
                  Head to the blood list to donate and your records will appear here.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {donations.map((donation) => (
                <DonationCard
                  key={donation._id}
                  donation={donation}
                  isOwner={isOwner}
                  deletingId={deletingId}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Donation Card ─────────────────────────────────────────────────────────────

function DonationCard({ donation, isOwner, deletingId, onDelete }) {
  const date = new Date(donation.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const receiverName     = donation.receiverId?.name     || "Anonymous";
  const receiverLocation = donation.receiverId?.location || "—";

  return (
    <div
      className="flex flex-col md:flex-row items-center justify-between gap-5 p-5 md:p-6 rounded-xl bg-white"
      style={{ border: "1px solid #E8E2D9", borderLeft: "5px solid #AF4444" }}
    >
      {/* Left: info */}
      <div className="flex items-center gap-4 flex-1">
        {/* Units circle */}
        <div
          className="w-14 h-14 rounded-full flex flex-col items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "#FDF0F0", border: "1px solid #E8E2D9" }}
        >
          <span className="text-lg font-bold text-[#AF4444] leading-none">
            {donation.units}
          </span>
          <span className="text-[8px] uppercase font-bold opacity-40 leading-none mt-0.5">
            unit{donation.units !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Details */}
        <div>
          <p className="text-sm font-semibold text-[#3D2B2B]">
            Donated to{" "}
            <span className="text-[#AF4444]">{receiverName}</span>
          </p>
          <p className="text-xs opacity-50 mt-0.5">
            📍 {receiverLocation}
          </p>
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-30 mt-1">
            {date}
          </p>
        </div>
      </div>

      {/* Right: delete (owner only) */}
      {isOwner && (
        <button
          onClick={() => onDelete(donation._id)}
          disabled={deletingId === donation._id}
          className="text-[9px] uppercase tracking-widest font-bold px-4 py-2 rounded-full border border-red-300 text-red-500 hover:bg-red-50 transition-all disabled:opacity-40 flex-shrink-0"
        >
          {deletingId === donation._id ? "Removing…" : "Remove"}
        </button>
      )}
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const bgStyle = {
  backgroundImage:
    "linear-gradient(rgba(61,43,43,0.7), rgba(61,43,43,0.7)), url('/resources/donor_profile.jpg')",
  backgroundAttachment: "fixed",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const glassCard = {
  background: "rgba(255,255,255,0.90)",
  backdropFilter: "blur(15px)",
  WebkitBackdropFilter: "blur(15px)",
  border: "1px solid rgba(255,255,255,0.4)",
  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
};