import logo from '../../assets/logo.svg';

const CAPABILITIES = [
  {
    title: 'Variance detection',
    copy: 'Every contract is checked against KEMSA benchmark pricing in real time.',
  },
  {
    title: 'Risk-ranked alerts',
    copy: 'High-risk anomalies surface first, so review time goes where it matters.',
  },
  {
    title: 'Full audit trail',
    copy: 'Every flag links back to the exact record, vendor, and variance behind it.',
  },
];

const NAV_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Contracts', href: '/dashboard' },
  { label: 'Alerts', href: '/dashboard' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F3EC] text-[#0B1F3A] font-[Inter,sans-serif]">
      <style>{`
        .font-display { font-family: 'Fraunces', serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .ledger-texture {
          background-image: repeating-linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.035) 0px,
            rgba(255, 255, 255, 0.035) 1px,
            transparent 1px,
            transparent 48px
          );
        }
      `}</style>

      {/* Top nav */}
      <header className="sticky top-0 z-20 bg-[#0B1F3A]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="bg-white rounded-full p-1.5 flex items-center justify-center shrink-0">
              <img src={logo} alt="APHPA" className="w-6 h-6" />
            </div>
            <span className="font-mono text-[11px] sm:text-[12px] lg:text-[13px] tracking-wide text-white uppercase truncate">
              <span className="lg:hidden">Procurement Auditor</span>
              <span className="hidden lg:inline">
                Automated Public Health Procurement Auditor
              </span>
            </span>
          </div>
          <nav className="hidden lg:flex items-center gap-8 shrink-0">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-[#A8B3C4] hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a
            href="/login"
            className="shrink-0 px-4 py-2 bg-white text-[#0B1F3A] rounded-md text-sm font-medium hover:bg-[#F7F3EC] transition-colors"
          >
            Login
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-[#0B1F3A] ledger-texture overflow-hidden max-w-full">
        {/* Watermark shield */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg
            className="absolute -right-16 -top-10 opacity-[0.06]"
            width="420"
            height="420"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="0.5"
          >
            <path d="M12 2 L21 6 V12 C21 17 17 20.5 12 22 C7 20.5 3 17 3 12 V6 Z" />
            <path d="M8.5 12 L11 14.5 L16 9" strokeWidth="0.7" />
          </svg>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-20 md:pb-28">
          <div className="inline-block max-w-full whitespace-normal font-mono text-xs tracking-widest uppercase text-[#8FD4B0] bg-[#2F6F52]/25 border border-[#2F6F52]/40 px-3 py-1 rounded-full mb-7">
            Public Health Procurement Oversight
          </div>
          <h1 className="font-display text-[2.25rem] sm:text-[2.75rem] md:text-[4rem] leading-[1.08] font-medium text-white mb-6 max-w-3xl break-words">
            Every entry in the ledger,
            <br />
            <span className="italic text-[#8FD4B0]">read like an auditor.</span>
          </h1>
          <p className="text-base sm:text-lg text-[#A8B3C4] max-w-lg mb-10 leading-relaxed">
            Cross-checks every procurement record against KEMSA benchmark
            pricing the moment it lands — surfacing variance and contract
            risk before they become findings.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="/login"
              className="px-7 py-3.5 bg-white text-[#0B1F3A] rounded-md font-medium hover:bg-[#F7F3EC] transition-colors"
            >
              Login
            </a>
            <a
              href="/dashboard"
              className="px-7 py-3.5 border border-white/25 text-white rounded-md font-medium hover:border-white/60 transition-colors"
            >
              View Dashboard
            </a>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-t border-[#0B1F3A]/8 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-16">
          <div className="grid sm:grid-cols-3 gap-8">
            {CAPABILITIES.map((card) => (
              <div key={card.title}>
                <h3 className="font-display text-lg font-medium mb-2">
                  {card.title}
                </h3>
                <p className="text-[#5B6B7C] leading-relaxed text-[15px]">
                  {card.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 md:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="APHPA" className="w-6 h-6" />
          <span className="font-mono text-xs tracking-wide text-[#5B6B7C] uppercase">
            Automated Public Health Procurement Auditor
          </span>
        </div>
        <span className="text-sm text-[#5B6B7C]">
          Public Health Procurement Oversight
        </span>
      </footer>
    </div>
  );
}
