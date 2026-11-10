'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

function ArchiveSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        const ok = window.confirm(
          'Arsipkan semua pendaftar ke spreadsheet lalu HAPUS event ini dari Redis?\nTindakan ini tidak bisa dibatalkan.',
        );
        if (!ok) event.preventDefault();
      }}
      className="w-full rounded-lg border border-amber-800 px-4 py-2.5 text-sm text-amber-400
                 hover:bg-amber-950/50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Mengarsipkan...' : 'Arsipkan ke spreadsheet & hapus'}
    </button>
  );
}

export default function ArchiveButton({ action }) {
  const [state, formAction] = useActionState(action, { message: '' });

  return (
    <form action={formAction} className="mt-4 space-y-2">
      <ArchiveSubmit />
      {state?.message && (
        <p role="alert" className="rounded-lg border border-red-800 bg-red-950/60 px-4 py-3 text-sm text-red-300">
          {state.message}
        </p>
      )}
    </form>
  );
}