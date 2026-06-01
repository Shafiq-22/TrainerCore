'use client';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import { usePlanBuilderStore, type DraftDay, type DraftExercise } from '@/stores/plan-builder-store';
import { ExercisePicker } from './exercise-picker';
import { WEEKDAY_LABELS } from '@/lib/utils/dates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { Exercise } from '@/types';

function ExerciseRow({
  week,
  day,
  ex,
}: {
  week: number;
  day: number;
  ex: DraftExercise;
}) {
  const updateExercise = usePlanBuilderStore((s) => s.updateExercise);
  const removeExercise = usePlanBuilderStore((s) => s.removeExercise);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ex.tempId,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }}
      className="rounded-md border bg-background p-2"
    >
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="flex-1 truncate text-sm font-medium">{ex.name}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => removeExercise(week, day, ex.tempId)}
          aria-label="Remove exercise"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        <Input
          value={ex.sets}
          onChange={(e) => updateExercise(week, day, ex.tempId, { sets: e.target.value })}
          placeholder="Sets"
          className="h-8 text-xs"
        />
        <Input
          value={ex.reps}
          onChange={(e) => updateExercise(week, day, ex.tempId, { reps: e.target.value })}
          placeholder="Reps"
          className="h-8 text-xs"
        />
        <Input
          value={ex.restSeconds}
          onChange={(e) => updateExercise(week, day, ex.tempId, { restSeconds: e.target.value })}
          placeholder="Rest s"
          className="h-8 text-xs"
        />
      </div>
      <Input
        value={ex.notes}
        onChange={(e) => updateExercise(week, day, ex.tempId, { notes: e.target.value })}
        placeholder="Notes (optional)"
        className="mt-1.5 h-8 text-xs"
      />
    </div>
  );
}

export function DayCard({
  week,
  day,
  exercises,
}: {
  week: number;
  day: DraftDay;
  exercises: Exercise[];
}) {
  const addExercise = usePlanBuilderStore((s) => s.addExercise);
  const reorderDay = usePlanBuilderStore((s) => s.reorderDay);
  const toggleRest = usePlanBuilderStore((s) => s.toggleRest);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const ids = day.exercises.map((x) => x.tempId);
      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      reorderDay(week, day.dayOfWeek, arrayMove(ids, oldIndex, newIndex));
    }
  }

  return (
    <div className="flex flex-col rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{WEEKDAY_LABELS[day.dayOfWeek - 1]}</span>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Rest
          <Switch
            checked={day.isRest}
            onCheckedChange={() => toggleRest(week, day.dayOfWeek)}
          />
        </label>
      </div>

      {day.isRest ? (
        <p className="py-6 text-center text-xs text-muted-foreground">Rest day</p>
      ) : (
        <>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext
              items={day.exercises.map((e) => e.tempId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="mt-2 space-y-2">
                {day.exercises.map((ex) => (
                  <ExerciseRow key={ex.tempId} week={week} day={day.dayOfWeek} ex={ex} />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <ExercisePicker
            exercises={exercises}
            onSelect={(e) =>
              addExercise(week, day.dayOfWeek, {
                exerciseId: e.id,
                name: e.name,
                muscleGroup: e.muscle_group,
              })
            }
            trigger={
              <Button type="button" variant="outline" size="sm" className="mt-2 w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add exercise
              </Button>
            }
          />
        </>
      )}
    </div>
  );
}
