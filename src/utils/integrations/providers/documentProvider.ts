import { supabase } from '../../../lib/supabase';
import { uploadToBlob, deleteFromBlob } from '@vercel/blob';
import type { Document, DocumentMetadata } from '../../../types/document';

export async function uploadDocument(
  file: File,
  metadata: DocumentMetadata
): Promise<string> {
  try {
    // Upload to Vercel Blob
    const { url } = await uploadToBlob(file, {
      access: 'private',
      addRandomSuffix: true,
      metadata: {
        organizationId: metadata.organizationId,
        documentType: metadata.type,
        uploadedBy: metadata.uploadedBy
      }
    });

    // Create document record
    const { data, error } = await supabase
      .from('documents')
      .insert({
        name: file.name,
        type: metadata.type,
        url,
        size: file.size,
        mime_type: file.type,
        metadata,
        uploaded_by: metadata.uploadedBy,
        organization_id: metadata.organizationId
      })
      .select()
      .single();

    if (error) throw error;

    return data.id;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

export async function getDocumentMetadata(documentId: string): Promise<DocumentMetadata> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (error) throw error;
  return data.metadata;
}

export async function searchDocuments(query: {
  type?: string;
  name?: string;
  uploadedBy?: string;
  dateRange?: { start: string; end: string };
}): Promise<Document[]> {
  let dbQuery = supabase
    .from('documents')
    .select('*')
    .is('deleted_at', null);

  if (query.type) {
    dbQuery = dbQuery.eq('type', query.type);
  }

  if (query.name) {
    dbQuery = dbQuery.ilike('name', `%${query.name}%`);
  }

  if (query.uploadedBy) {
    dbQuery = dbQuery.eq('uploaded_by', query.uploadedBy);
  }

  if (query.dateRange) {
    dbQuery = dbQuery
      .gte('created_at', query.dateRange.start)
      .lte('created_at', query.dateRange.end);
  }

  const { data, error } = await dbQuery.order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function deleteDocument(documentId: string): Promise<void> {
  try {
    // Get document details
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('url')
      .eq('id', documentId)
      .single();

    if (fetchError) throw fetchError;

    // Delete from Vercel Blob
    await deleteFromBlob(document.url);

    // Soft delete in database
    const { error: deleteError } = await supabase
      .from('documents')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', documentId);

    if (deleteError) throw deleteError;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}
