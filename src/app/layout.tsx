import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ComplianceBeacon — 2026 Payroll Compliance Engine',
  description: 'Federal & state payroll compliance for OBBBA TP/TT reporting and $680 penalty risk detection.',
  openGraph: {
    title: 'ComplianceBeacon — 2026 OBBBA Payroll Compliance',
    description: 'Validate W-2 Box 12 Code TP (Tips) and TT (OT Premium). Detect $680 penalty risks across CA, NY, WA.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ComplianceBeacon — 2026 Payroll Compliance',
    description: 'Automated TP/TT validation + $680 penalty detection for CPAs & payroll providers.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-white min-h-screen font-sans">
        <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-sm">CB</div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">ComplianceBeacon</span>
                <span className="hidden sm:inline text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">2026 OBBBA</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <a href="/" className="text-gray-400 hover:text-white transition">Home</a>
                <a href="/engine" className="text-gray-400 hover:text-white transition">Engine</a>
                <a href="/rules" className="text-gray-400 hover:text-white transition">Rules</a>
                <a href="/reports" className="text-gray-400 hover:text-white transition">Tests</a>
                <a href="/pricing" className="text-gray-400 hover:text-white transition">Pricing</a>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="border-t border-gray-800 py-8 mt-20">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">&copy; 2026 ComplianceBeacon. Payroll compliance intelligence for CPAs &amp; payroll providers.</div>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
