import { redirect } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import { isAdmin } from '@/lib/auth';

export default async function LoginPage() {
  if (await isAdmin()) redirect('/');

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-2xl font-bold text-white">Admin Event</h1>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
        <LoginForm />
      </div>
    </main>
  );
}