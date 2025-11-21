import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mercado Libre - Test Práctico',
  description: 'Búsqueda de productos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased bg-[#ededed]" suppressHydrationWarning>
        <main>{children}</main>
      </body>
    </html>
  );
}
