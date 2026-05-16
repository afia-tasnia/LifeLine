// src/utils/bloodCompatibility.js
// Mirror of the backend utility — used by DonorList.jsx

export const compatibleDonors = {
  "A+":  ["A+", "A-", "O+", "O-"],
  "A-":  ["A-", "O-"],
  "B+":  ["B+", "B-", "O+", "O-"],
  "B-":  ["B-", "O-"],
  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  "AB-": ["A-", "B-", "AB-", "O-"],
  "O+":  ["O+", "O-"],
  "O-":  ["O-"],
};

export function getCompatibleDonorGroups(recipientGroup) {
  return compatibleDonors[recipientGroup] || [recipientGroup];
}

// ── HOW TO USE IN DonorList.jsx ────────────────────────────────────────────────
//
// 1. Add a "Show compatible donors" toggle checkbox in the filter bar:
//
//   const [showCompatible, setShowCompatible] = useState(false);
//
//   <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
//     <input
//       type="checkbox"
//       checked={showCompatible}
//       onChange={(e) => setShowCompatible(e.target.checked)}
//     />
//     Include compatible donors
//   </label>
//
// 2. Pass it to the API call:
//
//   const params = { bloodGroup: selectedBloodGroup };
//   if (showCompatible) params.compatible = "true";
//   const res = await axios.get("http://localhost:5000/api/users/donors", { params });
//
// 3. Show a badge on donor cards when they're a compatible (not exact) match:
//
//   const isExact = donor.bloodGroup === selectedBloodGroup;
//   {!isExact && showCompatible && (
//     <span style={{
//       background: "#FFF3E0", color: "#e67e22",
//       fontSize: 11, padding: "2px 8px", borderRadius: 99,
//     }}>
//       Compatible donor
//     </span>
//   )}