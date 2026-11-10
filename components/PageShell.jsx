import Link from 'next/link';
import { logoutAction } from '@/app/actions';

export default function PageShell({ title, backHref, actions, children }) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          {backHref && (
            <Link href={backHref} className="text-xs text-zinc-400 hover:text-zinc-200">
              ← Kembali
            </Link>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              Keluar
            </button>
          </form>
        </div>
      </header>
      {children}
    </main>
  );
}