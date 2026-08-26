import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PSAP Artifact Library',
  description: '911 Authority — PSAP compliance artifact library',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        {/* No application shell header — the page renders its own
            "PSAP Artifact Library" heading. */}

        {/* Page content */}
        <div className="flex-1">{children}</div>

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
