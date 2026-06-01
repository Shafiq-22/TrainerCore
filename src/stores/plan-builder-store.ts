import { create } from 'zustand';

export interface DraftExercise {
  tempId: string;
  exerciseId: string;
  name: string;
  muscleGroup: string;
  sets: string;
  reps: string;
  restSeconds: string;
  notes: string;
}

export interface DraftDay {
  dayOfWeek: number; // 1-7
  label: string;
  isRest: boolean;
  exercises: DraftExercise[];
}

export interface DraftWeek {
  weekNumber: number;
  days: DraftDay[];
}

export interface PlanDraftInput {
  name: string;
  description: string;
  goal: string;
  weeksCount: number;
  isTemplate: boolean;
  weeks: DraftWeek[];
}

function makeDay(dayOfWeek: number): DraftDay {
  return { dayOfWeek, label: '', isRest: false, exercises: [] };
}

function makeWeek(weekNumber: number): DraftWeek {
  return { weekNumber, days: Array.from({ length: 7 }, (_, i) => makeDay(i + 1)) };
}

export function makeWeeks(count: number): DraftWeek[] {
  return Array.from({ length: count }, (_, i) => makeWeek(i + 1));
}

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

interface PlanBuilderState {
  name: string;
  description: string;
  goal: string;
  weeksCount: number;
  isTemplate: boolean;
  weeks: DraftWeek[];
  activeWeek: number;
  setMeta: (patch: Partial<Pick<PlanBuilderState, 'name' | 'description' | 'goal' | 'isTemplate'>>) => void;
  setWeeksCount: (n: number) => void;
  setActiveWeek: (n: number) => void;
  addExercise: (
    week: number,
    day: number,
    ex: { exerciseId: string; name: string; muscleGroup: string },
  ) => void;
  removeExercise: (week: number, day: number, tempId: string) => void;
  updateExercise: (week: number, day: number, tempId: string, patch: Partial<DraftExercise>) => void;
  reorderDay: (week: number, day: number, order: string[]) => void;
  toggleRest: (week: number, day: number) => void;
  setDayLabel: (week: number, day: number, label: string) => void;
  initFrom: (input: PlanDraftInput) => void;
  reset: () => void;
}

function mapWeek<T>(weeks: DraftWeek[], week: number, fn: (w: DraftWeek) => DraftWeek): DraftWeek[] {
  return weeks.map((w) => (w.weekNumber === week ? fn(w) : w));
}
function mapDay(week: DraftWeek, day: number, fn: (d: DraftDay) => DraftDay): DraftWeek {
  return { ...week, days: week.days.map((d) => (d.dayOfWeek === day ? fn(d) : d)) };
}

export const usePlanBuilderStore = create<PlanBuilderState>((set) => ({
  name: '',
  description: '',
  goal: '',
  weeksCount: 4,
  isTemplate: false,
  weeks: makeWeeks(4),
  activeWeek: 1,

  setMeta: (patch) => set((s) => ({ ...s, ...patch })),

  setWeeksCount: (n) =>
    set((s) => {
      const count = Math.max(1, Math.min(52, n));
      const weeks = Array.from({ length: count }, (_, i) => s.weeks[i] ?? makeWeek(i + 1));
      return {
        weeksCount: count,
        weeks,
        activeWeek: Math.min(s.activeWeek, count),
      };
    }),

  setActiveWeek: (n) => set({ activeWeek: n }),

  addExercise: (week, day, ex) =>
    set((s) => ({
      weeks: mapWeek(s.weeks, week, (w) =>
        mapDay(w, day, (d) => ({
          ...d,
          isRest: false,
          exercises: [
            ...d.exercises,
            {
              tempId: uid(),
              exerciseId: ex.exerciseId,
              name: ex.name,
              muscleGroup: ex.muscleGroup,
              sets: '3',
              reps: '10',
              restSeconds: '60',
              notes: '',
            },
          ],
        })),
      ),
    })),

  removeExercise: (week, day, tempId) =>
    set((s) => ({
      weeks: mapWeek(s.weeks, week, (w) =>
        mapDay(w, day, (d) => ({
          ...d,
          exercises: d.exercises.filter((e) => e.tempId !== tempId),
        })),
      ),
    })),

  updateExercise: (week, day, tempId, patch) =>
    set((s) => ({
      weeks: mapWeek(s.weeks, week, (w) =>
        mapDay(w, day, (d) => ({
          ...d,
          exercises: d.exercises.map((e) => (e.tempId === tempId ? { ...e, ...patch } : e)),
        })),
      ),
    })),

  reorderDay: (week, day, order) =>
    set((s) => ({
      weeks: mapWeek(s.weeks, week, (w) =>
        mapDay(w, day, (d) => ({
          ...d,
          exercises: order
            .map((id) => d.exercises.find((e) => e.tempId === id))
            .filter((e): e is DraftExercise => Boolean(e)),
        })),
      ),
    })),

  toggleRest: (week, day) =>
    set((s) => ({
      weeks: mapWeek(s.weeks, week, (w) =>
        mapDay(w, day, (d) => ({ ...d, isRest: !d.isRest, exercises: !d.isRest ? [] : d.exercises })),
      ),
    })),

  setDayLabel: (week, day, label) =>
    set((s) => ({
      weeks: mapWeek(s.weeks, week, (w) => mapDay(w, day, (d) => ({ ...d, label }))),
    })),

  initFrom: (input) =>
    set({
      name: input.name,
      description: input.description,
      goal: input.goal,
      weeksCount: input.weeksCount,
      isTemplate: input.isTemplate,
      weeks: input.weeks.length ? input.weeks : makeWeeks(input.weeksCount),
      activeWeek: 1,
    }),

  reset: () =>
    set({
      name: '',
      description: '',
      goal: '',
      weeksCount: 4,
      isTemplate: false,
      weeks: makeWeeks(4),
      activeWeek: 1,
    }),
}));
