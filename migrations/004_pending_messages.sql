-- Migration: Add pending messages support for 60-second response delay
-- Run this in Supabase SQL editor

-- Add pending_response_since to contacts
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS pending_response_since TIMESTAMPTZ;

-- Add gender and pronouns to contacts
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS pronouns TEXT;

-- Create pending_onboarding_messages table
CREATE TABLE IF NOT EXISTS pending_onboarding_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient lookup
CREATE INDEX IF NOT EXISTS idx_pending_messages_contact ON pending_onboarding_messages(contact_id);
CREATE INDEX IF NOT EXISTS idx_pending_messages_received ON pending_onboarding_messages(received_at);
CREATE INDEX IF NOT EXISTS idx_contacts_pending ON contacts(pending_response_since) WHERE pending_response_since IS NOT NULL;
