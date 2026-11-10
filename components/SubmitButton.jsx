'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitButton({ idle, busy }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition
                 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? busy : idle}
    </button>
  );
}