import type { Metadata } from "next";
import "./globals.css";
import Image from "next/image";

export const metadata: Metadata = {
  title: "PSAP Artifact Library",
  description: "911 Authority — PSAP compliance artifact library",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        {/* Topbar */}
        <header
          style={{ background: 'var(--ui-shell)', height: 52, boxShadow: '0 2px 8px rgba(0,0,0,.25)' }}
          className="sticky top-0 z-50 flex items-center gap-3 px-4 shrink-0"
        >
          <div
            className="flex items-center shrink-0 h-full pr-3 mr-1"
            style={{ borderRight: '1px solid rgba(255,255,255,.12)' }}
          >
            <span className="flex items-center justify-center bg-white rounded-md px-2 py-1 shadow-sm">
              <Image
                src="/logo-911authority.png"
                alt="911 Authority"
                height={28}
                width={104}
                className="block"
                style={{ height: 28, width: 'auto', maxWidth: 104 }}
              />
            </span>
          </div>
          <span
            className="font-semibold text-white text-base whitespace-nowrap"
            style={{ fontSize: 16 }}
          >
            PSAP Artifact Library
          </span>
        </header>

        {/* Page content */}
        <div className="flex-1">
          {children}
        </div>

        {/* Footer */}
        <footer
          className="text-center text-xs py-10 px-4"
          style={{ color: '#4B5563', borderTop: '1px solid var(--ui-border)' }}
        >
          <p>Developed by 911 Authority, LLC in partnership with the Indiana Statewide 911 Board.</p>
          <p className="mt-1">© 2026 911 Authority, LLC. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
