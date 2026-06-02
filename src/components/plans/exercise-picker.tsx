'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createCustomExerciseAction } from '@/app/(app)/plans/actions';
import { cn } from '@/lib/utils/cn';
import type { Exercise, MuscleGroup } from '@/types';

const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest',
  'back',
  'legs',
  'shoulders',
  'arms',
  'core',
  'cardio',
];
const GROUPS: (MuscleGroup | 'all')[] = ['all', ...MUSCLE_GROUPS];

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
  const [list, setList] = useState<Exercise[]>(exercises);

  // Custom-exercise form state
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [mGroup, setMGroup] = useState<MuscleGroup>('chest');
  const [equipment, setEquipment] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = list.filter(
    (e) =>
      (group === 'all' || e.muscle_group === group) &&
      e.name.toLowerCase().includes(q.toLowerCase()),
  );

  function pick(ex: Exercise) {
    onSelect(ex);
    setOpen(false);
    setQ('');
  }

  async function createCustom() {
    if (!name.trim()) {
      toast.error('Enter an exercise name');
      return;
    }
    setSaving(true);
    const res = await createCustomExerciseAction({
      name,
      muscleGroup: mGroup,
      equipment,
      instructions: '',
    });
    setSaving(false);
    if (!res.ok || !res.data) {
      toast.error(res.ok ? 'Could not create exercise' : res.error);
      return;
    }
    const created: Exercise = {
      id: res.data.id,
      name: res.data.name,
      muscle_group: res.data.muscle_group,
      equipment: res.data.equipment,
      instructions: null,
      is_global: false,
      trainer_id: null,
      created_at: new Date().toISOString(),
    };
    setList((prev) => [created, ...prev]);
    setName('');
    setEquipment('');
    setCreating(false);
    toast.success('Custom exercise added');
    pick(created);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{creating ? 'Create custom exercise' : 'Add exercise'}</DialogTitle>
        </DialogHeader>

        {creating ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ex-name">Name</Label>
              <Input
                id="ex-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bulgarian Split Squat"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Muscle group</Label>
                <Select value={mGroup} onValueChange={(v) => setMGroup(v as MuscleGroup)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MUSCLE_GROUPS.map((g) => (
                      <SelectItem key={g} value={g} className="capitalize">
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ex-equip">Equipment</Label>
                <Input
                  id="ex-equip"
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  placeholder="e.g. Dumbbells"
                />
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setCreating(false)} disabled={saving}>
                Back
              </Button>
              <Button onClick={createCustom} disabled={saving || !name.trim()}>
                {saving ? 'Adding…' : 'Add & select'}
              </Button>
            </div>
          </div>
        ) : (
          <>
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
            <ScrollArea className="h-64 pr-3">
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
                      onClick={() => pick(e)}
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
            <Button variant="outline" className="w-full" onClick={() => setCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create custom exercise
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
