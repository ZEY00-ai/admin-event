import './globals.css';

export const metadata = {
  title: 'Admin Event',
  robots: { index: false, follow: false }, // jangan diindeks mesin pencari
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}