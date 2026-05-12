import { Link } from "react-router-dom";

const BADGE_STYLES = {
  Platinum: { background: "linear-gradient(135deg,#e5e4e2,#ffffff)", color: "#4a4a4a" },
  Gold:     { background: "linear-gradient(135deg,#d4af37,#f9f295)", color: "#5c441a" },
  Silver:   { background: "linear-gradient(135deg,#c0c0c0,#e8e8e8)", color: "#333" },
  Bronze:   { background: "linear-gradient(135deg,#cd7f32,#f5d1b0)", color: "#4d2600" },
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DonorCard({ donor }) {
  const badgeStyle = BADGE_STYLES[donor.badge] ?? BADGE_STYLES.Bronze;
  const available = donor.availability === "available";

  return (
    <div className="dl-card">
      <div className="dl-card-badge" style={badgeStyle}>{donor.badge}</div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h4 style={{ fontFamily: "'Lora',serif", fontSize: "1.15rem", color: "#3D2B2B", margin: "0 0 4px" }}>
            {donor.name}
          </h4>
          <p style={{ fontSize: 10, opacity: .5, margin: 0, letterSpacing: ".05em" }}>
            📍 {donor.location}
          </p>
        </div>

        <div style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "rgba(167,215,236,.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 13,
          color: "#3D2B2B",
          flexShrink: 0,
        }}>
          {donor.bloodGroup}
        </div>
      </div>

      <div style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ opacity: .6 }}>Status</span>
          <span style={{
            fontWeight: 700,
            color: available ? "#16a34a" : "#d97706",
          }}>
            {available ? "Available" : "Away"}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ opacity: .6 }}>Donations</span>
          <span style={{ fontWeight: 700 }}>{donor.donationCount}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ opacity: .6 }}>Last Donation</span>
          <span>{formatDate(donor.lastDonation)}</span>
        </div>
      </div>

      {available ? (
        <Link
          to={`/donors/${donor._id}`}
          style={{
            display: "block",
            textAlign: "center",
            padding: "12px 20px",
            background: "#3D2B2B",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            textDecoration: "none",
            borderRadius: 8,
            transition: "background .2s, transform .15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#000"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#3D2B2B"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          See Profile
        </Link>
      ) : (
        <button
          disabled
          style={{
            width: "100%",
            padding: "12px 20px",
            background: "#F9F7F2",
            color: "#3D2B2B",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            border: "1px solid #E8E2D9",
            borderRadius: 8,
            opacity: .45,
            cursor: "not-allowed",
          }}
        >
          Currently Away
        </button>
      )}
    </div>
  );
}
