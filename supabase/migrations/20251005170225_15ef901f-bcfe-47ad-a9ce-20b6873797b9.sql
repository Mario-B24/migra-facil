-- Asignar rol de admin al primer usuario creado (si existe)
DO $$
DECLARE
  first_user_id UUID;
BEGIN
  -- Obtener el ID del primer usuario creado
  SELECT id INTO first_user_id 
  FROM auth.users 
  ORDER BY created_at ASC 
  LIMIT 1;
  
  -- Si existe un usuario y no tiene rol asignado, hacerlo admin
  IF first_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (first_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;