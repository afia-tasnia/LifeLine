import { useState } from "react";

const HOSPITALS = [
  "Dhaka Medical College Hospital",
  "Evercare Hospital Dhaka",
  "Square Hospital",
  "United Hospital",
  "Bangabandhu Sheikh Mujib Medical University",
  "National Heart Foundation Hospital",
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function Reserve() {
  const [form, setForm] = useState({
    name: "", phone: "", blood: "A+", hospital: HOSPITALS[0], date: "", time: "", note: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.date || !form.time) return;
    setSubmitted(true);
    // TODO: POST to /api/reserves with form data + auth token
  };

  return (
    <div
      className="min-h-screen bg-[#F9F7F2] text-[#3D2B2B]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Hero Header */}
      <div className="pt-16 pb-10 text-center px-6">
        <span className="inline-block text-[10px] uppercase tracking-[0.35em] text-[#8E4444] font-bold mb-4 bg-[#8E4444]/10 px-4 py-2 rounded-full">
          LifeLine Reservations
        </span>
        <h1 className="text-4xl md:text-5xl font-serif mb-3">
          Save a Life.<br />
          <span className="text-[#8E4444]">Schedule a Donation.</span>
        </h1>
        <p className="text-sm opacity-60 max-w-md mx-auto">
          Choose a hospital and a time that works for you. The hospital admin will confirm your slot.
        </p>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 pb-24">
        <div className="bg-white/50 backdrop-blur-sm border border-[#3D2B2B]/5 rounded-3xl shadow-xl p-8 md:p-10">

          {submitted ? (
            /* Success State */
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl animate-bounce">
                ✅
              </div>
              <h3 className="text-2xl font-serif text-[#3D2B2B]">Reservation Submitted!</h3>
              <p className="text-sm opacity-60 max-w-sm">
                Your slot request has been sent to the hospital. You'll receive a confirmation
                call within 2 hours.
              </p>
              <button
                className="mt-4 py-3 px-8 bg-[#3D2B2B] text-white text-[10px] uppercase tracking-widest rounded-full hover:bg-[#AF4444] transition-all"
                onClick={() => { setSubmitted(false); setForm({ name: "", phone: "", blood: "A+", hospital: HOSPITALS[0], date: "", time: "", note: "" }); }}
              >
                Submit Another
              </button>
            </div>
          ) : (
            /* Reservation Form */
            <div className="space-y-7">

              {/* Name + Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.3em] font-black mb-3 opacity-70">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Arif Hossain"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className="w-full bg-transparent border-b-2 border-[#3D2B2B]/10 focus:border-[#AF4444] outline-none py-3 text-base transition-colors placeholder:opacity-30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.3em] font-black mb-3 opacity-70">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="01X-XXXXXXXX"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    className="w-full bg-transparent border-b-2 border-[#3D2B2B]/10 focus:border-[#AF4444] outline-none py-3 text-base transition-colors placeholder:opacity-30"
                  />
                </div>
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] font-black mb-4 opacity-70">
                  Your Blood Group
                </label>
                <div className="flex flex-wrap gap-2">
                  {BLOOD_GROUPS.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => set("blood", bg)}
                      className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${
                        form.blood === bg
                          ? "bg-[#AF4444] border-[#AF4444] text-white scale-105 shadow"
                          : "border-[#3D2B2B]/15 text-[#3D2B2B]/60 hover:border-[#AF4444]/50"
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hospital */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] font-black mb-3 opacity-70">
                  Select Hospital Blood Bank
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {HOSPITALS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => set("hospital", h)}
                      className={`text-left px-4 py-3 rounded-xl text-xs border-2 transition-all ${
                        form.hospital === h
                          ? "bg-[#3D2B2B] border-[#3D2B2B] text-white"
                          : "border-[#3D2B2B]/10 hover:border-[#3D2B2B]/30 text-[#3D2B2B]"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.3em] font-black mb-3 opacity-70">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => set("date", e.target.value)}
                    className="w-full bg-transparent border-b-2 border-[#3D2B2B]/10 focus:border-[#AF4444] outline-none py-3 text-base transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.3em] font-black mb-3 opacity-70">
                    Preferred Time
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => set("time", e.target.value)}
                    className="w-full bg-transparent border-b-2 border-[#3D2B2B]/10 focus:border-[#AF4444] outline-none py-3 text-base transition-colors"
                  />
                </div>
              </div>

              {/* Optional Note */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] font-black mb-3 opacity-70">
                  Additional Note{" "}
                  <span className="normal-case tracking-normal font-normal opacity-50">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Any relevant health info, special requests..."
                  value={form.note}
                  onChange={(e) => set("note", e.target.value)}
                  className="w-full bg-transparent border-b-2 border-[#3D2B2B]/10 focus:border-[#AF4444] outline-none py-3 text-sm resize-none transition-colors placeholder:opacity-30"
                />
              </div>

              {/* Consent */}
              <div className="bg-[#AF4444]/5 rounded-2xl p-4 border border-[#AF4444]/15">
                <p className="text-[10px] leading-relaxed opacity-70">
                  🩸 By submitting, you confirm you are in good health, have not donated blood in the last
                  56 days, and agree to LifeLine's terms of service. The hospital admin will contact you
                  to finalize your slot.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!form.name || !form.phone || !form.date || !form.time}
                className="w-full py-5 bg-[#3D2B2B] text-white text-[11px] font-bold uppercase tracking-[0.4em] rounded-2xl hover:bg-[#AF4444] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                Confirm Reservation →
              </button>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}