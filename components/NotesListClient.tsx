// components/NotesListClient.tsx
'use client';

import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

export default function NotesListClient({ userId }: { userId: string }) {
  const supabase = createClient();
  const qc = useQueryClient();

  // FETCH
  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // DELETE
  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes', userId] })
  });

  return (
    <div>
      {isLoading ? (
        <p>Loading…</p>
      ) : (
        <ul>
          {notes?.map((note) => (
            <li key={note.id}>
              <Link href={`/notes/${note.id}`}>{note.title}</Link>
              <Button onClick={() => deleteNote.mutate(note.id)}>Delete</Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}