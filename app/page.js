import Link from 'next/link';
import { toggleOpenAction } from '@/app/actions';
import PageShell from '@/components/PageShell';
import { requireAdmin } from '@/lib/auth';
import { formatEventDate } from '@/lib/format';
import { getEvents, getRegistrantCounts } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await requireAdmin();
  const events = await getEvents();
  const counts = await getRegistrantCounts(events);

  return (
    <PageShell
      title="Daftar Event"
      actions={
        <Link
          href="/events/new"
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          + Event baru
        </Link>
      }
    >
      {events.length === 0 ? (
        <p className="rounded-xl border border-zinc-800 p-6 text-sm text-zinc-400">
          Belum ada event. Buat event pertama dengan tombol di kanan atas.
        </p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{event.name}</p>
                <p className="text-xs text-zinc-400">{formatEventDate(event.date)}</p>
                <p className="mt-1 text-xs text-zinc-300">
                  {counts[event.id] ?? 0}/{event.quota} terdaftar ·{' '}
                  <span className={event.open ? 'text-emerald-400' : 'text-zinc-500'}>
                    {event.open ? 'Dibuka' : 'Ditutup'}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <form action={toggleOpenAction.bind(null, event.id)}>
                  <button
                    type="submit"
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
                  >
                    {event.open ? 'Tutup' : 'Buka'}
                  </button>
                </form>
                <Link
                  href={`/events/${event.id}`}
                  className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
                >
                  Kelola
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}