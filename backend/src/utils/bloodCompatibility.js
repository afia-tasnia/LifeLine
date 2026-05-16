// Blood compatibility map — key can RECEIVE FROM value[]
// Used by DonorList to suggest compatible donors when exact match not found
export const compatibleDonors = {
  "A+":  ["A+", "A-", "O+", "O-"],
  "A-":  ["A-", "O-"],
  "B+":  ["B+", "B-", "O+", "O-"],
  "B-":  ["B-", "O-"],
  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], // universal receiver
  "AB-": ["A-", "B-", "AB-", "O-"],
  "O+":  ["O+", "O-"],
  "O-":  ["O-"],                                               // universal donor
};

// Returns an array of blood groups that can donate to the given group
export function getCompatibleDonorGroups(recipientGroup) {
  return compatibleDonors[recipientGroup] || [recipientGroup];
}