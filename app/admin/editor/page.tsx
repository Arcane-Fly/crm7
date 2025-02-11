import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth/context';
import { Editor } from '@/components/admin/Editor';
import { AdminManager } from '@/components/admin/AdminManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@supabase/supabase-js';

export default async function AdminEditorPage() {
  const user = await getUser();
  const isSuperAdmin = user?.email === 'braden.lang77@gmail.com';

  if (!user) {
    redirect('/');
  }

  // Check if user is an admin
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: adminData } = await supabase
    .from('admins')
    .select('role')
    .eq('email', user.email)
    .single();

  if (!adminData) {
    redirect('/');
  }

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="editor">
        <TabsList>
          <TabsTrigger value="editor">Page Editor</TabsTrigger>
          {isSuperAdmin && <TabsTrigger value="admins">Manage Admins</TabsTrigger>}
        </TabsList>
        <TabsContent value="editor" className="mt-6">
          <Editor />
        </TabsContent>
        {isSuperAdmin && (
          <TabsContent value="admins" className="mt-6">
            <AdminManager />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
