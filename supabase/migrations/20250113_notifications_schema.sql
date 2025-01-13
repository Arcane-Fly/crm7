-- Enable extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users (id),
    org_id uuid REFERENCES public.organizations (id),
    message text NOT NULL,
    type text NOT NULL DEFAULT 'info',
    priority text DEFAULT 'normal',
    broadcast boolean DEFAULT false,
    link_url text,
    related_object_type text,
    related_object_id uuid,
    delivery_method text[] DEFAULT ARRAY['app'],
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    read_at timestamptz,
    CONSTRAINT valid_notification_type CHECK (
        type IN ('info', 'warning', 'error', 'success')
    ),
    CONSTRAINT valid_notification_priority CHECK (
        priority IN ('low', 'normal', 'high', 'urgent')
    ),
    CONSTRAINT valid_delivery_method CHECK (
        delivery_method <@ ARRAY['app', 'email', 'sms']::text[]
    )
);

-- Create index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_unread
    ON public.notifications (user_id)
    WHERE read_at IS NULL;

-- Create index for organization notifications
CREATE INDEX IF NOT EXISTS idx_notifications_org
    ON public.notifications (org_id);

-- Create index for broadcast notifications
CREATE INDEX IF NOT EXISTS idx_notifications_broadcast
    ON public.notifications (broadcast)
    WHERE broadcast = true;

-- User Notification Status (for broadcast notifications)
CREATE TABLE IF NOT EXISTS public.user_notification_status (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    notification_id uuid NOT NULL REFERENCES public.notifications (id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users (id),
    read_at timestamptz,
    created_at timestamptz DEFAULT now(),
    UNIQUE (notification_id, user_id)
);

-- Create index for user notification status
CREATE INDEX IF NOT EXISTS idx_user_notification_status
    ON public.user_notification_status (user_id, read_at);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_status ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY notifications_user_access ON notifications
    FOR SELECT USING (
        user_id = auth.uid()
        OR (
            broadcast = true
            AND EXISTS (
                SELECT 1 FROM user_profiles
                WHERE id = auth.uid()
                AND organization_id = notifications.org_id
            )
        )
    );

CREATE POLICY notifications_admin_access ON notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Create policies for user notification status
CREATE POLICY user_notification_status_access ON user_notification_status
    FOR ALL USING (user_id = auth.uid());

-- Function to handle broadcast notifications
CREATE OR REPLACE FUNCTION handle_broadcast_notification()
RETURNS trigger AS $$
BEGIN
    IF NEW.broadcast THEN
        INSERT INTO user_notification_status (notification_id, user_id)
        SELECT NEW.id, u.id
        FROM auth.users u
        JOIN user_profiles up ON up.id = u.id
        WHERE up.organization_id = NEW.org_id
        ON CONFLICT DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for broadcast notifications
CREATE TRIGGER trigger_handle_broadcast_notification
    AFTER INSERT ON notifications
    FOR EACH ROW
    WHEN (NEW.broadcast = true)
    EXECUTE FUNCTION handle_broadcast_notification();
