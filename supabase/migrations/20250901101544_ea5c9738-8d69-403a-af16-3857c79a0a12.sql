-- One-time bootstrap: Create first admin user
-- This will only work when there are no existing admin users

DO $$
DECLARE
  first_user_id uuid;
  admin_count integer;
BEGIN
  -- Check if there are any existing admin users
  SELECT COUNT(*) INTO admin_count 
  FROM public.user_roles 
  WHERE role = 'admin'::app_role;
  
  -- Only proceed if no admin users exist
  IF admin_count = 0 THEN
    -- Get the first user from auth.users (if any exists)
    SELECT id INTO first_user_id 
    FROM auth.users 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- If a user exists, make them admin
    IF first_user_id IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (first_user_id, 'admin'::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
      
      RAISE NOTICE 'Bootstrap: Made user % the first admin', first_user_id;
    ELSE
      RAISE NOTICE 'Bootstrap: No users found to make admin';
    END IF;
  ELSE
    RAISE NOTICE 'Bootstrap: Admin users already exist, skipping bootstrap';
  END IF;
END $$;