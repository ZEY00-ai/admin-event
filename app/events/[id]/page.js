import { notFound } from 'next/navigation';
import { archiveEventAction, deleteEventAction, updateEventAction } from '@/app/actions';
import ArchiveButton from '@/components/ArchiveButton';
import EventForm from '@/components/EventForm';
import PageShell from '@/components/PageShell';
import { requireAdmin } from '@/lib/auth';
import { formatRegistrationNumber, toInputValue } from '@/lib/format';
import { getEvent, listRegistrants } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export default async function EditEventPage({ params }) {
  await requireAdmin();
  const { id } = await params;

  const event = await getEvent(id);
  if (!event) notFound();
  const registrants = await listRegistrants(id);

  return (
    <PageShell title={event.name} backHref="/">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,26rem)_1fr]">
        <section>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
            <EventForm
              action={updateEventAction.bind(null, id)}
              initial={{
                id: event.id,
                name: event.name,
                date: toInputValue(event.date),
                quota: event.quota,
                open: event.open,
              }}
            />
          </div>

          {registrants.length === 0 ? (
            <form action={deleteEventAction.bind(null, id)} className="mt-4">
              <button
                type="submit"
                className="w-full rounded-lg border border-red-900 px-4 py-2.5 text-sm text-red-400 hover:bg-red-950/50"
              >
                Hapus event (belum ada pendaftar)
              </button>
            </form>
          ) : (
            <ArchiveButton action={archiveEventAction.bind(null, id)} />
          )}
        </section>

        <section className="min-w-0">
          <h2 className="mb-3 text-lg font-semibold text-white">
            Pendaftar ({registrants.length}/{event.quota})
          </h2>
          {registrants.length === 0 ? (
            <p className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-400">Belum ada pendaftar.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead className="bg-zinc-900 text-xs uppercase text-zinc-400">
                  <tr>
                    <th className="px-3 py-2">No</th>
                    <th className="px-3 py-2">Nama</th>
                    <th className="px-3 py-2">Discord</th>
                    <th className="px-3 py-2">WhatsApp</th>
                    <th className="px-3 py-2">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {registrants.map((row) => (
                    <tr key={row.number} className="align-top">
                      <td className="px-3 py-2 font-mono text-zinc-300">{formatRegistrationNumber(row.number)}</td>
                      <td className="px-3 py-2 text-zinc-100">{row.name}</td>
                      <td className="px-3 py-2 font-mono text-zinc-300">{row.discord}</td>
                      <td className="px-3 py-2 text-zinc-300">{row.whatsapp || '—'}</td>
                      <td className="max-w-[14rem] whitespace-pre-wrap break-words px-3 py-2 text-zinc-400">
                        {row.note || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}