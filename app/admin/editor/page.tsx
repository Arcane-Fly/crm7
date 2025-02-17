"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth/context";
import { Editor } from "@/components/admin/Editor";
import { AdminManager } from "@/components/admin/AdminManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminEditorPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="editor" className="w-full">
        <TabsList>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>
        <TabsContent value="editor">
          <Editor />
        </TabsContent>
        <TabsContent value="admin">
          <AdminManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
