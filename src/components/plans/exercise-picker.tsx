'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils/cn';
import type { Exercise, MuscleGroup } from '@/types';

const GROUPS: (MuscleGroup | 'all')[] = [
  'all',
  'chest',
  'back',
  'legs',
  'shoulders',
  'arms',
  'core',
  'cardio',
];

export function ExercisePicker({
  exercises,
  onSelect,
  trigger,
}: {
  exercises: Exercise[];
  onSelect: (ex: Exercise) => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [group, setGroup] = useState<MuscleGroup | 'all'>('all');

  const filtered = exercises.filter(
    (e) =>
      (group === 'all' || e.muscle_group === group) &&
      e.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add exercise</DialogTitle>
        </DialogHeader>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search exercises…"
          autoFocus
        />
        <div className="flex flex-wrap gap-1.5">
          {GROUPS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGroup(g)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs font-medium capitalize transition-colors',
                group === g
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {g}
            </button>
          ))}
        </div>
        <ScrollArea className="h-72 pr-3">
          <div className="space-y-1">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No exercises found.
              </p>
            ) : (
              filtered.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => {
                    onSelect(e);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-md p-2 text-left transition-colors hover:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{e.name}</p>
                    {e.equipment && (
                      <p className="truncate text-xs text-muted-foreground">{e.equipment}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {e.muscle_group}
                  </Badge>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
