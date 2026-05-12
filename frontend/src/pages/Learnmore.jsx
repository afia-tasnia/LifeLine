import { useState } from "react";

const rules = [
  {
    id: "01",
    title: "For Our Donors",
    color: "bg-[#AF4444]",
    conditions: [
      {
        icon: "🩺",
        title: "Health Verification",
        body: "Donors must provide proof of health condition when requested. You must be at least 18 years old and weigh over 50kg. Pregnant women and those with certain medical conditions are temporarily ineligible.",
      },
      {
        icon: "📍",
        title: "Availability Status",
        body: "Keep your status updated at all times. If a requester calls, be honest about your current ability to travel to the hospital. False availability reports harm patients in critical condition.",
      },
      {
        icon: "🔁",
        title: "Donation Frequency",
        body: "Whole blood can be donated once every 56 days (8 weeks). Platelets every 7 days, up to 24 times/year. Please respect these limits for your own health.",
      },
    ],
  },
  {
    id: "02",
    title: "For Requesters",
    color: "bg-[#3D2B2B]",
    conditions: [
      {
        icon: "📋",
        title: "Detailed Information",
        body: "When posting, include the patient's full name, hospital address in Dhaka, required blood group, units needed, and a direct contact number. Incomplete requests will be removed.",
      },
      {
        icon: "🤝",
        title: "The Donation Process",
        body: "Once a donor contacts you, facilitate their arrival at the hospital. LifeLink is purely a bridge — all logistics happen between you and the donor. Do not share donor info beyond the hospital staff.",
      },
      {
        icon: "✅",
        title: "Post-Donation Update",
        body: "After a successful donation, please close your request immediately. Leaving fulfilled requests open wastes donors' time and clutters the board for other patients.",
      },
    ],
  },
];

const securityItems = [
  {
    label: "Privacy",
    icon: "🔒",
    body: "Your contact number is only visible to registered members to prevent spam and ensure genuine help from verified users.",
  },
  {
    label: "Zero Commerciality",
    icon: "🚫",
    body: "LifeLink is a non-profit initiative. Selling blood or charging for connections is strictly prohibited and results in a permanent ban.",
  },
  {
    label: "Reporting",
    icon: "🚨",
    body: "If a user provides false information or behaves inappropriately, report their profile immediately to our security team via the flag icon.",
  },
  {
    label: "Data Protection",
    icon: "🛡️",
    body: "We never sell or share personal data with third parties. All donor information is encrypted and stored securely on local servers in Bangladesh.",
  },
];

const faqs = [
  {
    q: "Can I donate if I have a minor cold?",
    a: "No. You should be in full health at the time of donation. Reschedule once you have recovered completely — usually 7–10 days after symptoms resolve.",
  },
  {
    q: "Is there any payment involved?",
    a: "Absolutely not. LifeLink strictly prohibits any form of payment. Blood donation is voluntary and must remain so. Violators are permanently banned.",
  },
  {
    q: "What if a donor doesn't show up?",
    a: "Contact the LifeLink support team immediately. We maintain a backup donor list for critical cases and can escalate within 30 minutes.",
  },
  {
    q: "How do I verify a requester is genuine?",
    a: "All requesters must provide a hospital referral number visible on their post. You can also call the hospital directly to verify the patient before travelling.",
  },
];

