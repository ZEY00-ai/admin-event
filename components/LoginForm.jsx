'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/actions';
import SubmitButton from './SubmitButton';

export default function LoginForm() {
  const [state, formAction] = useActionState(loginAction, { message: '' });

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-zinc-200">
          Password admin
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100
                     focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        />
      </div>
      <SubmitButton idle="Masuk" busy="Memproses..." />
      {state.message && (
        <p role="alert" className="rounded-lg border border-red-800 bg-red-950/60 px-4 py-3 text-sm text-red-300">
          {state.message}
        </p>
      )}
    </form>
  );
}