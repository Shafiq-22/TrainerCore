-- ============================================================================
-- TrainerCore — 0007 editable WhatsApp message templates
-- Stored per-trainer as JSON; app falls back to code defaults when null.
-- Shape: { "checkin": {"en": "...", "ar": "..."}, "session_reminder": {...}, "invoice_sent": {...} }
-- ============================================================================

alter table trainers add column if not exists message_templates jsonb;
