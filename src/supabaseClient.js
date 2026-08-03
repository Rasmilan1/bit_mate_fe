import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://bkwiclkrrynsmlgqkpij.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrd2ljbGtycnluc21sZ3FrcGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMzE3ODcsImV4cCI6MjEwMDkwNzc4N30.7gj59gZ752_5qbxcwc7eaeRkMXPW3QEBg9xmAXcq_Yo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function uploadPdfDirectToSupabase(file) {
  if (!file) return null;
  const fileExt = file.name.split('.').pop() || 'pdf';
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('study-pdfs')
    .upload(fileName, file, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (error) {
    console.warn('Direct Supabase upload notice:', error.message);
    throw new Error('Supabase Storage Upload: ' + error.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from('study-pdfs')
    .getPublicUrl(fileName);

  return {
    file_url: publicUrlData.publicUrl,
    file_path: fileName,
    file_size: file.size
  };
}
