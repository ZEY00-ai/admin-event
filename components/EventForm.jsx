'use client';

import { useActionState } from 'react';
import { LIMITS } from '@/lib/validation';
import SubmitButton from './SubmitButton';

const inputClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 ' +
  'placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 ' +
  'focus:ring-indigo-500/40 read-only:opacity-60 aria-[invalid=true]:border-red-500';

function Field({ label, htmlFor, hint, error, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-zinc-200">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

/**
 * action : server action (create, atau update yang sudah di-bind id)
 * initial: nilai awal form ({id,name,date,quota,open}); date format "YYYY-MM-DDTHH:mm"
 * isNew  : true = ID bisa diisi; false = ID terkunci
 */
export default function EventForm({ action, initial, isNew }) {
  const [state, formAction] = useActionState(action, {
    success: null,
    message: '',
    errors: {},
    values: initial,
  });
  const { values = initial, errors = {} } = state;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <Field
        label="ID event (slug)"
        htmlFor="id"
        hint={isNew ? 'Tidak bisa diubah setelah dibuat. Contoh: workshop-nextjs' : 'ID tidak dapat diubah.'}
        error={errors.id}
      >
        <input
          id="id"
          name="id"
          type="text"
          required={isNew}
          readOnly={!isNew}
          maxLength={LIMITS.id.max}
          autoCapitalize="none"
          defaultValue={values.id ?? ''}
          aria-invalid={errors.id ? 'true' : undefined}
          className={inputClass}
        />
      </Field>

      <Field label="Nama event" htmlFor="name" error={errors.name}>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={LIMITS.name.max}
          defaultValue={values.name ?? ''}
          aria-invalid={errors.name ? 'true' : undefined}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Tanggal & jam (WIB)" htmlFor="date" error={errors.date}>
          <input
            id="date"
            name="date"
            type="datetime-local"
            required
            defaultValue={values.date ?? ''}
            aria-invalid={errors.date ? 'true' : undefined}
            className={inputClass}
          />
        </Field>
        <Field label="Kuota" htmlFor="quota" error={errors.quota}>
          <input
            id="quota"
            name="quota"
            type="number"
            required
            min={LIMITS.quota.min}
            max={LIMITS.quota.max}
            defaultValue={values.quota ?? ''}
            aria-invalid={errors.quota ? 'true' : undefined}
            className={inputClass}
          />
        </Field>
      </div>

      <label className="flex items-center gap-3 text-sm text-zinc-200">
        <input
          name="open"
          type="checkbox"
          defaultChecked={values.open ?? true}
          className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 accent-indigo-500"
        />
        Pendaftaran dibuka
      </label>

      <SubmitButton idle={isNew ? 'Buat Event' : 'Simpan Perubahan'} busy="Menyimpan..." />

      {state.message && (
        <p
          role={state.success ? 'status' : 'alert'}
          className={
            'rounded-lg border px-4 py-3 text-sm ' +
            (state.success
              ? 'border-emerald-700 bg-emerald-950/60 text-emerald-300'
              : 'border-red-800 bg-red-950/60 text-red-300')
          }
        >
          {state.message}
        </p>
      )}
    </form>
  );
}