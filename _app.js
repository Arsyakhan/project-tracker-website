import '../styles/globals.css';
import Link from 'next/link';

export default function App({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-panel">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display font-semibold text-lg text-ink">
            Bening Khatulistiwa <span className="text-blueprint">/ Project Tracker</span>
          </Link>
          <nav className="flex gap-5 text-sm">
            <Link href="/" className="text-inkmute hover:text-ink">Dashboard</Link>
            <Link href="/projects" className="text-inkmute hover:text-ink">Semua Project</Link>
            <Link href="/projects/new" className="text-blueprint font-medium hover:underline">+ Project Baru</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Component {...pageProps} />
      </main>
    </div>
  );
}
