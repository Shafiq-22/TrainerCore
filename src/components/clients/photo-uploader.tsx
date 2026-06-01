'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ImagePlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/browser';
import {
  addProgressPhotoAction,
  deleteProgressPhotoAction,
} from '@/app/(app)/clients/[id]/progress/actions';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils/dates';

export interface PhotoItem {
  id: string;
  url: string;
  storagePath: string;
  takenOn: string;
  caption: string | null;
}

export function PhotoUploader({
  trainerId,
  clientId,
  photos,
}: {
  trainerId: string;
  clientId: string;
  photos: PhotoItem[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const supabase = createClient();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${trainerId}/${clientId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('progress-photos').upload(path, file);
      if (error) throw error;
      const res = await addProgressPhotoAction({
        clientId,
        storagePath: path,
        takenOn: format(new Date(), 'yyyy-MM-dd'),
      });
      if (!res.ok) throw new Error(res.error);
      toast.success('Photo uploaded');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function remove(p: PhotoItem) {
    const res = await deleteProgressPhotoAction(p.id, p.storagePath, clientId);
    if (res.ok) {
      toast.success('Photo deleted');
      router.refresh();
    } else toast.error(res.error);
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground transition-colors hover:bg-muted/50"
      >
        <ImagePlus className="h-6 w-6" />
        <span className="text-xs font-medium">{uploading ? 'Uploading…' : 'Add photo'}</span>
      </button>

      {photos.map((p) => (
        <div key={p.id} className="group relative overflow-hidden rounded-lg border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.url}
            alt={p.caption ?? 'Progress photo'}
            className="aspect-[3/4] w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
            <p className="text-xs font-medium text-white">{formatDate(p.takenOn)}</p>
          </div>
          <button
            type="button"
            onClick={() => remove(p)}
            className="absolute right-1.5 top-1.5 rounded-md bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Delete photo"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
