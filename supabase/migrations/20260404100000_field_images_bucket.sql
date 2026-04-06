-- ==========================================================================
-- Bucket de Supabase Storage para imágenes de canchas
-- ==========================================================================
-- Ejecutar en el SQL Editor de Supabase.
-- Requiere que el servicio "Storage" esté habilitado (viene por defecto).
-- ==========================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'field-images',
  'field-images',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Lectura pública (cualquiera puede ver las imágenes de las canchas)
CREATE POLICY "field_images_public_read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'field-images');

-- Solo admins pueden subir imágenes
CREATE POLICY "field_images_admin_insert"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'field-images'
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.role = 'ADMIN'
    )
  );

-- Solo admins pueden actualizar imágenes
CREATE POLICY "field_images_admin_update"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'field-images'
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.role = 'ADMIN'
    )
  );

-- Solo admins pueden eliminar imágenes
CREATE POLICY "field_images_admin_delete"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'field-images'
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.role = 'ADMIN'
    )
  );