export default function LearnMore() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div
      className="min-h-screen bg-[#F9F7F2] text-[#3D2B2B]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Hero */}
      <div className="relative overflow-hidden pt-24 pb-20 text-center px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full bg-[#AF4444]/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#3D2B2B]/4 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-block text-[10px] uppercase tracking-[0.35em] text-[#8E4444] font-bold mb-5 bg-[#8E4444]/10 px-4 py-2 rounded-full">
            The LifeLink Protocol
          </span>
          <h1 className="text-5xl md:text-6xl font-serif mb-6 leading-tight">
            Terms, Conditions
            <br />
            <span className="text-[#8E4444]">&amp; Safety</span>
          </h1>
          <p className="text-sm opacity-60 leading-relaxed max-w-xl mx-auto">
            LifeLink is a bridge between those who need and those who give. To
            ensure a safe experience for our community in Dhaka, please read and
            follow these guidelines carefully.
          </p>
          {/* Stats row */}
          <div className="mt-10 flex flex-wrap justify-center gap-8">
            {[
              { val: "2,400+", label: "Donors Registered" },
              { val: "1,100+", label: "Lives Saved" },
              { val: "18", label: "Partner Hospitals" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-serif text-[#8E4444]">{s.val}</div>
                <div className="text-[10px] uppercase tracking-widest opacity-50 mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 pb-24 space-y-20">
        {/* Donor / Requester Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {rules.map((section) => (
            <div key={section.id}>
              <h2 className="text-2xl font-serif mb-8 flex items-center gap-3">
                <span
                  className={`w-9 h-9 rounded-full ${section.color} text-white flex items-center justify-center text-xs font-bold`}
                >
                  {section.id}
                </span>
                {section.title}
              </h2>
              <div className="space-y-4">
                {section.conditions.map((c) => (
                  <div
                    key={c.title}
                    className="group bg-white border border-[#E8E2D9] rounded-2xl p-6 hover:border-[#AF4444] hover:shadow-md transition-all duration-300 cursor-default"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-0.5">{c.icon}</span>
                      <div>
                        <h3 className="font-bold mb-1 text-sm">{c.title}</h3>
                        <p className="text-xs opacity-65 leading-relaxed">
                          {c.body}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Security Panel */}
        <div className="bg-[#3D2B2B] text-white rounded-3xl p-10 md:p-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-24 -mt-24 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/3 rounded-full -ml-16 -mb-16 pointer-events-none" />
          <div className="relative z-10">
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#AF4444] font-bold">
              Platform Security
            </span>
            <h2 className="text-3xl font-serif mt-2 mb-10">
              Built on Trust &amp; Safety
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {securityItems.map((item) => (
                <div
                  key={item.label}
                  className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <h4 className="font-bold text-[10px] uppercase tracking-widest text-[#AF4444] mb-2">
                    {item.label}
                  </h4>
                  <p className="text-[11px] opacity-60 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <div className="text-center mb-10">
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#8E4444] font-bold">
              Common Questions
            </span>
            <h2 className="text-3xl font-serif mt-2">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-[#E8E2D9] rounded-2xl overflow-hidden"
              >
                <button
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-[#F9F7F2] transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-sm">{faq.q}</span>
                  <span
                    className={`text-[#8E4444] text-lg font-bold transition-transform duration-200 ${
                      openFaq === i ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-xs opacity-65 leading-relaxed border-t border-[#E8E2D9] pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Blood Type Eligibility Quick Reference */}
        <div className="bg-white border border-[#E8E2D9] rounded-3xl p-10">
          <div className="text-center mb-8">
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#8E4444] font-bold">
              Quick Reference
            </span>
            <h2 className="text-3xl font-serif mt-2">Blood Type Compatibility</h2>
            <p className="text-xs opacity-55 mt-2 max-w-md mx-auto">
              Universal donors (O-) and universal recipients (AB+) play special
              roles. Know your type.
            </p>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {[
              { type: "A+", canGiveTo: "A+, AB+", color: "bg-red-50 border-red-200 text-red-800" },
              { type: "A-", canGiveTo: "A+, A-, AB+, AB-", color: "bg-red-50 border-red-200 text-red-800" },
              { type: "B+", canGiveTo: "B+, AB+", color: "bg-orange-50 border-orange-200 text-orange-800" },
              { type: "B-", canGiveTo: "B+, B-, AB+, AB-", color: "bg-orange-50 border-orange-200 text-orange-800" },
              { type: "O+", canGiveTo: "A+, B+, O+, AB+", color: "bg-amber-50 border-amber-200 text-amber-800" },
              { type: "O-", canGiveTo: "Everyone ✨", color: "bg-[#AF4444]/10 border-[#AF4444]/30 text-[#8E4444]" },
              { type: "AB+", canGiveTo: "AB+ only", color: "bg-purple-50 border-purple-200 text-purple-800" },
              { type: "AB-", canGiveTo: "AB+, AB-", color: "bg-purple-50 border-purple-200 text-purple-800" },
            ].map((b) => (
              <div
                key={b.type}
                className={`border rounded-xl p-3 text-center ${b.color}`}
              >
                <div className="text-xl font-serif font-bold">{b.type}</div>
                <div className="text-[9px] mt-1 leading-tight opacity-75">
                  {b.canGiveTo}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-xs opacity-50 mb-6 max-w-sm mx-auto">
            By using LifeLink, you agree to uphold these guidelines and act with
            compassion and honesty at all times.
          </p>
          <a
            href="index.html"
            className="inline-block py-4 px-12 bg-[#8E4444] text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:scale-105 hover:bg-[#AF4444] transition-all shadow-lg"
          >
            I Understand — Let&apos;s Save Lives
          </a>
        </div>
      </main>
    </div>
  );
}