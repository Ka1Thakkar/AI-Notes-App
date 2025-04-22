// app/notes/create/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

type FormData = { title: string; content: string };

export default function CreateNotePage() {
  const supabase = createClient();
  const router = useRouter();
  const qc = useQueryClient();
  const { register, handleSubmit } = useForm<FormData>();

  const createNote = useMutation({
    mutationFn: async ({ title, content }: FormData) => {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) throw userErr || new Error('Not authenticated');

      const { error } = await supabase
        .from('notes')
        .insert([{ title, content, user_id: user.id }]);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] });
      router.push('/');
    },
  });

  return (
    <form onSubmit={handleSubmit((d) => createNote.mutate(d))}>
      <Input {...register('title')} placeholder="Title" required />
      <Textarea {...register('content')} placeholder="Content" required />
      <Button type="submit">Save Note</Button>
    </form>
  );
}