/* eslint-disable no-console */
/**
 * TrainerCore seed script.
 *
 * Creates the demo trainer (demo@trainercore.app / Demo1234!) and a full set of
 * realistic UAE demo data. Idempotent — safe to re-run.
 *
 * Usage: pnpm seed
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (reads .env.local).
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// --- Load .env.local -------------------------------------------------------
function loadEnv() {
  const path = resolve(process.cwd(), '.env.local');
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv();

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !SERVICE_KEY || SERVICE_KEY.includes('your-service-role-key')) {
  console.error(
    '\nMissing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.\n',
  );
  process.exit(1);
}

const supabase = createClient(URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const DEMO_EMAIL = 'demo@trainercore.app';
const DEMO_PASSWORD = 'Demo1234!';
const today = new Date();
const daysAgo = (n: number) => new Date(today.getTime() - n * 86400000);
const iso = (d: Date) => d.toISOString();
const dateStr = (d: Date) => d.toISOString().slice(0, 10);

const EXERCISES: [string, string, string, string][] = [
  ['Barbell Bench Press', 'chest', 'Barbell', 'Lower the bar to mid-chest and press to lockout.'],
  ['Incline Dumbbell Press', 'chest', 'Dumbbells', 'Press dumbbells on a 30-45 degree incline.'],
  ['Push-Up', 'chest', 'Bodyweight', 'Lower the chest to the floor and press up in a straight line.'],
  ['Cable Fly', 'chest', 'Cable Machine', 'Bring both handles together in a hugging arc.'],
  ['Dumbbell Bench Press', 'chest', 'Dumbbells', 'Press dumbbells from chest to lockout.'],
  ['Chest Dip', 'chest', 'Parallel Bars', 'Lean forward and lower to a deep stretch, then press.'],
  ['Machine Chest Press', 'chest', 'Machine', 'Press the handles forward and return under control.'],
  ['Conventional Deadlift', 'back', 'Barbell', 'Hinge and drive through the floor to stand tall.'],
  ['Pull-Up', 'back', 'Pull-Up Bar', 'Pull until the chin clears the bar.'],
  ['Bent-Over Barbell Row', 'back', 'Barbell', 'Row the bar to the lower ribs.'],
  ['Lat Pulldown', 'back', 'Cable Machine', 'Pull the bar to the upper chest.'],
  ['Seated Cable Row', 'back', 'Cable Machine', 'Pull the handle to the abdomen.'],
  ['Single-Arm Dumbbell Row', 'back', 'Dumbbell', 'Row the dumbbell to the hip.'],
  ['Face Pull', 'back', 'Cable Machine', 'Pull the rope to the face, leading with the elbows.'],
  ['Back Squat', 'legs', 'Barbell', 'Squat to parallel and drive up through mid-foot.'],
  ['Front Squat', 'legs', 'Barbell', 'Squat upright with the bar on the front delts.'],
  ['Leg Press', 'legs', 'Machine', 'Lower to 90 degrees then press.'],
  ['Romanian Deadlift', 'legs', 'Barbell', 'Hinge with soft knees and feel the hamstrings.'],
  ['Walking Lunge', 'legs', 'Dumbbells', 'Step into a lunge until the rear knee nearly touches.'],
  ['Leg Extension', 'legs', 'Machine', 'Extend the knees and pause at the top.'],
  ['Lying Leg Curl', 'legs', 'Machine', 'Curl the pad toward the glutes.'],
  ['Standing Calf Raise', 'legs', 'Machine', 'Rise onto the balls of the feet and lower slowly.'],
  ['Overhead Barbell Press', 'shoulders', 'Barbell', 'Press the bar overhead without leaning back.'],
  ['Dumbbell Shoulder Press', 'shoulders', 'Dumbbells', 'Press dumbbells overhead, core tight.'],
  ['Lateral Raise', 'shoulders', 'Dumbbells', 'Raise to shoulder height with a slight bend.'],
  ['Front Raise', 'shoulders', 'Dumbbells', 'Lift forward to shoulder height.'],
  ['Rear Delt Fly', 'shoulders', 'Dumbbells', 'Hinge and raise out to the sides.'],
  ['Arnold Press', 'shoulders', 'Dumbbells', 'Rotate from palms-in to press overhead.'],
  ['Upright Row', 'shoulders', 'Barbell', 'Pull the bar to chest height, elbows leading.'],
  ['Barbell Biceps Curl', 'arms', 'Barbell', 'Curl to shoulder level, elbows pinned.'],
  ['Dumbbell Hammer Curl', 'arms', 'Dumbbells', 'Curl with a neutral grip.'],
  ['Triceps Pushdown', 'arms', 'Cable Machine', 'Push to full extension, elbows tucked.'],
  ['Overhead Triceps Extension', 'arms', 'Dumbbell', 'Lower behind the head and extend.'],
  ['Preacher Curl', 'arms', 'EZ Bar', 'Curl over the pad through a full range.'],
  ['Close-Grip Bench Press', 'arms', 'Barbell', 'Press with a shoulder-width grip.'],
  ['Concentration Curl', 'arms', 'Dumbbell', 'Curl with the elbow braced on the thigh.'],
  ['Plank', 'core', 'Bodyweight', 'Hold a straight line, bracing the abs and glutes.'],
  ['Hanging Leg Raise', 'core', 'Pull-Up Bar', 'Raise the legs to hip height without swinging.'],
  ['Cable Crunch', 'core', 'Cable Machine', 'Crunch the torso down, rounding the abs.'],
  ['Russian Twist', 'core', 'Medicine Ball', 'Rotate the torso side to side.'],
  ['Bicycle Crunch', 'core', 'Bodyweight', 'Alternate elbow to opposite knee.'],
  ['Ab Wheel Rollout', 'core', 'Ab Wheel', 'Roll out keeping the spine neutral.'],
  ['Mountain Climber', 'core', 'Bodyweight', 'Drive the knees toward the chest from a plank.'],
  ['Treadmill Run', 'cardio', 'Treadmill', 'Steady-state or interval running.'],
  ['Rowing Machine', 'cardio', 'Rower', 'Drive with the legs, then pull.'],
  ['Assault Bike', 'cardio', 'Air Bike', 'Push and pull the handles while pedalling.'],
  ['Jump Rope', 'cardio', 'Skipping Rope', 'Maintain a steady bounce from the wrists.'],
  ['Stair Climber', 'cardio', 'Machine', 'Climb at a steady cadence.'],
  ['Battle Ropes', 'cardio', 'Battle Ropes', 'Create waves in a quarter-squat.'],
  ['Burpees', 'cardio', 'Bodyweight', 'Drop to a push-up then explode into a jump.'],
];

const CLIENTS = [
  { full_name: 'Fatima Al Mansoori', email: 'fatima.m@example.ae', phone: '+971501112233', gender: 'female', goal: 'Lose 8kg before summer', package_name: '12-Session Transformation', package_price: 2400, color: '#22C55E', start: 110, height_cm: 165, base_w: 68, delta: 0.45 },
  { full_name: 'Ahmed Khalifa', email: 'ahmed.k@example.ae', phone: '+971502223344', gender: 'male', goal: 'Build muscle and strength', package_name: 'Monthly Unlimited', package_price: 1800, color: '#3B82F6', start: 80, height_cm: 179, base_w: 84, delta: -0.3 },
  { full_name: 'Layla Hassan', email: 'layla.h@example.ae', phone: '+971503334455', gender: 'female', goal: 'Improve mobility and posture', package_name: '8-Session Starter', package_price: 1600, color: '#A855F7', start: 60, height_cm: 168, base_w: 63, delta: 0.2 },
  { full_name: 'Yousef Al Najjar', email: 'yousef.n@example.ae', phone: '+971504445566', gender: 'male', goal: 'Dubai Marathon preparation', package_name: 'Endurance Block', package_price: 2600, color: '#F59E0B', start: 140, height_cm: 182, base_w: 75, delta: 0.15 },
  { full_name: 'Mariam Saeed', email: 'mariam.s@example.ae', phone: '+971505556677', gender: 'female', goal: 'Post-natal strength and fitness', package_name: '10-Session Pack', package_price: 2200, color: '#EF4444', start: 35, height_cm: 162, base_w: 66, delta: 0.4 },
];

async function getTrainerId(): Promise<string> {
  const { data: list } = await supabase.auth.admin.listUsers();
  const existing = list?.users.find((u) => u.email === DEMO_EMAIL);
  if (existing) return existing.id;
  const { data, error } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: 'Omar Haddad' },
  });
  if (error || !data.user) throw error ?? new Error('Failed to create demo user');
  return data.user.id;
}

async function main() {
  console.log('Seeding TrainerCore demo data…');
  const trainerId = await getTrainerId();

  await supabase
    .from('trainers')
    .update({
      full_name: 'Omar Haddad',
      phone: '+971 50 123 4567',
      business_name: 'Peak Performance Coaching',
      vat_number: '100123456700003',
      vat_registered: true,
      address: 'Dubai Marina, Dubai, UAE',
      plan: 'pro',
      subscription_status: 'active',
      onboarding_completed: true,
      onboarding_step: 4,
      bio: 'NASM-certified personal trainer helping clients in Dubai build strength and lasting habits.',
    })
    .eq('id', trainerId);

  // Exercises (global) — only seed if empty
  const { count: exCount } = await supabase
    .from('exercises')
    .select('id', { count: 'exact', head: true });
  if ((exCount ?? 0) === 0) {
    await supabase
      .from('exercises')
      .insert(EXERCISES.map(([name, mg, eq, ins]) => ({ name, muscle_group: mg, equipment: eq, instructions: ins })));
  }

  // Skip the rest if clients already exist
  const { count: clientCount } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('trainer_id', trainerId);
  if ((clientCount ?? 0) > 0) {
    console.log('Demo clients already present — skipping data seed.');
    console.log(`\nDone. Log in with ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
    return;
  }

  for (const c of CLIENTS) {
    const { data: client } = await supabase
      .from('clients')
      .insert({
        trainer_id: trainerId,
        full_name: c.full_name,
        email: c.email,
        phone: c.phone,
        gender: c.gender,
        goal: c.goal,
        package_name: c.package_name,
        package_price: c.package_price,
        color: c.color,
        start_date: dateStr(daysAgo(c.start)),
        height_cm: c.height_cm,
      })
      .select('id')
      .single();
    if (!client) continue;

    const measurements = [];
    for (let g = 0; g < 12; g++) {
      const d = daysAgo(g * 7);
      if (d < daysAgo(c.start)) break;
      measurements.push({
        trainer_id: trainerId,
        client_id: client.id,
        measured_on: dateStr(d),
        weight_kg: Number((c.base_w + g * c.delta).toFixed(1)),
        source: 'manual',
      });
    }
    if (measurements.length) await supabase.from('measurements').insert(measurements);
  }

  // A couple of invoices + sessions for the first client
  const { data: firstClient } = await supabase
    .from('clients')
    .select('id')
    .eq('trainer_id', trainerId)
    .order('created_at')
    .limit(1)
    .single();

  if (firstClient) {
    await supabase.from('invoices').insert({
      trainer_id: trainerId,
      client_id: firstClient.id,
      invoice_number: '',
      status: 'paid',
      issue_date: dateStr(daysAgo(30)),
      line_items: [{ description: 'Training package', quantity: 1, unit_price: 2400 }],
      subtotal: 2400,
      vat_rate: 0.05,
      vat_amount: 120,
      total: 2520,
      paid_at: iso(daysAgo(28)),
    });
    await supabase.from('sessions').insert({
      trainer_id: trainerId,
      client_id: firstClient.id,
      starts_at: `${dateStr(today)}T09:00:00.000Z`,
      ends_at: `${dateStr(today)}T10:00:00.000Z`,
      status: 'scheduled',
      title: 'Full body session',
    });
  }

  console.log(`\nDone. Log in with ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
