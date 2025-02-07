import { SchemaEditor } from '@/components/schema/SchemaEditor';
import { Button } from '@/components/ui/button';
import { createClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function SchemaPage() {
  const cookieStore = cookies();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/auth/signin');
  }

  // Check if user is admin or authorized dev
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, can_manage_schema')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'admin' && !(profile.role === 'dev' && profile.can_manage_schema))) {
    return redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Database Schema Editor</h1>
              <p className="mt-1 text-sm text-gray-500">
                Design and manage your database structure visually
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/dashboard'}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Quick Guide</h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Follow these steps to create and manage your database schema
            </p>
            <ul className="mt-4 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 sm:grid-cols-2">
              <li className="flex gap-x-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[0.625rem] font-medium text-blue-700">1</div>
                Click the <strong className="mx-1">+ Add Table</strong> button to create a new table
              </li>
              <li className="flex gap-x-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[0.625rem] font-medium text-blue-700">2</div>
                Define fields with appropriate data types and constraints
              </li>
              <li className="flex gap-x-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[0.625rem] font-medium text-blue-700">3</div>
                Add indices for better query performance
              </li>
              <li className="flex gap-x-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[0.625rem] font-medium text-blue-700">4</div>
                Create relationships between tables using foreign keys
              </li>
            </ul>
          </div>

          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
            <SchemaEditor />
          </div>
        </div>
      </main>
    </div>
  );
}
