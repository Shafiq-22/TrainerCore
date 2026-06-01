#!/usr/bin/env bash
set -euo pipefail

# Regenerate Supabase TypeScript types from the linked project.
# Requires the Supabase CLI (https://supabase.com/docs/guides/cli) and a linked
# project: `supabase link --project-ref <ref>`.

OUT="src/lib/supabase/database.types.ts"
npx supabase gen types typescript --linked > "$OUT"
echo "Wrote $OUT"
