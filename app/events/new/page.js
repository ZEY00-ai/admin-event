import { createEventAction } from '@/app/actions';
import EventForm from '@/components/EventForm';
import PageShell from '@/components/PageShell';
import { requireAdmin } from '@/lib/auth';

export default async function NewEventPage() {
  await requireAdmin();

  return (
    <PageShell title="Event Baru" backHref="/">
      <div className="max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
        <EventForm
          isNew
          action={createEventAction}
          initial={{ id: '', name: '', date: '', quota: '', open: true }}
        />
      </div>
    </PageShell>
  );
}