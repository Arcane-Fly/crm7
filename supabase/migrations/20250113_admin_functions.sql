-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'user')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create function to add columns dynamically
CREATE OR REPLACE FUNCTION add_column_to_table(
  p_table_name text,
  p_column_name text,
  p_column_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has admin role
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ) AND auth.email() != 'braden.lang77@gmail.com' THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can modify schema';
  END IF;

  -- Add the column
  EXECUTE format(
    'ALTER TABLE %I ADD COLUMN IF NOT EXISTS %I %s',
    p_table_name,
    p_column_name,
    p_column_type
  );
END;
$$;

-- Create function to get table schema
CREATE OR REPLACE FUNCTION get_table_schema(p_table_name text)
RETURNS TABLE (
  column_name text,
  data_type text,
  is_nullable boolean
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    column_name::text,
    data_type::text,
    is_nullable::boolean
  FROM information_schema.columns
  WHERE table_name = p_table_name
  AND table_schema = 'public'
  ORDER BY ordinal_position;
$$;
